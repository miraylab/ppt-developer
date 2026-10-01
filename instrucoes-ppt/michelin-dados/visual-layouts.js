// Composições no layout nativo Michelin, com rodapé herdado e ícones Lucide.
import { requiredText } from '../../engine/knowledge/content.js';

function begin({ pptx, theme, content }, keys, arrays = {}) {
  for (const key of ['title', ...keys]) requiredText(content, key);
  for (const [key, count] of Object.entries(arrays)) {
    if (!Array.isArray(content[key]) || content[key].length !== count) throw new Error(`${key} exige ${count} itens.`);
  }
  const native = pptx.addTemplateSlide({
    layout: { master: 'Slides Internos (Conteúdo)', name: 'Custom Layout 1 1 1 2 1 1 1 1 2' },
    footerFrom: { master: 'Slides Internos (Conteúdo)', name: 'Custom Layout 1 1 1 2 1 1 1 1 1 2', top: 6.7 }
  });
  // Reserva espaço ao título do layout. Reposiciona o corpo sem reduzir fontes.
  const Y = y => 1.25 + (y - .8) * .91;
  const slide = {
    setText: (...args) => native.setText(...args),
    addText: (value, o) => native.addText(value, { ...o, y: Y(o.y) }),
    addShape: (type, o) => native.addShape(type, { ...o, y: Y(o.y), h: o.h * .91 }),
    addLine: (a, b, o) => native.addLine([a[0], Y(a[1])], [b[0], Y(b[1])], o),
    addPolygon: (points, o) => native.addPolygon(points.map(([x,y]) => [x,Y(y)]), o),
    addIcon: (name, o) => native.addIcon(name, { ...o, y: Y(o.y) })
  };
  slide.setText({ placeholderType: 1 }, content.title);
  const c = theme.colors;
  const t = (value, x, y, w, h, size = 18, bold = false, color = c.ink, align = 'left') => slide.addText(value, {
    x, y, w, h, fontSize: size, fontFace: bold ? theme.typography.heading : theme.typography.body,
    color, bold, align, spaceAfter: 0
  });
  const s = (type, x, y, w, h, fill, line) => slide.addShape(type, { x, y, w, h, fill, ...(line ? { line } : {}) });
  const l = (a, b, color = c.blue, width = 2, arrow = false) => slide.addLine(a, b, { color, width, arrow });
  const icon = (name, x, y, size, color = c.blue) => slide.addIcon(name, { x, y, w: size, h: size, color, strokeWidth: 2 });
  const subtitle = () => native.addText(content.subtitle, { x: 1.31, y: 1.25, w: 11.3, h: .48, fontSize: 20, fontFace: theme.typography.body, color: c.navy, spaceAfter: 0 });
  return { slide, c, t, s, l, icon, subtitle };
}

export function convergence(context) {
  const { content: d } = context;
  const { slide, c, t, l, icon } = begin(context,
    ['independentTitle', 'alignedTitle', 'benefit', 'riskOwner', 'destination', 'quote'], { risks: 3 });
  t(d.independentTitle, .7, 1.0, 5.6, .85, 21, true, c.navy);
  t(d.alignedTitle, 7.0, 1.0, 5.6, .85, 21, true, c.navy);
  l([6.6, 1.0], [6.6, 5.45], c.rule, 1);
  // Três áreas independentes; nenhum conector entre elas.
  [1.35, 3.25, 5.15].forEach(x => {
    icon('building-2', x - .25, 2.0, .5);
    l([x, 2.68], [x, 3.14], c.blue, 2, true);
  });
  t(d.benefit, .85, 3.32, 5.5, .5, 21, true, c.blue, 'center');
  slide.addShape('roundRect', { x: .7, y: 4.02, w: 5.7, h: 1.95, fill: null, line: c.danger, dash: 'dash' });
  icon('database', .9, 4.32, .29, c.danger);
  t(d.riskOwner, 1.34, 4.30, 4.95, .38, 17, true, c.navy);
  d.risks.forEach((label, i) => {
    const y = 4.77 + i * .34;
    icon(['sliders-horizontal', 'git-compare-arrows', 'shield-alert'][i], 1.0, y, .23, c.danger);
    t(label, 1.4, y, 4.9, .33, 16, false, c.ink);
  });
  icon('building-2', 8.05, 2.0, .55);
  icon('database', 10.9, 2.0, .55);
  l([8.33, 2.9], [9.76, 3.6], c.blue, 3);
  l([11.18, 2.9], [9.76, 3.6], c.blue, 3);
  l([9.76, 3.6], [9.76, 3.94], c.blue, 3, true);
  t(d.destination, 7.15, 4.23, 5.22, .95, 25, true, c.blue, 'center');
  t(d.quote, .85, 6.03, 11.6, .9, 22, false, c.navy, 'center');
  return slide;
}

