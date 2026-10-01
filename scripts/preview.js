import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { startServer } from '../viewer/server.js';
import { run } from '../engine/utils/process.js';
import { defaultPresentation } from '../engine/utils/paths.js';

export async function openBrowser(url) {
  if (process.env.NO_OPEN === '1') return;
  try {
    if (process.platform === 'win32') await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Start-Process -WindowStyle Hidden '${url}'`]);
    else await run(process.platform === 'darwin' ? 'open' : 'xdg-open', [url]);
  } catch (error) { console.warn(`Abra o endereço manualmente: ${url}\n${error.message}`); }
}
export async function preview(id) {
  const result = await startServer(id);
  await openBrowser(result.url);
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  preview(process.argv[2] ?? defaultPresentation).catch(error => { console.error(`Erro no viewer: ${error.message}`); process.exitCode = 1; });
}
