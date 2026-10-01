import path from 'node:path';
import chokidar from 'chokidar';
import { root, presentationPaths, instructionsRoot, brandPath, templatePath, defaultPresentation } from '../engine/utils/paths.js';
import { pathToFileURL } from 'node:url';
import { run } from '../engine/utils/process.js';
import { startServer } from '../viewer/server.js';
import { openBrowser } from './preview.js';

const id = process.argv[2] ?? defaultPresentation;
async function dev() {
  const paths = presentationPaths(id);
  const { server, url } = await startServer(id);
  let running = false, pending = false, timer, stopping = false, watchedTemplate;
  async function watchTemplate() {
    const revision = `?watch=${Date.now()}`;
    const config = { brand: 'michelin', engine: 'powerpoint-template', ...(await import(pathToFileURL(paths.config).href + revision)).default };
    let next;
    if (config.engine === 'powerpoint-template') {
      const brand = (await import(pathToFileURL(path.join(brandPath(config.brand), 'theme.js')).href + revision)).default;
      next = templatePath(config.template ?? brand.template);
    }
    if (watchedTemplate && watchedTemplate !== next) await watcher.unwatch(watchedTemplate);
    if (next && next !== watchedTemplate) watcher.add(next);
    watchedTemplate = next;
  }
  async function rebuild() {
    if (stopping) return;
    if (running) { pending = true; return; }
    running = true;
    do {
      pending = false;
      try {
        await watchTemplate();
        // A fresh process reloads the complete ES module dependency graph.
        await run(process.execPath, [path.join(root, 'scripts/build.js'), id], { stdio: 'inherit' });
      } catch (error) { console.error(`Build falhou; aguardando a próxima alteração. ${error.message}`); }
    } while (pending && !stopping);
    running = false;
  }
  const watcher = chokidar.watch([path.join(paths.base, 'src'), paths.config, path.join(paths.base, 'assets'), path.join(root, 'brands'), path.join(root, 'engine'), instructionsRoot], {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
  });
  watcher.on('all', () => { clearTimeout(timer); timer = setTimeout(rebuild, 300); });
  watcher.on('error', error => console.error(`Erro no watcher: ${error.message}`));
  const stop = async () => {
    stopping = true;
    clearTimeout(timer);
    await watcher.close();
    server.close();
    console.log('Viewer encerrado. Um build ativo concluirá antes da saída.');
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  await new Promise(resolve => watcher.once('ready', resolve));
  await openBrowser(url);
  await rebuild();
  console.log('Observando slides, config, marcas, instruções e assets. Ctrl+C para sair.');
}
dev().catch(error => { console.error(`Erro no modo dev: ${error.message}`); process.exitCode = 1; });
