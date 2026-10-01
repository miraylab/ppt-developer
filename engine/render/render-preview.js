import path from 'node:path';
import { access, mkdtemp, readdir, rename, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { root } from '../utils/paths.js';
import { resetPreview } from '../utils/file-system.js';
import { run } from '../utils/process.js';

async function libreOfficeExecutable() {
  if (process.env.SOFFICE_PATH) return process.env.SOFFICE_PATH;
  if (process.platform === 'win32') {
    for (const base of [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean)) {
      const candidate = path.join(base, 'LibreOffice', 'program', 'soffice.exe');
      try { await access(candidate); return candidate; } catch { /* Try PATH next. */ }
    }
  }
  return 'soffice';
}

async function renderWithLibreOffice(pptxPath, paths) {
  const temp = await mkdtemp(path.join(paths.output, '.render-'));
  try {
    const profile = pathToFileURL(path.join(temp, 'profile')).href;
    await run(await libreOfficeExecutable(), [`-env:UserInstallation=${profile}`, '--headless', '--convert-to', 'pdf:impress_pdf_Export', '--outdir', temp, pptxPath], { timeout: 120000 });
    const pdf = path.join(temp, path.basename(pptxPath, '.pptx') + '.pdf');
    await access(pdf);
    await run(process.env.PDFTOPPM_PATH || 'pdftoppm', ['-png', '-scale-to', '1600', pdf, path.join(temp, 'page')], { timeout: 120000 });
    const pages = (await readdir(temp)).filter(name => /^page-\d+\.png$/.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (!pages.length) throw new Error('Poppler não gerou páginas PNG.');
    for (const [index, name] of pages.entries()) {
      await rename(path.join(temp, name), path.join(paths.preview, `slide-${String(index + 1).padStart(2, '0')}.png`));
    }
  } finally {
    if (path.dirname(temp) !== paths.output) throw new Error('Pasta temporária fora de output.');
    await rm(temp, { recursive: true, force: true });
  }
}

export async function renderPreview(pptxPath, paths, config, slideCount) {
  const selected = process.env.PPTX_RENDERER || config.renderer || 'auto';
  if (!['auto', 'powerpoint', 'libreoffice'].includes(selected)) throw new Error(`Renderer inválido: ${selected}`);
  const renderers = selected === 'auto' ? (process.platform === 'win32' ? ['powerpoint', 'libreoffice'] : ['libreoffice']) : [selected];
  const errors = [];
  for (const renderer of renderers) {
    await resetPreview(config.id);
    try {
      console.log(`Rendering preview: ${renderer}...`);
      if (renderer === 'powerpoint') {
        if (process.platform !== 'win32') throw new Error('PowerPoint COM requer Windows.');
        await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'engine/render/powerpoint.ps1'), '-PptxPath', pptxPath, '-OutputPath', paths.preview], { timeout: 120000 });
      } else {
        await renderWithLibreOffice(pptxPath, paths);
      }
      const slides = (await readdir(paths.preview)).filter(name => /^slide-\d+\.png$/.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (slides.length !== slideCount) throw new Error(`Esperados ${slideCount} PNGs, recebidos ${slides.length}.`);
      return { renderer, slides };
    } catch (error) {
      errors.push(`${renderer}: ${error.message}`);
      console.error(`Falha na renderização com ${renderer}.`);
    }
  }
  await resetPreview(config.id);
  throw new Error(`Não foi possível renderizar o PPTX.\n${errors.join('\n')}\nInstale PowerPoint desktop ou LibreOffice + Poppler. Veja README.md e as variáveis SOFFICE_PATH/PDFTOPPM_PATH.`);
}
