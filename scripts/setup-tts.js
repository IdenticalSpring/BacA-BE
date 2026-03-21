const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const venvDir = path.join(projectRoot, '.venv_tts');
const requirementsFile = path.join(projectRoot, 'scripts', 'requirements-tts.txt');

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });
}

function existsPython(cmd, args = ['--version']) {
  const result = spawnSync(cmd, args, { stdio: 'ignore', shell: false });
  return result.status === 0;
}

function pickSystemPython() {
  if (existsPython('python3')) {
    return 'python3';
  }

  if (existsPython('python')) {
    return 'python';
  }

  if (process.platform === 'win32' && existsPython('py', ['-3', '--version'])) {
    return 'py -3';
  }

  return null;
}

function getVenvPythonPath() {
  if (process.platform === 'win32') {
    return path.join(venvDir, 'Scripts', 'python.exe');
  }

  return path.join(venvDir, 'bin', 'python');
}

function main() {
  if (!fs.existsSync(requirementsFile)) {
    console.log('[setup-tts] requirements file not found, skipping.');
    process.exit(0);
  }

  const systemPython = pickSystemPython();
  if (!systemPython) {
    console.warn('[setup-tts] Python is not installed. Skipping TTS dependency install.');
    process.exit(0);
  }

  const venvPython = getVenvPythonPath();

  if (!fs.existsSync(venvPython)) {
    console.log(`[setup-tts] Creating virtualenv at ${venvDir} ...`);

    const createVenvResult =
      systemPython === 'py -3'
        ? run('py', ['-3', '-m', 'venv', venvDir])
        : run(systemPython, ['-m', 'venv', venvDir]);

    if (createVenvResult.status !== 0) {
      console.warn('[setup-tts] Failed to create virtualenv. Skipping TTS dependency install.');
      process.exit(0);
    }
  }

  console.log('[setup-tts] Installing edge-tts and gTTS into .venv_tts ...');
  const installResult = run(venvPython, ['-m', 'pip', 'install', '-r', requirementsFile]);

  if (installResult.status !== 0) {
    console.warn('[setup-tts] Failed to install Python TTS dependencies. Continuing without blocking npm install.');
    process.exit(0);
  }

  console.log('[setup-tts] TTS dependencies installed successfully.');
  console.log(`[setup-tts] Set TTS_PYTHON_BIN=${venvPython} in .env for production.`);
}

main();
