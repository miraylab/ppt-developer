import { searchPatterns } from '../engine/knowledge/catalog.js';

try {
  const results = await searchPatterns(process.argv[2] ?? '', process.argv[3]);
  if (!results.length) console.log('Nenhum padrão encontrado. Consulte instrucoes-ppt/README.md para registrar uma nova estrutura.');
  for (const pattern of results) {
    console.log(`\n${pattern.style}/${pattern.id} — ${pattern.title} (v${pattern.version}, ${pattern.status})\n${pattern.description}\nInstruções: ${pattern.instructions}`);
  }
} catch (error) { console.error(`Erro ao consultar conhecimento: ${error.message}`); process.exitCode = 1; }