export function iceberg(context) {
  const { content: d } = context;
  const { slide, c, t, s, l, icon } = begin(context, ['governed', 'visible', 'guaranteeTitle'], { metrics: 4, seals: 5, hidden: 7 });
  t(d.governed, .7, 1.05, 5.5, .7, 24, true, c.navy);
  d.metrics.forEach((item, i) => {
    const x = .9 + (i % 2) * 2.65, y = 2.22 + Math.floor(i / 2) * 1.3;
    t(item.value, x, y, .8, .8, 40, true, c.blue);
    t(item.label, x + .87, y + .16, 1.7, .67, 17);
  });
  slide.addShape('roundRect', { x: .7, y: 4.85, w: 5.6, h: 1.75, fill: null, line: c.blue, dash: 'dash' });
  s('rect', 1.03, 4.70, 1.9, .43, c.white);
  t(d.guaranteeTitle, 1.10, 4.69, 2.1, .43, 20, true, c.blue);
  d.seals.forEach((label, i) => {
    const x = 1.0 + (i % 2) * 2.58, y = 5.29 + Math.floor(i / 2) * .43;
    icon(['shield-check', 'lock-keyhole', 'wrench', 'chart-no-axes-combined', 'network'][i], x, y, .26);
    t(label, x + .37, y, 2.22, .36, 14.5);
  });
  l([6.65, 1.05], [6.65, 6.6], c.rule, 1);
  // Lucide identifica o topo; a forma submersa é um diagrama nativo editável.
  slide.addIcon('mountain-snow', { x:7.13, y:1.12, w:2.08, h:2.08, color:c.blue, strokeWidth:1.25 });
  t(d.visible, 9.55, 2.06, 3.1, .9, 23, true, c.navy);
  s('rect', 6.96, 3.2, 5.83, 3.37, c.icePale);
  slide.addPolygon([[7.2,3.24],[9.26,3.24],[8.3,6.12]], {fill:c.ice});
  slide.addPolygon([[7.2,3.24],[8.36,3.24],[8.3,6.12]], {fill:c.iceShade});
  l([6.96,3.2],[12.79,3.2],c.blue,2);
  d.hidden.forEach((label,i)=>t(label,9.4,3.52+i*.4,3.22,.65,15,false,c.navy));
  return slide;
}

export function hexRisks(context) {
  const { content: d } = context;
  const { slide, c, t, l, icon } = begin(context, ['center'], { risks: 6 });
  // Compensa a transformação vertical do corpo para manter seis lados iguais.
  const cx = 6.67, cy = 3.92, radius = 1.18;
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (-150 + i * 60) * Math.PI / 180;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle) / .91];
  });
  const positions = [[.8,2.06],[4.92,.93],[9.03,2.06],[9.03,4.54],[4.92,5.45],[.8,4.54]];
  const anchors = [[4.35,2.8],[6.67,2.45],[9.0,2.8],[9.0,4.92],[6.67,5.35],[4.35,4.92]];
  vertices.forEach((point,i) => l(point,anchors[i],c.rule,1.4));
  slide.addPolygon(vertices,{fill:c.navy});
  t(d.center,5.69,3.55,1.96,1.02,18,true,c.white,'center');
  d.risks.forEach((item,i) => {
    const [x,y] = positions[i];
    icon(['lock-keyhole','chart-no-axes-combined','trending-up','settings','users','search-check'][i],x+1.56,y,.38);
    t(item.title,x,y+.48,3.5,.64,17,true,c.navy,'center');
    t(item.body,x-.08,y+1.1,3.66,.7,14.5,false,c.ink,'center');
  });
  return slide;
}

