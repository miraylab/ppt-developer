import path from 'node:path';
import { copyFile, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { root, templatePath } from '../utils/paths.js';
import { run } from '../utils/process.js';

export async function exportTemplate(pptx, fileName, config, paths, brand) {
  if (process.platform !== 'win32') throw new Error('A engine powerpoint-template requer PowerPoint desktop no Windows.');
  const source = templatePath(config.template ?? brand.template);
  if (source.toLowerCase() === fileName.toLowerCase()) throw new Error('O output não pode sobrescrever o template.');
  const plan = pptx.getPlan();
  if (!plan.slides.length) throw new Error('O plano do template está vazio.');
  const templateHash = createHash('sha256').update(await readFile(source)).digest('hex');
  const temp = await mkdtemp(path.join(paths.output, '.template-'));
  try {
    const copy = path.join(temp, 'working.pptx');
    const planPath = path.join(temp, 'plan.json');
    const generated = path.join(temp, 'generated.pptx');
    await copyFile(source, copy);
    await writeFile(planPath, JSON.stringify(plan));
    await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'engine/template/build.ps1'), '-WorkingPath', copy, '-PlanPath', planPath, '-OutputPath', generated], { timeout: 120000 });
    await rename(generated, fileName);
    await writeFile(path.join(paths.output, 'template-build.json'), JSON.stringify({ template: path.relative(root, source), sha256: templateHash, ...plan }, null, 2));
  } finally {
    if (path.dirname(temp) !== paths.output) throw new Error('Temporários fora de output.');
    await rm(temp, { recursive: true, force: true });
  }
}
