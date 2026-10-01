import { lucideSvg } from '../icons/lucide.js';

function text(value) {
  if (typeof value !== 'string') throw new Error('Texto do template deve ser uma string.');
  return value;
}

function color(value) { return typeof value === 'string' && /^[0-9a-f]{6}$/i.test(value); }
function point(value) { return Array.isArray(value) && value.length === 2 && value.every(n => Number.isFinite(n) && n >= 0); }
function box(options) {
  for (const key of ['x', 'y', 'w', 'h']) if (!Number.isFinite(options?.[key]) || options[key] < 0 || (['w', 'h'].includes(key) && options[key] === 0)) throw new Error(`Geometria inválida: ${key}`);
}

export function createTemplatePresentation() {
  const slides = [];
  return {
    addTemplateSlide(source) {
      const hasSlide = source?.slideId !== undefined;
      const hasLayout = source?.layout !== undefined;
      if (hasSlide === hasLayout) throw new Error('Escolha slideId OU layout para cada slide.');
      if (hasSlide && (!Number.isInteger(source.slideId) || source.slideId <= 0)) throw new Error('slideId inválido.');
      if (hasLayout && (!source.layout.master || !source.layout.name)) throw new Error('layout exige master e name.');
      if (source.footerFrom && (!hasLayout || !source.footerFrom.master || !source.footerFrom.name || !Number.isFinite(source.footerFrom.top) || source.footerFrom.top < 0)) throw new Error('footerFrom exige layout de origem e limite top válido.');
      const plan = { source: structuredClone(source), replacements: [], additions: [] };
      slides.push(plan);
      return {
        setText(target, value) {
          const selectors = ['shapeId', 'name', 'placeholderType'].filter(key => target?.[key] !== undefined);
          if (selectors.length !== 1) throw new Error('Selecione o texto por shapeId, name OU placeholderType.');
          if (selectors[0] === 'name' ? typeof target.name !== 'string' || !target.name : !Number.isInteger(target[selectors[0]]) || target[selectors[0]] <= 0) throw new Error('Seletor de texto inválido.');
          plan.replacements.push({ target: structuredClone(target), text: text(value) });
        },
        addText(value, options) {
          for (const key of ['x', 'y', 'w', 'h', 'fontSize']) if (!Number.isFinite(options?.[key]) || options[key] < 0 || (['w', 'h', 'fontSize'].includes(key) && options[key] === 0)) throw new Error(`addText: ${key} inválido.`);
          if (!options.fontFace || !/^[0-9a-f]{6}$/i.test(options.color)) throw new Error('addText exige fontFace e color hexadecimal.');
          if (options.align && !['left', 'center', 'right'].includes(options.align)) throw new Error('Alinhamento inválido.');
          if (options.valign && !['top', 'middle', 'bottom'].includes(options.valign)) throw new Error('Alinhamento vertical inválido.');
          if (options.spaceAfter !== undefined && (!Number.isFinite(options.spaceAfter) || options.spaceAfter < 0)) throw new Error('spaceAfter inválido.');
          plan.additions.push({ ...structuredClone(options), text: text(value) });
        },
        addShape(type, options) {
          if (!['rect', 'roundRect', 'ellipse', 'hexagon', 'triangle', 'downArrow', 'rightArrow', 'chevron', 'pentagon'].includes(type)) throw new Error('Tipo de forma inválido.');
          box(options);
          if (options.fill !== null && !color(options.fill)) throw new Error('Forma exige preenchimento hexadecimal ou null.');
          if (options.dash && !['solid', 'dash'].includes(options.dash)) throw new Error('Tracejado inválido.');
          if (options.line && !color(options.line)) throw new Error('Cor de linha inválida.');
          plan.additions.push({ ...structuredClone(options), kind: 'shape', type });
        },
        addLine(from, to, options = {}) {
          if (!point(from) || !point(to) || from.every((v, i) => v === to[i])) throw new Error('Extremos de linha inválidos.');
          if (!color(options.color) || !Number.isFinite(options.width) || options.width <= 0) throw new Error('Estilo de linha inválido.');
          plan.additions.push({ ...structuredClone(options), kind: 'line', from: [...from], to: [...to] });
        },
        addPolygon(points, options) {
          if (!Array.isArray(points) || points.length < 3 || !points.every(point)) throw new Error('Polígono inválido.');
          if (!color(options?.fill)) throw new Error('Polígono exige preenchimento hexadecimal.');
          plan.additions.push({ ...structuredClone(options), kind: 'polygon', points: structuredClone(points) });
        },
        addIcon(name, options) {
          box(options);
          const svg = lucideSvg(name, options.color, options.strokeWidth ?? 2);
          plan.additions.push({ ...structuredClone(options), kind: 'icon', name, svg });
        }
      };
    },
    getPlan() { return structuredClone({ slides }); }
  };
}
