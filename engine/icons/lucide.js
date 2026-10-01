import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const directory = path.join(path.dirname(require.resolve('lucide-static/package.json')), 'icons');

export function lucideSvg(name, color, strokeWidth = 2) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Nome Lucide inválido.');
  if (!/^[0-9a-f]{6}$/i.test(color)) throw new Error('Cor Lucide inválida.');
  if (!Number.isFinite(strokeWidth) || strokeWidth <= 0 || strokeWidth > 4) throw new Error('Traço Lucide inválido.');
  let svg;
  try { svg = readFileSync(path.join(directory, `${name}.svg`), 'utf8'); }
  catch { throw new Error(`Ícone Lucide não encontrado: ${name}`); }
  return svg.replaceAll('currentColor', `#${color}`).replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
}
