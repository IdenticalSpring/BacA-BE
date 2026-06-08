# HappyClass production healthcheck

This monitor is designed for the current VPS setup:

- Ubuntu 24.04.2 LTS
- PM2 process `nest-backend`
- PM2 process `my-flask-app`
- API URL `https://api.happyclass.com.vn/`
- Backend TTS health URL `https://api.happyclass.com.vn/homeworks/textToSpeech/health`
- Direct TTS voices URL `http://127.0.0.1:5000/voices`

It is intentionally low risk for production. It does not connect to MySQL, does not run migrations, does not restart services, and does not write inside the application directories. PM2 remains responsible for autorestart; this script only alerts when the failure is serious enough.

## Alert rules

- `nest-backend` restarts 3 times inside 5 minutes: `CRITICAL`
- `my-flask-app` restarts 3 times inside 5 minutes: `CRITICAL`
- a watched PM2 process is not `online` for 60 seconds: `CRITICAL`
- API or TTS endpoint fails for 60 seconds, or 3 checks: `HIGH`/`CRITICAL`
- VPS memory usage is over 70%: `HIGH`
- many new SSH/auth failures in auth logs: `HIGH`

Each issue has a 15 minute cooldown by default, so one repeated failure does not flood Gmail.

## Gmail SMTP choice

The fastest setup is Gmail SMTP with an App Password:

1. Turn on 2-Step Verification for `xpoutsource@gmail.com`.
2. Create an App Password for "Mail".
3. Put that app password in `/etc/happyclass-monitor.env` as `SMTP_PASSWORD`.

Do not put the real Gmail password in the env file.

## Install on VPS

Run these commands on the VPS. They only copy monitor files and add a timer.

```bash
sudo mkdir -p /opt/happyclass-monitor
sudo cp /home/BacA-BE/deployment/monitoring/healthcheck.py /opt/happyclass-monitor/healthcheck.py
sudo cp /home/BacA-BE/deployment/monitoring/happyclass-monitor.env.example /etc/happyclass-monitor.env
sudo chmod 700 /opt/happyclass-monitor
sudo chmod 700 /opt/happyclass-monitor/healthcheck.py
sudo chmod 600 /etc/happyclass-monitor.env
sudo nano /etc/happyclass-monitor.env
```

Set `SMTP_PASSWORD` to the Gmail App Password. Keep the other defaults unless a process name or endpoint changes.

## Dry run first

Dry-run prints what would be emailed and updates local monitor state, but does not send email.

```bash
sudo bash -lc 'set -a; source /etc/happyclass-monitor.env; set +a; python3 /opt/happyclass-monitor/healthcheck.py --dry-run'
```

Send one test email:

```bash
sudo bash -lc 'set -a; source /etc/happyclass-monitor.env; set +a; python3 /opt/happyclass-monitor/healthcheck.py --send-test-email'
```

## Enable automatic checks

```bash
sudo cp /home/BacA-BE/deployment/monitoring/happyclass-healthcheck.service /etc/systemd/system/happyclass-healthcheck.service
sudo cp /home/BacA-BE/deployment/monitoring/happyclass-healthcheck.timer /etc/systemd/system/happyclass-healthcheck.timer
sudo systemctl daemon-reload
sudo systemctl enable --now happyclass-healthcheck.timer
```

Verify:

```bash
systemctl list-timers --all | grep happyclass
journalctl -u happyclass-healthcheck.service -n 80 --no-pager
```

Stop the monitor if needed:

```bash
sudo systemctl disable --now happyclass-healthcheck.timer
```

## Manual checks

These are safe read-only checks:

```bash
pm2 status
pm2 describe nest-backend
pm2 describe my-flask-app
curl -i https://api.happyclass.com.vn/
curl -i https://api.happyclass.com.vn/homeworks/textToSpeech/health
curl -i http://127.0.0.1:5000/voices
free -h
```
