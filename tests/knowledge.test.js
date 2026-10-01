import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { searchPatterns } from '../engine/knowledge/catalog.js';
import { loadStyle } from '../engine/knowledge/load-style.js';
import { createTemplatePresentation } from '../engine/template/create-presentation.js';
import brand from '../brands/michelin/theme.js';

test('catálogo contém somente receitas Michelin e permite busca sem acentos', async () => {
  assert.equal((await searchPatterns('conteúdo', 'michelin-dados'))[0].style, 'michelin-dados');
  const all = await searchPatterns();
  assert.ok(all.length >= 4);
  assert.ok(all.every(pattern => pattern.style === 'michelin-dados'));
  assert.deepEqual(await searchPatterns('zzzinexistente'), []);
  await assert.rejects(searchPatterns('', '../outside'), /ID inválido/);
  for (const pattern of all) assert.match(await readFile(pattern.instructions, 'utf8'), /Aprendizados/);
});

test('receita reutilizada não mistura conteúdo ou histórico de apresentações', async () => {
  const first = await loadStyle('michelin-dados');
  const second = await loadStyle('michelin-dados');
  const a = createTemplatePresentation();
  const b = createTemplatePresentation();
  const original = structuredClone(brand);
  await first.create('capa', { pptx: a, theme: first.applyTheme(brand), number: 1 }, { title: 'Primeiro projeto', date: 'Primeira edição' });
  await second.create('capa', { pptx: b, theme: second.applyTheme(brand), number: 1 }, { title: 'Outro projeto', date: 'Outra edição' });
  assert.deepEqual(b.getPlan().slides[0].replacements.map(item => item.text), ['Outro projeto', 'Outra edição']);
  assert.deepEqual(brand, original);
  assert.equal(first.getUsages().length, 1);
  assert.equal(second.getUsages().length, 1);
  assert.deepEqual((await loadStyle('michelin-dados')).getUsages(), []);
});

test('conteúdo ausente e padrão desconhecido não geram slides parciais', async () => {
  const knowledge = await loadStyle('michelin-dados');
  const pptx = createTemplatePresentation();
  const context = { pptx, theme: knowledge.applyTheme(brand), number: 1 };
  await assert.rejects(knowledge.create('capa', context, { title: 'Título' }), /date/);
  await assert.rejects(knowledge.create('conteudo', context, { title: 'Título' }), /intro/);
  await assert.rejects(knowledge.create('ausente', context, {}), /não encontrado/);
  assert.equal(pptx.getPlan().slides.length, 0);
  assert.deepEqual(knowledge.getUsages(), []);
});

