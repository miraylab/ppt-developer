import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { safeId, outputName, presentationPaths, root } from '../engine/utils/paths.js';
import { startServer } from '../viewer/server.js';

test('paths não aceitam traversal ou nomes de arquivo arbitrários', () => {
  for (const value of ['../outside', '..', '/tmp', 'a/b', 'a\\b', '', undefined]) assert.throws(() => safeId(value));
  for (const value of ['../deck.pptx', 'a\\deck.pptx', 'deck.pdf', '/deck.pptx']) assert.throws(() => outputName(value));
  assert.equal(outputName('deck.pptx'), 'deck.pptx');
  assert.equal(presentationPaths('michelin-example').base, path.join(root, 'presentations', 'michelin-example'));
});

test('viewer serve somente recursos permitidos na interface de loopback', async () => {
  const { server, url } = await startServer('michelin-example', 0);
  try {
    assert.equal(server.address().address, '127.0.0.1');
    const page = await fetch(url);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /id="thumbnails"/);
    assert.match(page.headers.get('content-security-policy'), /default-src 'self'/);
    const manifest = await fetch(url + '/api/slides');
    assert.equal(manifest.status, 200);
    assert.ok(Array.isArray((await manifest.json()).slides));
    for (const route of ['/package.json', '/presentation.config.js', '/preview/..%2f..%2fpackage.json', '/preview/no.png']) {
      assert.equal((await fetch(url + route)).status, 404);
    }
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
    assert.equal(await (await fetch(url, { method: 'HEAD' })).text(), '');
  } finally { await new Promise(resolve => server.close(resolve)); }
});

