import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemplatePresentation } from '../engine/template/create-presentation.js';
import { templatePath, root } from '../engine/utils/paths.js';
import { loadStyle } from '../engine/knowledge/load-style.js';
import brand from '../brands/michelin/theme.js';
import presentation from '../presentations/michelin-example/presentation.config.js';
import creators from '../presentations/michelin-example/src/index.js';
import path from 'node:path';
import internalizacao from '../presentations/internalizacao-power-bi/src/index.js';
import internalizacaoConfig from '../presentations/internalizacao-power-bi/presentation.config.js';

test('template fica dentro do projeto e não aceita caminhos arbitrários', () => {
  assert.equal(templatePath('template_michelin.pptx'), path.join(root, 'template_michelin.pptx'));
  for (const invalid of ['../outside.pptx', 'C:\\outside.pptx', '/outside.pptx', 'source.pdf', '']) assert.throws(() => templatePath(invalid));
});

test('diagramas rejeitam geometria inválida e isolam os dados do plano', () => {
  const pptx = createTemplatePresentation();
  const slide = pptx.addTemplateSlide({ slideId: 256 });
  assert.throws(() => slide.addShape('desconhecida', {}));
  assert.throws(() => slide.addShape('rect', { x: 0, y: 0, w: NaN, h: 1, fill: '005AAB' }));
  assert.throws(() => slide.addLine([0, 0], [0, 0], { color: '005AAB', width: 1 }));
  assert.throws(() => slide.addPolygon([[0, 0], [1, 1]], { fill: '005AAB' }));
  const points = [[0, 0], [1, 0], [1, 1]];
  slide.addPolygon(points, { fill: '005AAB' });
  points[0][0] = 99;
  assert.equal(pptx.getPlan().slides[0].additions[0].points[0][0], 0);
  assert.equal(pptx.getPlan().slides[0].additions.length, 1);
});

test('briefing mantém seis slides, indicadores explícitos e diagramas nativos dentro da área útil', async () => {
  const pptx = createTemplatePresentation();
  const knowledge = await loadStyle('michelin-dados');
  const theme = knowledge.applyTheme(brand);
  for (const [index, fn] of internalizacao.entries()) await fn({ pptx, knowledge, theme, number: index + 1 });
  const plan = pptx.getPlan();
  assert.equal(plan.slides.length, 6);
  assert.equal(plan.slides[1].additions.filter(a => a.text === 'X').length, 4);
  assert.ok(plan.slides[3].additions.some(a => a.text === '< 90'));
  for (const [index, slide] of plan.slides.entries()) {
    assert.equal(slide.source.slideId, undefined);
    assert.equal(slide.source.layout.master, 'Slides Internos (Conteúdo)');
    assert.equal(slide.source.layout.name.replaceAll(' ', ''), 'CustomLayout111211112');
    assert.equal(slide.source.footerFrom.name, 'Custom Layout 1 1 1 2 1 1 1 1 1 2');
    assert.ok(slide.additions.some(a => ['shape', 'icon', 'line'].includes(a.kind)));
    // As receitas antigas dos slides manuais protegidos não são executadas no fluxo híbrido.
    if (internalizacaoConfig.protectedSlides.includes(index + 1)) continue;
    for (const a of slide.additions) {
      const points = a.points ?? (a.kind === 'line' ? [a.from, a.to] : [[a.x, a.y], [a.x + a.w, a.y + a.h]]);
      assert.ok(points.every(([x,y]) => x >= 0 && x <= 13.3334 && y >= .7 && y <= 6.95), JSON.stringify(a));
    }
  }
});

test('ícones Lucide são SVGs locais incorporáveis com nomes e cores validados', () => {
  const pptx = createTemplatePresentation();
  const slide = pptx.addTemplateSlide({ slideId: 256 });
  const options = { x: 1, y: 1, w: .4, h: .4, color: '005AAB' };
  assert.throws(() => slide.addIcon('../outside', options));
  assert.throws(() => slide.addIcon('not-a-real-lucide-icon', options));
  assert.throws(() => slide.addIcon('check', { ...options, color: 'url(external)' }));
  slide.addIcon('check', options);
  const icon = pptx.getPlan().slides[0].additions[0];
  assert.equal(icon.kind, 'icon');
  assert.match(icon.svg, /lucide-check/);
  assert.match(icon.svg, /stroke="#005AAB"/);
  assert.doesNotMatch(icon.svg, /currentColor|<script|href=/);
});

test('plano aceita fonte única, alvos explícitos e caixas válidas', () => {
  const pptx = createTemplatePresentation();
  assert.throws(() => pptx.addTemplateSlide({}));
  assert.throws(() => pptx.addTemplateSlide({ slideId: 1, layout: { master: 'a', name: 'b' } }));
  assert.throws(() => pptx.addTemplateSlide({ slideId: 1, footerFrom: { master: 'a', name: 'b', top: 6.7 } }));
  const slide = pptx.addTemplateSlide({ slideId: 256 });
  assert.throws(() => slide.setText({ shapeId: 1, name: 'x' }, 'texto'));
  assert.throws(() => slide.addText('x', { x: 0, y: 0, w: -1, h: 1, fontSize: 20 }));
  slide.setText({ shapeId: 1227 }, 'Título');
  const plan = pptx.getPlan();
  plan.slides[0].replacements[0].text = 'mudança externa';
  assert.equal(pptx.getPlan().slides[0].replacements[0].text, 'Título');
});

test('exemplo Michelin combina slides prontos e layout nativo com conteúdo parametrizado', async () => {
  const pptx = createTemplatePresentation();
  const knowledge = await loadStyle(presentation.style);
  const theme = knowledge.applyTheme(brand);
  for (const [index, fn] of creators.entries()) await fn({ pptx, knowledge, presentation, theme, number: index + 1 });
  const plan = pptx.getPlan();
  assert.equal(plan.slides.length, 4);
  assert.equal(plan.slides[0].source.slideId, 256);
  assert.equal(plan.slides[2].source.layout.master, 'Slides Internos (Conteúdo)');
  assert.equal(plan.slides[1].additions.length, 5);
  assert.equal(plan.slides[3].replacements[1].text, 'DATA BOARD\nExemplo local');
  assert.equal(knowledge.getUsages().length, 4);
});
