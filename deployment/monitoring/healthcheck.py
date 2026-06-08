#!/usr/bin/env python3
"""HappyClass production healthcheck.

This script is intentionally read-only for application state:
- reads PM2 process metadata and logs
- calls HTTP health endpoints
- reads host memory and optional auth logs
- sends email alerts through SMTP

It does not connect to MySQL and does not restart services.
"""

import argparse
import json
import os
import re
import shutil
import smtplib
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


SEVERITY_RANK = {"INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}


@dataclass
class Alert:
    key: str
    severity: str
    component: str
    title: str
    problem: str
    error: str
    impact: str
    steps: List[str]
    logs: List[str]
    actions: List[str]


def env(name: str, default: str = "") -> str:
    value = os.getenv(name)
    return default if value is None or value == "" else value


def env_int(name: str, default: int) -> int:
    raw = env(name, str(default))
    try:
        return int(raw)
    except ValueError:
        return default


def env_float(name: str, default: float) -> float:
    raw = env(name, str(default))
    try:
        return float(raw)
    except ValueError:
        return default


def env_bool(name: str, default: bool) -> bool:
    raw = env(name, "true" if default else "false").strip().lower()
    return raw in {"1", "true", "yes", "y", "on"}


def now_utc() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def load_state(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(path: Path, state: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


def run_command(args: List[str], timeout_seconds: int) -> Tuple[int, str, str]:
    try:
        result = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
        return result.returncode, result.stdout, result.stderr
    except Exception as exc:
        return 1, "", str(exc)


def tail_file(path: str, max_lines: int, max_bytes: int = 65536) -> str:
    if not path:
        return ""

    file_path = Path(path)
    if not file_path.exists():
        return f"(log file missing: {path})"

    try:
        with file_path.open("rb") as handle:
            handle.seek(0, os.SEEK_END)
            size = handle.tell()
            handle.seek(max(0, size - max_bytes))
            data = handle.read()
        text = data.decode("utf-8", errors="replace")
        lines = text.splitlines()[-max_lines:]
        return "\n".join(lines)
    except Exception as exc:
        return f"(unable to read {path}: {exc})"


def compact(text: str, max_chars: int = 6000) -> str:
    if len(text) <= max_chars:
        return text
    return text[-max_chars:]


def get_pm2_bin() -> str:
    configured = env("PM2_BIN")
    if configured:
        return configured
    return shutil.which("pm2") or "/usr/local/bin/pm2"


def get_pm2_processes(timeout_seconds: int) -> Tuple[Optional[List[Dict[str, Any]]], str]:
    pm2_bin = get_pm2_bin()
    code, stdout, stderr = run_command([pm2_bin, "jlist"], timeout_seconds)
    if code != 0:
        return None, stderr.strip() or stdout.strip() or f"{pm2_bin} jlist failed"
    try:
        parsed = json.loads(stdout)
        if isinstance(parsed, list):
            return parsed, ""
        return None, "pm2 jlist did not return a list"
    except Exception as exc:
        return None, f"failed to parse pm2 jlist: {exc}"


def find_process(processes: List[Dict[str, Any]], name: str) -> Optional[Dict[str, Any]]:
    for process in processes:
        if process.get("name") == name:
            return process
    return None


def process_summary(process: Dict[str, Any]) -> Dict[str, Any]:
    pm2_env = process.get("pm2_env") or {}
    monit = process.get("monit") or {}
    return {
        "name": process.get("name"),
        "pid": process.get("pid"),
        "status": pm2_env.get("status"),
        "restart_time": pm2_env.get("restart_time", 0),
        "unstable_restarts": pm2_env.get("unstable_restarts", 0),
        "uptime_ms": pm2_env.get("pm_uptime"),
        "cwd": pm2_env.get("pm_cwd"),
        "exec_path": pm2_env.get("pm_exec_path"),
        "error_log": pm2_env.get("pm_err_log_path"),
        "out_log": pm2_env.get("pm_out_log_path"),
        "cpu": monit.get("cpu"),
        "memory_bytes": monit.get("memory"),
    }


def collect_process_logs(summary: Dict[str, Any], log_lines: int) -> List[str]:
    logs: List[str] = []
    err_log = tail_file(str(summary.get("error_log") or ""), log_lines)
    out_log = tail_file(str(summary.get("out_log") or ""), max(10, log_lines // 2))
    if err_log:
        logs.append(f"--- PM2 error log: {summary.get('error_log')} ---\n{compact(err_log)}")
    if out_log:
        logs.append(f"--- PM2 out log: {summary.get('out_log')} ---\n{compact(out_log)}")
    return logs


def check_process(
    processes: List[Dict[str, Any]],
    state: Dict[str, Any],
    process_name: str,
    component: str,
    severity: str,
    now_ts: int,
) -> List[Alert]:
    alerts: List[Alert] = []
    restart_threshold = env_int("RESTART_THRESHOLD", 3)
    restart_window = env_int("RESTART_WINDOW_SECONDS", 300)
    process_down_seconds = env_int("PROCESS_DOWN_SECONDS", 60)
    log_lines = env_int("LOG_LINES", 80)

    process_states = state.setdefault("processes", {})
    process_state = process_states.setdefault(process_name, {})
    process = find_process(processes, process_name)

    if not process:
        missing_since = int(process_state.get("missing_since") or now_ts)
        process_state["missing_since"] = missing_since
        if now_ts - missing_since >= process_down_seconds:
            alerts.append(
                Alert(
                    key=f"process-missing:{process_name}",
                    severity=severity,
                    component=component,
                    title=f"PM2 process missing: {process_name}",
                    problem=f"PM2 does not list process '{process_name}'.",
                    error="Process not found in pm2 jlist.",
                    impact="The production component may be fully stopped and PM2 cannot autorestart it.",
                    steps=[
                        "Ran pm2 jlist.",
                        f"Could not find process name '{process_name}'.",
                        f"Missing duration: {now_ts - missing_since}s.",
                    ],
                    logs=[],
                    actions=[
                        f"Run: pm2 status",
                        f"Run: pm2 logs {process_name} --lines 200",
                        "Confirm whether the process was renamed, deleted, or failed to start.",
                    ],
                )
            )
        return alerts

    process_state.pop("missing_since", None)
    summary = process_summary(process)
    status = str(summary.get("status") or "unknown")
    restart_time = int(summary.get("restart_time") or 0)
    previous_restart_time = process_state.get("restart_time")
    restart_events = [
        int(item)
        for item in process_state.get("restart_events", [])
        if isinstance(item, int) and now_ts - int(item) <= restart_window
    ]

    if previous_restart_time is None:
        process_state["restart_time"] = restart_time
    elif restart_time > int(previous_restart_time):
        increment = min(restart_time - int(previous_restart_time), 10)
        restart_events.extend([now_ts] * increment)
        process_state["restart_time"] = restart_time
    elif restart_time < int(previous_restart_time):
        process_state["restart_time"] = restart_time
        restart_events = []

    process_state["restart_events"] = restart_events

    if len(restart_events) >= restart_threshold:
        alerts.append(
            Alert(
                key=f"restart-flap:{process_name}",
                severity=severity,
                component=component,
                title=f"{process_name} restarted {len(restart_events)} times",
                problem=f"PM2 restart count increased at least {restart_threshold} times inside {restart_window}s.",
                error=f"restart_time={restart_time}, recent_restart_events={len(restart_events)}",
                impact="Users may see intermittent production failures while PM2 repeatedly recovers the service.",
                steps=[
                    "Ran pm2 jlist.",
                    f"Previous restart_time: {previous_restart_time}. Current restart_time: {restart_time}.",
                    f"Recent restart events in window: {len(restart_events)}.",
                    f"PM2 status: {status}. PID: {summary.get('pid')}.",
                ],
                logs=collect_process_logs(summary, log_lines),
                actions=[
                    f"Run: pm2 logs {process_name} --lines 300",
                    f"Run: pm2 describe {process_name}",
                    "Check the error log first; do not restart database services unless DB-specific evidence exists.",
                ],
            )
        )

    if status != "online":
        down_since = int(process_state.get("down_since") or now_ts)
        process_state["down_since"] = down_since
        if now_ts - down_since >= process_down_seconds:
            alerts.append(
                Alert(
                    key=f"process-down:{process_name}",
                    severity=severity,
                    component=component,
                    title=f"{process_name} is not online",
                    problem=f"PM2 reports status '{status}' for process '{process_name}'.",
                    error=f"status={status}",
                    impact="The production component is unavailable or degraded.",
                    steps=[
                        "Ran pm2 jlist.",
                        f"Status has not been online for {now_ts - down_since}s.",
                        f"PM2 restart_time: {restart_time}.",
                    ],
                    logs=collect_process_logs(summary, log_lines),
                    actions=[
                        f"Run: pm2 logs {process_name} --lines 300",
                        f"Run: pm2 describe {process_name}",
                        "Only manually restart after reading the latest error lines.",
                    ],
                )
            )
    else:
        process_state.pop("down_since", None)

    return alerts


def http_check(url: str, expected_text: str, timeout_seconds: int) -> Tuple[bool, str, str]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "happyclass-healthcheck/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            status = response.getcode()
            body = response.read(4096).decode("utf-8", errors="replace")
            if status < 200 or status >= 300:
                return False, f"HTTP {status}", body
            if expected_text and expected_text not in body:
                return False, f"HTTP {status}, missing expected text '{expected_text}'", body
            return True, f"HTTP {status}", body
    except urllib.error.HTTPError as exc:
        body = exc.read(4096).decode("utf-8", errors="replace")
        return False, f"HTTP {exc.code}", body
    except Exception as exc:
        return False, str(exc), ""


def check_endpoint(
    state: Dict[str, Any],
    key: str,
    component: str,
    severity: str,
    url: str,
    expected_text: str,
    now_ts: int,
) -> List[Alert]:
    alerts: List[Alert] = []
    if not url:
        return alerts

    timeout_seconds = env_int("HTTP_TIMEOUT_SECONDS", 10)
    fail_seconds = env_int("ENDPOINT_FAIL_SECONDS", 60)
    fail_count_threshold = env_int("ENDPOINT_FAIL_COUNT", 3)
    endpoint_states = state.setdefault("endpoints", {})
    endpoint_state = endpoint_states.setdefault(key, {})

    ok, error, body = http_check(url, expected_text, timeout_seconds)
    if ok:
        endpoint_state["last_ok"] = now_ts
        endpoint_state["fail_count"] = 0
        endpoint_state.pop("fail_since", None)
        endpoint_state.pop("last_error", None)
        return alerts

    fail_since = int(endpoint_state.get("fail_since") or now_ts)
    fail_count = int(endpoint_state.get("fail_count") or 0) + 1
    endpoint_state["fail_since"] = fail_since
    endpoint_state["fail_count"] = fail_count
    endpoint_state["last_error"] = error
    duration = now_ts - fail_since

    if fail_count >= fail_count_threshold or duration >= fail_seconds:
        alerts.append(
            Alert(
                key=f"endpoint-fail:{key}",
                severity=severity,
                component=component,
                title=f"Health endpoint failed: {key}",
                problem=f"Endpoint check failed for {url}.",
                error=error,
                impact="A production feature may be unavailable even if the PM2 process still appears online.",
                steps=[
                    f"Requested: {url}",
                    f"Expected text: {expected_text or '(status 2xx only)'}",
                    f"Fail count: {fail_count}. Fail duration: {duration}s.",
                    f"Response sample: {compact(body, 1200) or '(empty response)'}",
                ],
                logs=[],
                actions=[
                    "Check PM2 process status and logs for the related component.",
                    "Check nginx only if the public API URL fails but local service still works.",
                    "Avoid database actions unless backend logs show DB connection errors.",
                ],
            )
        )

    return alerts


def read_memory_percent() -> Optional[Tuple[float, int, int]]:
    meminfo: Dict[str, int] = {}
    try:
        for line in Path("/proc/meminfo").read_text(encoding="utf-8").splitlines():
            parts = line.split()
            if len(parts) >= 2:
                meminfo[parts[0].rstrip(":")] = int(parts[1]) * 1024
    except Exception:
        return None

    total = meminfo.get("MemTotal")
    available = meminfo.get("MemAvailable")
    if not total or available is None:
        return None

    used = total - available
    percent = used * 100.0 / total
    return percent, used, total


def check_memory() -> List[Alert]:
    threshold = env_float("MEMORY_THRESHOLD_PERCENT", 70.0)
    memory = read_memory_percent()
    if not memory:
        return []

    percent, used, total = memory
    if percent < threshold:
        return []

    return [
        Alert(
            key="host-memory-high",
            severity="HIGH",
            component="vps-memory",
            title=f"VPS memory usage is {percent:.1f}%",
            problem=f"Memory usage is above configured threshold {threshold:.1f}%.",
            error=f"used={used} bytes, total={total} bytes",
            impact="The VPS may start swapping, become slow, or trigger OOM kills for backend/TTS.",
            steps=[
                "Read /proc/meminfo.",
                f"Calculated memory usage: {percent:.1f}%.",
                f"Threshold: {threshold:.1f}%.",
            ],
            logs=[],
            actions=[
                "Run: free -h",
                "Run: pm2 monit",
                "Check whether my-flask-app memory keeps growing.",
            ],
        )
    ]


def read_new_auth_lines(state: Dict[str, Any], path: Path, max_bytes: int) -> List[str]:
    security_state = state.setdefault("security", {}).setdefault(str(path), {})
    try:
        stat = path.stat()
    except Exception:
        return []

    inode = stat.st_ino
    size = stat.st_size
    previous_inode = security_state.get("inode")
    previous_offset = security_state.get("offset")

    if previous_inode != inode or previous_offset is None or int(previous_offset) > size:
        security_state["inode"] = inode
        security_state["offset"] = size
        return []

    start = max(0, int(previous_offset))
    read_size = min(max_bytes, size - start)
    if read_size <= 0:
        security_state["offset"] = size
        return []

    with path.open("rb") as handle:
        handle.seek(size - read_size if size - start > max_bytes else start)
        data = handle.read(read_size)

    security_state["inode"] = inode
    security_state["offset"] = size
    return data.decode("utf-8", errors="replace").splitlines()


def check_security_logs(state: Dict[str, Any]) -> List[Alert]:
    if not env_bool("SECURITY_CHECK_ENABLED", True):
        return []

    paths = [
        Path(item.strip())
        for item in env("AUTH_LOG_PATHS", "/var/log/auth.log,/var/log/secure").split(",")
        if item.strip()
    ]
    threshold = env_int("SECURITY_FAILED_SSH_THRESHOLD", 30)
    max_bytes = env_int("SECURITY_LOG_READ_MAX_BYTES", 1048576)
    failed_pattern = re.compile(
        r"(Failed password|Invalid user|authentication failure|Connection closed by invalid user)",
        re.IGNORECASE,
    )
    breakin_pattern = re.compile(r"(POSSIBLE BREAK-IN ATTEMPT|Accepted password for root)", re.IGNORECASE)

    failed_lines: List[str] = []
    severe_lines: List[str] = []

    for path in paths:
        if not path.exists():
            continue
        try:
            lines = read_new_auth_lines(state, path, max_bytes)
        except Exception:
            continue
        for line in lines:
            if failed_pattern.search(line):
                failed_lines.append(line)
            if breakin_pattern.search(line):
                severe_lines.append(line)

    if len(failed_lines) < threshold and not severe_lines:
        return []

    sample_lines = (severe_lines + failed_lines)[-80:]
    reason = (
        f"{len(failed_lines)} new failed SSH/auth events"
        if len(failed_lines) >= threshold
        else "severe SSH/auth pattern detected"
    )
    return [
        Alert(
            key="security-auth-log",
            severity="HIGH",
            component="security",
            title="Suspicious authentication activity",
            problem=reason,
            error=f"failed_events={len(failed_lines)}, severe_events={len(severe_lines)}",
            impact="The VPS may be under brute-force attack or has a suspicious root login pattern.",
            steps=[
                "Read only new lines from auth logs since the previous healthcheck run.",
                f"Failed auth threshold: {threshold}.",
                f"Failed auth events in new log segment: {len(failed_lines)}.",
                f"Severe auth events in new log segment: {len(severe_lines)}.",
            ],
            logs=["--- auth log sample ---\n" + "\n".join(sample_lines)],
            actions=[
                "Run: tail -n 200 /var/log/auth.log",
                "Check active SSH sessions with: who",
                "Consider firewall/rate limiting after confirming the source.",
            ],
        )
    ]


def should_send(alert: Alert, state: Dict[str, Any], now_ts: int) -> bool:
    cooldown_seconds = env_int("ALERT_COOLDOWN_SECONDS", 900)
    alerts_state = state.setdefault("alerts", {})
    last_sent = int(alerts_state.get(alert.key) or 0)
    if last_sent and now_ts - last_sent < cooldown_seconds:
        return False
    alerts_state[alert.key] = now_ts
    return True


def render_alert_body(alerts: List[Alert]) -> str:
    lines: List[str] = []
    highest = max(alerts, key=lambda item: SEVERITY_RANK.get(item.severity, 0))
    lines.extend(
        [
            f"HappyClass production alert",
            f"Host: {socket.gethostname()}",
            f"Time UTC: {now_utc()}",
            f"Highest severity: {highest.severity}",
            f"Issue count: {len(alerts)}",
            "",
        ]
    )

    for index, alert in enumerate(alerts, 1):
        lines.extend(
            [
                f"== Issue {index}: {alert.title} ==",
                f"Severity: {alert.severity}",
                f"Component: {alert.component}",
                f"Problem: {alert.problem}",
                f"Error: {alert.error}",
                f"Production impact: {alert.impact}",
                "",
                "Observed steps before alert:",
            ]
        )
        lines.extend(f"- {step}" for step in alert.steps)
        lines.extend(["", "Recommended actions:"])
        lines.extend(f"- {action}" for action in alert.actions)
        if alert.logs:
            lines.extend(["", "Recent logs/evidence:"])
            for log_block in alert.logs:
                lines.extend([compact(log_block), ""])
        lines.append("")

    return "\n".join(lines).strip() + "\n"


def send_email(subject: str, body: str) -> None:
    smtp_host = env("SMTP_HOST", "smtp.gmail.com")
    smtp_port = env_int("SMTP_PORT", 587)
    smtp_user = env("SMTP_USER")
    smtp_password = env("SMTP_PASSWORD")
    mail_from = env("ALERT_EMAIL_FROM", smtp_user)
    mail_to = env("ALERT_EMAIL_TO", "xpoutsource@gmail.com")

    missing = [
        name
        for name, value in {
            "SMTP_USER": smtp_user,
            "SMTP_PASSWORD": smtp_password,
            "ALERT_EMAIL_FROM": mail_from,
            "ALERT_EMAIL_TO": mail_to,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"SMTP is not configured. Missing: {', '.join(missing)}")

    message = EmailMessage()
    message["From"] = mail_from
    message["To"] = mail_to
    message["Subject"] = subject
    message.set_content(body)

    if smtp_port == 465:
        context = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20)
    else:
        context = smtplib.SMTP(smtp_host, smtp_port, timeout=20)

    with context as smtp:
        if smtp_port != 465 and env_bool("SMTP_STARTTLS", True):
            smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)


def build_subject(alerts: List[Alert]) -> str:
    highest = max(alerts, key=lambda item: SEVERITY_RANK.get(item.severity, 0))
    first = alerts[0]
    return f"[HappyClass][{highest.severity}] {first.title}"


def send_test_email() -> None:
    subject = "[HappyClass][TEST] Healthcheck email test"
    body = "\n".join(
        [
            "HappyClass healthcheck email is configured.",
            f"Host: {socket.gethostname()}",
            f"Time UTC: {now_utc()}",
            "This test does not check PM2, endpoints, or database.",
            "",
        ]
    )
    send_email(subject, body)


def collect_alerts(state: Dict[str, Any], now_ts: int) -> List[Alert]:
    alerts: List[Alert] = []
    timeout_seconds = env_int("COMMAND_TIMEOUT_SECONDS", 10)
    processes, pm2_error = get_pm2_processes(timeout_seconds)

    if processes is None:
        alerts.append(
            Alert(
                key="pm2-jlist-failed",
                severity="CRITICAL",
                component="pm2",
                title="PM2 status check failed",
                problem="The monitor could not read PM2 process status.",
                error=pm2_error,
                impact="Backend/TTS autorestart status is unknown; production may be unprotected or down.",
                steps=["Ran pm2 jlist.", "The command failed or returned invalid JSON."],
                logs=[],
                actions=[
                    "Run: which pm2",
                    "Run: pm2 status",
                    "Check whether PM2 is installed for the root user.",
                ],
            )
        )
    else:
        backend_name = env("BACKEND_PM2_NAME", "nest-backend")
        tts_name = env("TTS_PM2_NAME", "my-flask-app")
        alerts.extend(check_process(processes, state, backend_name, "backend", "CRITICAL", now_ts))
        alerts.extend(check_process(processes, state, tts_name, "tts", "CRITICAL", now_ts))

    alerts.extend(
        check_endpoint(
            state,
            "backend-root",
            "backend",
            "CRITICAL",
            env("BACKEND_ROOT_URL", "https://api.happyclass.com.vn/"),
            env("BACKEND_ROOT_EXPECTED_TEXT", ""),
            now_ts,
        )
    )
    alerts.extend(
        check_endpoint(
            state,
            "backend-tts-health",
            "tts",
            "HIGH",
            env("BACKEND_TTS_HEALTH_URL", "https://api.happyclass.com.vn/homeworks/textToSpeech/health"),
            env("BACKEND_TTS_HEALTH_EXPECTED_TEXT", "ok"),
            now_ts,
        )
    )
    alerts.extend(
        check_endpoint(
            state,
            "direct-tts-voices",
            "tts",
            "HIGH",
            env("DIRECT_TTS_VOICES_URL", "http://127.0.0.1:5000/voices"),
            env("DIRECT_TTS_EXPECTED_TEXT", "voices"),
            now_ts,
        )
    )
    alerts.extend(check_memory())
    alerts.extend(check_security_logs(state))
    return alerts


def main() -> int:
    parser = argparse.ArgumentParser(description="HappyClass production healthcheck")
    parser.add_argument("--dry-run", action="store_true", help="Print alerts instead of sending email")
    parser.add_argument("--send-test-email", action="store_true", help="Send a test email and exit")
    args = parser.parse_args()

    if args.send_test_email:
        send_test_email()
        print("test email sent")
        return 0

    state_path = Path(env("STATE_FILE", "/var/tmp/happyclass-health-state.json"))
    state = load_state(state_path)
    now_ts = int(time.time())

    alerts = collect_alerts(state, now_ts)
    sendable_alerts = [alert for alert in alerts if args.dry_run or should_send(alert, state, now_ts)]

    if sendable_alerts:
        subject = build_subject(sendable_alerts)
        body = render_alert_body(sendable_alerts)
        if args.dry_run:
            print(subject)
            print(body)
        else:
            send_email(subject, body)
            print(f"sent {len(sendable_alerts)} alert(s): {subject}")
    else:
        print(f"ok: no unsuppressed critical/high alerts at {now_utc()}")

    save_state(state_path, state)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print(f"healthcheck failed: {exc}", file=sys.stderr)
        sys.exit(1)
