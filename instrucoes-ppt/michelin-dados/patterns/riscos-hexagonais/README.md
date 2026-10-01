# Mapa hexagonal de riscos

> Referência manual de 28/09/2026: capitalização final do título **Impactos dos Ativos fora da Governança**. A composição radial compacta foi mantida. Ver `presentations/internalizacao-power-bi/manual-reference/inspection-20260928-061842/preview/slide-03.png`.

## Composição atual — versão 5

Um hexágono central regular e seis consequências próximas às direções dos seus vértices. Itens periféricos livres, sem hexágonos ou contêineres, com ícones Lucide, título e dois impactos curtos. Campos atuais: title, center e risks (6 objetos title/body). Não utiliza subtitle. O texto antes usado como subtítulo passou ao título principal na apresentação de origem.

Aprendizado: um hexágono regular exige geometria equilateral, não apenas largura e altura iguais. Os seis vértices são calculados num círculo e a compressão vertical do corpo (.91) é compensada antes da transformação compartilhada. A forma resultante é nativa e editável. Conectores partem dos vértices; itens ficam fora da forma. Não alterar a transformação compartilhada para corrigir apenas este padrão.

Versão 5 renderizada e revisada em 27/09/2026: `presentations/internalizacao-power-bi/revisions/2026-09-27T21-39-40.159Z-3/preview/slide-03.png`. Candidato PPTX gerado com os outros cinco slides preservados byte a byte e com PNGs idênticos. Publicação no arquivo principal inicialmente bloqueada por arquivo aberto no PowerPoint. Validação técnica não é aprovação do usuário. Os registros abaixo descrevem versões anteriores.

Organizar seis dimensões ao redor de um risco central.

Origem: template_michelin.pptx, mestre Slides Internos (Conteúdo), layout Custom Layout 1 1 1 2 1 1 1 1 2, e briefing de internalização de Power BI fornecido pelo usuário. Implementação parametrizada em visual-layouts.js. Identidade visual em brands/michelin.

Campos: title, subtitle, center, risks (6 objetos title/body). O conteúdo específico deve permanecer em presentations. Não usar quando as quantidades indicadas ou a densidade forem incompatíveis; ajustar a composição e incrementar a versão.

## Aprendizados

Validado tecnicamente em 27/09/2026: PPTX gerado e seis PNGs revisados com renderização do PowerPoint desktop. Todos os textos do plano estão no arquivo; os diagramas usam formas nativas e os ícones são SVGs Lucide incorporados. A versão 4 usa o layout exato Custom Layout 111211112, com faixa azul arredondada e título branco. O rodapé institucional vem do layout 1112111112. O corpo fica abaixo de y=1,25 e acima de y=6,95 polegadas. Linhas e polígonos são formas nativas editáveis.

Hexágonos de 3,5 × aproximadamente 1,68 polegadas acomodam ícone, título e dois impactos curtos. O rótulo longo sobre dependência de pessoas foi condensado para evitar uma terceira linha próxima à borda inferior. Não ampliar textos sem nova revisão. O mapa usa legendas de 13,3 pt.

A revisão cobre os textos do exemplo internalizacao-power-bi, não comprimentos arbitrários nem aprovação do usuário. Mudanças nesta composição devem incrementar a versão; mudanças compartilhadas em visual-layouts.js devem atualizar todas as receitas afetadas.

Revisão da versão 3: seis PNGs conferidos após trocar os ícones por Lucide e adotar o fundo do layout nativo. O título mantém geometria e estilo do layout. O rodapé foi comparado pixel a pixel com a referência e permaneceu idêntico nos seis slides. Não duplicar a faixa estreita do slide de referência. Ícones novos devem usar slide.addIcon; preservar os ícones originais do rodapé.

Versão 4 revisada: seis PNGs conferidos e rodapé idêntico pixel a pixel. Os layouts 111211112 e 1112111112 são diferentes; selecionar pelo nome exato. A imagem de fundo do primeiro inclui espaço branco abaixo da faixa azul, portanto sua altura total não indica a área azul: manter subtítulos escuros em y=1,25. A troca de rodapé ocorre somente na cópia de trabalho, preservando os objetos do doador e o arquivo original.

Publicação concluída após fechamento do PowerPoint: revisão 2026-09-27T21-41-05.204Z-3. Slide 3 atualizado no arquivo principal e no viewer; demais slides preservados pela verificação do fluxo híbrido.

## Refinamento manual posterior

O usuário refinou o slide 3 após a v5: hexágono central maior, blocos laterais mais próximos do centro, descrições menores e próximas aos títulos, e remoção dos conectores. Usar proximidade e distribuição radial para comunicar relações sem linhas desnecessárias. Referência: presentations/internalizacao-power-bi/manual-reference/slide3-20260927-185322/README.md e preview/slide-03.png. Slide 3 protegido; a implementação v5 não incorpora esses refinamentos e não deve substituir a edição manual.
