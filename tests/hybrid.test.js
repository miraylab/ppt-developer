import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSlides } from '../scripts/edit-slides.js';
import { build } from '../scripts/build.js';

test('modo híbrido exige seleção explícita e recusa o slide protegido', () => {
  for (const bad of [undefined, '', '1', '1,2', '0', '7', '2,2', '2x']) assert.throws(() => selectSlides(bad, 6, [1]));
  assert.deepEqual(selectSlides('2,4', 6, [1]), [2,4]);
});
test('build completo não sobrescreve apresentação com edições manuais', async () => {
  await assert.rejects(build('internalizacao-power-bi'), /híbrida protegida/);
});
