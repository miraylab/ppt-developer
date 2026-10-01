import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { instructionPath } from '../utils/paths.js';
import { readCatalog } from './catalog.js';

export async function loadStyle(id) {
  if (!id) return null;
  const catalog = await readCatalog(id);
  const base = instructionPath(id);
  const { default: layouts } = await import(pathToFileURL(path.join(base, 'layouts.js')).href);
  const patterns = new Map();
  for (const metadata of catalog.patterns) {
    const module = await import(pathToFileURL(path.join(base, 'patterns', metadata.id, 'create-slide.js')).href);
    if (typeof module.createSlide !== 'function') throw new Error(`Padrão ${id}/${metadata.id} não exporta createSlide.`);
    patterns.set(metadata.id, { ...metadata, createSlide: module.createSlide });
  }
  const usages = [];
  return {
    catalog,
    applyTheme(theme) { return { ...theme, layouts: { ...theme.layouts, ...layouts } }; },
    async create(patternId, context, content) {
      const pattern = patterns.get(patternId);
      if (!pattern) throw new Error(`Padrão ${id}/${patternId} não encontrado. Consulte npm run knowledge -- "termo".`);
      const slide = await pattern.createSlide({ ...context, content });
      usages.push({ slide: context.number, style: id, pattern: pattern.id, version: pattern.version, status: pattern.status });
      return slide;
    },
    getUsages() { return usages.map(usage => ({ ...usage })); }
  };
}