export function journey(context) {
  const { content: d, theme } = context;
  const { slide, c, t, s, l } = begin(context, ['goal', 'statusTitle', 'count', 'countLabel'], { steps: 4, constraints: 3 });
  const centered = (text,x,y,w,h,size,color=c.ink,bold=false) => slide.addText(text,{x,y,w,h,fontSize:size,fontFace:bold?theme.typography.heading:theme.typography.body,color,bold,align:'center',valign:'middle',spaceAfter:0});
  t('Meta',.7,1.05,3.55,.5,24,true,c.navy,'center');
  centered(d.goal,.7,1.9,3.55,1.42,21,c.navy);
  s('roundRect',.85,3.85,3.25,1.95,c.navy);
  centered(d.count,.99,4.0,2.97,.65,34,c.yellow);
  centered(d.countLabel,1.05,4.72,2.85,.86,17,c.white);
  l([4.45,1.05],[4.45,6.35],c.rule,1);
  t('Processo',4.78,1.05,3.45,.5,24,true,c.navy,'center');
  d.steps.forEach((label,i) => {
    const y=2.08+i*1.08;
    s('ellipse',4.82,y,.46,.46/.91,c.blue);
    centered(String(i+1),4.82,y,.46,.46,16,c.white);
    slide.addText(label,{x:5.48,y:y-.12,w:2.72,h:.75,fontSize:19,fontFace:theme.typography.body,color:c.navy,align:'left',valign:'middle',spaceAfter:0});
    if(i<3) l([5.05,y+.58],[5.05,y+.98],c.blue,2,true);
  });
  l([8.55,1.05],[8.55,6.35],c.rule,1);
  t(d.statusTitle,8.87,1.05,3.78,.5,24,true,c.navy,'center');
  d.constraints.forEach((label,i) => {
    const y=2.03+i*1.48, h=1.27;
    slide.addShape('roundRect',{x:8.87,y,w:3.78,h,fill:null,line:c.danger,dash:'dash'});
    centered(label,9.08,y,3.36,h*.91,17);
  });
  return slide;
}

export function scenarios(context) {
  const { content: d } = context;
  const { slide, c, t, s, l, icon } = begin(context, [], { scenarios: 3 });
  const colors = [c.success, c.warning, c.danger];
  d.scenarios.forEach((item, i) => {
    const x = .65 + i * 4.18;
    if (i) l([x - .25, 1.28], [x - .25, 6.2], c.rule, 1);
    icon(i === 0 ? 'circle-check' : 'triangle-alert', x, 1.0, .55, i === 1 ? c.warningInk : colors[i]);
    t(item.title, x, 1.85, 3.65, .95, 24, true, c.navy);
    t(item.actions.join('\n'), x, 3.03, 3.63, 1.75, 19);
    l([x, 4.95], [x + 3.6, 4.95], colors[i], 3);
    t(item.results.join('\n'), x, 5.22, 3.63, 1.25, 18, true, i === 1 ? c.navy : colors[i]);
  });
  if (d.takeaway) t(d.takeaway, .65, 6.57, 12.0, .35, 17, true, c.navy, 'center');
  return slide;
}

export function pillars(context) {
  const { content: d } = context;
  const { slide, c, t, s, l, icon } = begin(context, ['closingTitle', 'quote'], { pillars: 3, outcomes: 3 });
  d.pillars.forEach((item, i) => {
    const x = .7 + i * 4.2;
    icon(['flag', 'calendar-check', 'user-check'][i], x, 1.14, .72);
    t(item.title, x, 2.1, 3.7, .5, 25, true, c.navy);
    t(item.body, x, 2.92, 3.65, 1.32, 20);
  });
  l([.7, 4.62], [12.63, 4.62], c.blue, 2);
  t(d.closingTitle, .7, 4.98, 11.9, .5, 25, true, c.navy, 'center');
  d.outcomes.forEach((label, i) => {
    const x = 1.18 + i * 4.05;
    icon('check', x, 5.68, .34, c.success);
    t(label, x + .43, 5.71, 3.23, .4, 19, true, c.blue);
  });
  t(d.quote, .9, 6.32, 11.55, .62, 18, false, c.navy, 'center');
  return slide;
}




