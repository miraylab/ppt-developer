import { spawn } from 'node:child_process';

export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, shell: false, ...options });
    let errors = '';
    child.stderr?.on('data', chunk => { errors += chunk; });
    child.stdout?.on('data', chunk => { errors += chunk; });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve(errors) : reject(new Error(`${command} terminou com código ${code}. ${errors}`)));
  });
}
