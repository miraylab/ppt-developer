import path from 'node:path';
import os from 'node:os';
import { mkdir, readFile, writeFile, copyFile, rename, open, unlink, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { presentationPaths, brandPath, outputName, root } from '../engine/utils/paths.js';
import { createTemplatePresentation } from '../engine/template/create-presentation.js';
import { exportTemplate } from '../engine/template/export-pptx.js';
import { loadStyle } from '../engine/knowledge/load-style.js';
import { writeManifest } from '../engine/utils/file-system.js';
import { run } from '../engine/utils/process.js';

const hash = data => createHash('sha256').update(data).digest('hex');
export function selectSlides(value, count, protectedSlides = []) {
  if (!/^\d+(,\d+)*$/.test(value ?? '')) throw new Error('Informe slides explicitamente, por exemplo 2 ou 2,3.');
  const selected = value.split(',').map(Number);
  if (new Set(selected).size !== selected.length || selected.some(n => n < 1 || n > count)) throw new Error('Seleção de slides inválida.');
  if (selected.some(n => protectedSlides.includes(n))) throw new Error('A seleção contém slide protegido.');
  return selected;
}
export async function editSlides(id, selection) {
  const paths = presentationPaths(id);
  const config = (await import(pathToFileURL(paths.config).href)).default;
  const creators = (await import(pathToFileURL(paths.source).href)).default;
  const selected = selectSlides(selection, creators.length, config.protectedSlides ?? []);
  const destination = path.join(paths.output, outputName(config.outputName));
  const lock = path.join(paths.output, '.build.lock');
  const handle = await open(lock, 'wx'); await handle.writeFile(String(process.pid)); await handle.close();
  try {
    const revision = path.join(paths.base, 'revisions', new Date().toISOString().replaceAll(':','-') + '-' + selected.join('-'));
    await mkdir(revision, { recursive: true });
    const before = await readFile(destination), beforeHash = hash(before);
    const base = path.join(revision, 'before.pptx'); await writeFile(base, before, { flag: 'wx' });
    const brand = (await import(pathToFileURL(path.join(brandPath(config.brand), 'theme.js')).href)).default;
    const knowledge = await loadStyle(config.style), theme = knowledge.applyTheme(brand), pptx = createTemplatePresentation();
    for (const number of selected) await creators[number-1]({ pptx, knowledge, theme, paths, presentation: config, number });
    const generated = path.join(revision, 'generated.pptx'), candidate = path.join(revision, 'candidate.pptx');
    console.log('Gerando somente slides: ' + selected.join(', '));
    await exportTemplate(pptx, generated, config, { ...paths, output: revision }, brand);
    const bundled = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
    let python = process.env.PYTHON_PATH;
    if (!python) { try { await access(bundled); python = bundled; } catch { python = 'python'; } }
    const preservation = JSON.parse(await run(python, [path.join(root, 'engine/template/replace-slides.py'), base, generated, candidate, selected.join(',')], { timeout: 60000 }));
    if (preservation.slideCount !== creators.length) throw new Error('Ordem/quantidade do PPTX mudou. Remapear antes de editar.');
    for (const [file, folder] of [[base,'before-preview'],[candidate,'preview']]) {
      const output = path.join(revision, folder); await mkdir(output);
      await run('powershell.exe', ['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(root,'engine/render/powerpoint.ps1'),'-PptxPath',file,'-OutputPath',output], { timeout: 120000 });
    }
    for (let n=1; n<=creators.length; n++) if (!selected.includes(n)) {
      const name = `slide-${String(n).padStart(2,'0')}.png`;
      if (hash(await readFile(path.join(revision,'before-preview',name))) !== hash(await readFile(path.join(revision,'preview',name)))) throw new Error(`Slide ${n} mudou visualmente. Publicação cancelada.`);
    }
    // Detecta um salvamento manual durante o trabalho. Não publica sobre conteúdo novo.
    if (hash(await readFile(destination)) !== beforeHash) throw new Error('PPTX alterado durante a edição. Candidato guardado, arquivo manual preservado.');
    const publishing = path.join(paths.output, '.hybrid-publishing.pptx'); await copyFile(candidate, publishing);
    if (hash(await readFile(destination)) !== beforeHash) { await unlink(publishing); throw new Error('Salvamento concorrente detectado.'); }
    await rename(publishing, destination);
    const slides = [];
    await mkdir(paths.preview, { recursive: true });
    for (let n=1;n<=creators.length;n++) { const name=`slide-${String(n).padStart(2,'0')}.png`; slides.push(name); await copyFile(path.join(revision,'preview',name),path.join(paths.preview,name)); }
    const version=Date.now();
    const report={ ...preservation, protectedSlides:config.protectedSlides, beforeHash, afterHash:hash(await readFile(destination)), unchangedSlidesVisualMatch:true, revision:path.relative(root,revision), usages:knowledge.getUsages() };
    await writeFile(path.join(revision,'report.json'),JSON.stringify(report,null,2));
    await writeFile(path.join(paths.output,'hybrid-report.json'),JSON.stringify(report,null,2));
    await writeManifest(paths,{status:'ready',title:config.title,version,outputName:config.outputName,renderer:'powerpoint',slides});
    console.log('Edição publicada. Outros slides preservados. Revisão: '+revision);
  } finally { await unlink(lock); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) editSlides(process.argv[2],process.argv[3]).catch(e=>{console.error(e.message);process.exitCode=1;});
