# Trabalho neste projeto

## Memória de apresentações

Antes de criar ou alterar uma apresentação, leia `instrucoes-ppt/README.md` e consulte o catálogo de padrões (`node scripts/knowledge.js "objetivo do slide"`). Leia as instruções do estilo selecionado no config e dos padrões pertinentes.

- Reutilize uma receita existente quando a estrutura servir ao conteúdo. Mantenha os dados específicos em `presentations`.
- Identidade visual pertence a `brands`; composição reutilizável e conhecimento de estrutura pertencem a `instrucoes-ppt`.
- Ao desenvolver uma composição nova e reutilizável, registre código parametrizado, entrada no catálogo, contexto de uso e referência de origem. Use `draft` até revisar o resultado renderizado.
- Após corrigir um problema recorrente de composição, registre o aprendizado concreto no README do padrão. Não invente evidências, limites testados ou aprovação do usuário.
- Incremente a versão do padrão ao alterar sua implementação ou composição. Atualize as versões de todos os padrões afetados por um layout compartilhado.
- Valide o PPTX e os PNGs antes de marcar um padrão como `validated`. Essa marca indica revisão técnica/visual, não aprovação pelo usuário.
- Se o pedido for pontual e não gerar uma estrutura reutilizável, mantenha-o no slide da apresentação. Não crie novos padrões só para acumular entradas.

## Implementação e validação

Preserve objetos nativos editáveis, execução local e o viewer baseado exclusivamente em PNGs do PPTX. Não introduza APIs de IA, serviços externos ou editor visual sem solicitação.

Execute `npm test` (ou `node --test`) para mudanças na engine. Para mudanças nos padrões, gere a apresentação afetada e revise os PNGs. Se a renderização não estiver disponível, registre essa limitação e mantenha novos padrões como `draft`.
