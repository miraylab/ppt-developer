import path from 'node:path';
import { mkdir, open, readFile, unlink, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { presentationPaths, brandPath, outputName, defaultPresentation } from '../engine/utils/paths.js';
import { writeManifest } from '../engine/utils/file-system.js';
import { renderPreview } from '../engine/render/render-preview.js';
import { loadStyle } from '../engine/knowledge/load-style.js';
import { createTemplatePresentation } from '../engine/template/create-presentation.js';
import { exportTemplate } from '../engine/template/export-pptx.js';

async function acquireLock(paths) {
  const file = path.join(paths.output, '.build.lock');
  try {
    const handle = await open(file, 'wx');
    await handle.writeFile(String(process.pid));
    await handle.close();
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await readFile(file, 'utf8'));
    if (!Number.isInteger(pid) || pid <= 0) throw new Error(`Lock inválido. Verifique se há build ativo antes de remover ${file}.`);
    try { process.kill(pid, 0); } catch (probe) {
      if (probe.code === 'ESRCH') { await unlink(file); return acquireLock(paths); }
    }
    throw new Error('Já existe um build em execução para esta apresentação. Aguarde sua conclusão.');
  }
  return () => unlink(file);
}

export async function build(id) {
  const paths = presentationPaths(id);
  // Check that the presentation exists before creating output directories.
  const config = { brand: 'michelin', style: 'michelin-dados', engine: 'powerpoint-template', ...(await import(pathToFileURL(paths.config).href)).default };
  if (config.id !== id) throw new Error('O config.id deve ser igual ao nome da pasta da apresentação.');
  if (config.editMode === 'hybrid') throw new Error(`Apresentação híbrida protegida. Use node scripts/edit-slides.js ${id} <slides>, por exemplo 2. O build completo foi bloqueado para preservar edições manuais.`);
  const pptxPath = path.join(paths.output, outputName(config.outputName));
  await mkdir(paths.output, { recursive: true });
  const release = await acquireLock(paths);
  let stage = 'carregar brand';
  try {
    await writeManifest(paths, { status: 'building', title: config.title, slides: [] });
    console.log(`Building: ${id}\nLoading brand: ${config.brand}`);
    const brand = (await import(pathToFileURL(path.join(brandPath(config.brand), 'theme.js')).href)).default;
    stage = 'carregar instruções de estrutura';
    const knowledge = await loadStyle(config.style);
    const theme = knowledge ? knowledge.applyTheme(brand) : brand;
    if (knowledge) console.log(`Loading style: ${config.style}`);
    stage = 'carregar slides';
    const creators = (await import(pathToFileURL(paths.source).href)).default;
    if (!Array.isArray(creators) || creators.length === 0 || creators.some(fn => typeof fn !== 'function')) throw new Error('src/index.js deve exportar uma lista não vazia de funções.');
    if (config.engine !== 'powerpoint-template') throw new Error('A engine suportada é powerpoint-template.');
    const pptx = createTemplatePresentation();
    for (const [index, createSlide] of creators.entries()) {
      stage = `gerar slide ${index + 1}`;
      await createSlide({ pptx, presentation: config, theme, number: index + 1, paths, knowledge });
    }
    stage = 'exportar PPTX';
    console.log('Generating PPTX...');
    if (pptx.getPlan().slides.length !== creators.length) throw new Error('Cada função deve criar exatamente um slide de template.');
    await exportTemplate(pptx, pptxPath, config, paths, brand);
    console.log(`PPTX created successfully: ${pptxPath}`);
    stage = 'renderizar previews';
    const preview = await renderPreview(pptxPath, paths, config, creators.length);
    const version = Date.now();
    await writeFile(path.join(paths.output, 'knowledge-usage.json'), JSON.stringify({ presentation: id, brand: config.brand, style: config.style ?? null, version, usages: knowledge?.getUsages() ?? [] }, null, 2));
    await writeManifest(paths, { status: 'ready', title: config.title, version, outputName: config.outputName, ...preview });
    console.log(`${preview.slides.length} slides generated.\nPreview ready.`);
    return { paths, pptxPath, ...preview };
  } catch (error) {
    const message = `Erro ao ${stage}: ${error.message}`;
    await writeManifest(paths, { status: 'error', error: message, slides: [] });
    throw new Error(message, { cause: error });
  } finally { await release(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  build(process.argv[2] ?? defaultPresentation).catch(error => { console.error(error.message); process.exitCode = 1; });
}
