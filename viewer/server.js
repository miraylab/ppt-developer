import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { root, presentationPaths } from '../engine/utils/paths.js';

export async function startServer(id, port = Number(process.env.PORT || 3000)) {
  const paths = presentationPaths(id);
  await readFile(paths.config);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT deve ser um número entre 0 e 65535.');
  const files = new Map([['/', ['index.html', 'text/html']], ['/app.js', ['app.js', 'text/javascript']], ['/styles.css', ['styles.css', 'text/css']]]);
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
      const pathname = new URL(req.url, 'http://localhost').pathname;
      let file, type;
      if (files.has(pathname)) {
        const [name, mime] = files.get(pathname);
        file = path.join(root, 'viewer', name); type = `${mime}; charset=utf-8`;
      } else if (pathname === '/api/slides') {
        let manifest;
        try { manifest = JSON.parse(await readFile(paths.manifest, 'utf8')); }
        catch (error) { if (error.code !== 'ENOENT') throw error; manifest = { status: 'empty', slides: [] }; }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(req.method === 'HEAD' ? undefined : JSON.stringify(manifest)); return;
      } else if (/^\/preview\/slide-\d+\.png$/.test(pathname)) {
        file = path.join(paths.preview, path.basename(pathname)); type = 'image/png';
      } else { res.writeHead(404); res.end('Não encontrado'); return; }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': type });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      res.end('Não foi possível carregar este recurso.');
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(`Viewer: ${url} (${id})`);
  return { server, url };
}
