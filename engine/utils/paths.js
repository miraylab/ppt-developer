import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const defaultPresentation = 'michelin-example';
export function safeId(value) {
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(value ?? '')) throw new Error('ID inválido. Use letras, números, hífen e underscore.');
  return value;
}
export function presentationPaths(id) {
  const base = path.join(root, 'presentations', safeId(id));
  const output = path.join(base, 'output');
  return { base, output, config: path.join(base, 'presentation.config.js'), source: path.join(base, 'src/index.js'), preview: path.join(output, 'preview'), manifest: path.join(output, 'manifest.json') };
}
export function brandPath(id) { return path.join(root, 'brands', safeId(id)); }
export function templatePath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath) || /^[A-Za-z]:/.test(relativePath)) throw new Error('template deve ser um caminho relativo ao projeto.');
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);
  if (relative.startsWith('..' + path.sep) || relative === '..' || !/\.pptx$/i.test(target)) throw new Error('Template deve ser um PPTX dentro do projeto.');
  return target;
}
export const instructionsRoot = path.join(root, 'instrucoes-ppt');
export function instructionPath(id) { return path.join(instructionsRoot, safeId(id)); }
export function outputName(name) {
  if (!/^[a-z0-9][a-z0-9._-]*\.pptx$/i.test(name ?? '')) throw new Error('outputName deve ser um nome simples terminado em .pptx.');
  return name;
}
