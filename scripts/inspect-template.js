import path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { root, brandPath, presentationPaths, templatePath, defaultPresentation } from '../engine/utils/paths.js';
import { run } from '../engine/utils/process.js';

try {
  if (process.platform !== 'win32') throw new Error('A inspeção nativa requer Windows e PowerPoint desktop.');
  const paths = presentationPaths(process.argv[2] ?? defaultPresentation);
  const config = { brand: 'michelin', ...(await import(pathToFileURL(paths.config).href)).default };
  const brand = (await import(pathToFileURL(path.join(brandPath(config.brand), 'theme.js')).href)).default;
  await mkdir(paths.output, { recursive: true });
  await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'engine/template/inspect.ps1'), '-TemplatePath', templatePath(config.template ?? brand.template), '-OutputPath', paths.output], { timeout: 120000 });
  const inventoryFile = path.join(paths.output, 'template-inventory.json');
  const inventory = JSON.parse(await readFile(inventoryFile, 'utf8'));
  console.log(`${inventory.slides.length} slides, ${inventory.masters.length} mestres, ${inventory.masters.reduce((sum, master) => sum + master.layouts.length, 0)} layouts.\nInventário: ${inventoryFile}\nReferências: ${path.join(paths.output, 'reference-preview')}`);
} catch (error) { console.error(`Erro ao inspecionar template: ${error.message}`); process.exitCode = 1; }
