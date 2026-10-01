import { mkdir, rm, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { presentationPaths } from './paths.js';

export async function resetPreview(id) {
  const { output, preview } = presentationPaths(id);
  if (path.dirname(preview) !== output) throw new Error('Pasta de preview inválida.');
  await rm(preview, { recursive: true, force: true });
  await mkdir(preview, { recursive: true });
}
export async function writeManifest(paths, data) {
  const temp = paths.manifest + '.tmp';
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, paths.manifest);
}
