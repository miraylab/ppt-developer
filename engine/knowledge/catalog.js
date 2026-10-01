import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { instructionsRoot, instructionPath, safeId } from '../utils/paths.js';

function validPattern(pattern) {
  return typeof pattern.title === 'string' && pattern.title.trim()
    && typeof pattern.description === 'string' && pattern.description.trim()
    && Array.isArray(pattern.tags) && pattern.tags.every(tag => typeof tag === 'string')
    && Number.isInteger(pattern.version) && pattern.version > 0
    && ['draft', 'validated'].includes(pattern.status);
}

export async function readCatalog(style) {
  const file = path.join(instructionPath(style), 'catalog.json');
  const catalog = JSON.parse(await readFile(file, 'utf8'));
  if (catalog.id !== style || !Array.isArray(catalog.patterns)) throw new Error(`Catálogo inválido: ${file}`);
  const ids = new Set();
  for (const pattern of catalog.patterns) {
    safeId(pattern.id);
    if (ids.has(pattern.id) || !validPattern(pattern)) throw new Error(`Padrão inválido ou duplicado: ${style}/${pattern.id}`);
    ids.add(pattern.id);
  }
  return catalog;
}

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export async function searchPatterns(query = '', style) {
  const styles = style ? [safeId(style)] : (await readdir(instructionsRoot, { withFileTypes: true })).filter(entry => entry.isDirectory() && !entry.name.startsWith('.')).map(entry => entry.name);
  const terms = [...new Set(normalize(query).split(/[^a-z0-9]+/).filter(Boolean))];
  const results = [];
  for (const id of styles) {
    const catalog = await readCatalog(id);
    for (const pattern of catalog.patterns) {
      const haystack = normalize([pattern.id, pattern.title, pattern.description, ...pattern.tags].join(' '));
      const score = terms.filter(term => haystack.includes(term)).length;
      if (!terms.length || score) results.push({ style: id, ...pattern, score, instructions: path.join(instructionPath(id), 'patterns', pattern.id, 'README.md') });
    }
  }
  return results.sort((a, b) => b.score - a.score || `${a.style}/${a.id}`.localeCompare(`${b.style}/${b.id}`));
}
