# Michelin: template nativo

Para novas composições de conteúdo, usar o fundo e o título do layout nativo do template, preservando o rodapé institucional. Evitar duplicar os slides de referência com faixa compacta de título. Os ícones adicionados devem vir da biblioteca Lucide (`lucide-static`), incorporados como SVG. Os ícones originais do rodapé permanecem como vieram no template.

A descrição de cores, fontes, dimensões e composição está em [DESIGN.md](DESIGN.md). As referências de cor ficam em `colors.js` e a tipografia das caixas novas em `typography.js`, reunidas por `theme.js`.

Fonte: `template_michelin.pptx` na raiz, salva pelo usuário. A identidade visual permanece no arquivo original: fotos, logos, mestres, layouts e formatação dos placeholders. Não é necessário reconstruí-los ou rasterizar o slide.

Esta brand é específica da engine `powerpoint-template`. Os tokens em `theme.js` configuram somente caixas novas de conteúdo; os textos substituídos herdam a formatação dos objetos existentes. Fontes observadas no original: Open Sans e Open Sans ExtraBold. A cor de corpo é uma escolha para o exemplo, não uma extração da paleta oficial.

O original nunca é aberto para edição pela geração. O build copia o arquivo para uma pasta temporária dentro de output e altera a cópia. Todos os 3 mestres e 113 layouts do arquivo recebido devem permanecer disponíveis no PPTX gerado. Campos herdados da marca (slogans e logos) continuam presentes.

Layout solicitado para as composições executivas: **Custom Layout 111211112** (nome interno `Custom Layout 1 1 1 2 1 1 1 1 2`), mestre `Slides Internos (Conteúdo)`. Preservar o rodapé do layout `Custom Layout 1 1 1 2 1 1 1 1 1 2` por meio de `footerFrom`, substituindo somente os elementos abaixo de 6,7 polegadas na cópia de trabalho. O arquivo fonte não é alterado. O layout do título azul em fundo branco usado antes não é o fundo escolhido pelo usuário.
