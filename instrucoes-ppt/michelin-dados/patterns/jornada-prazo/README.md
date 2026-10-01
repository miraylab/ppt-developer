# Jornada com prazo e restrições

> Referência manual de 28/09/2026: processo mais compacto e novas quebras nos textos da situação atual. Centralizar cada texto na caixa inteira, horizontal e verticalmente; ajustar fonte e quebra antes de deslocar manualmente a caixa. Ver `presentations/internalizacao-power-bi/manual-reference/inspection-20260928-061842/preview/slide-04.png`. A receita v6 ainda não reproduz todas essas quebras.

## Composição atual — versão 5

Três colunas: processo vertical 1 → 2 → 3 → 4, meta com indicador circular de prazo abaixo e situação atual com três contêineres individuais. Contêineres sem preenchimento, borda vermelha tracejada e cantos arredondados, seguindo o slide 1 manual. Fundo e rodapé nativos preservados.

Campos atuais: title, goal, statusTitle, count, countLabel, steps (4 textos) e constraints (3 textos). Não utiliza subtitle, deadline nem takeaway. A meta contém o prazo por extenso; o número é conteúdo fornecido, não uma contagem automática.

Aprendizados: vincular visualmente o indicador à meta colocando-o logo abaixo; conservar sequência e setas do processo; reservar margem interna para a restrição mais longa (três linhas a 17 pt). O círculo compensa a escala vertical .91 do corpo para não ficar oval. Alteração somente em journey, sem modificar a transformação compartilhada ou outras receitas. Os registros abaixo se referem às versões anteriores.

Mostrar quatro etapas, três restrições e um prazo em destaque.

Origem: template_michelin.pptx, mestre Slides Internos (Conteúdo), layout Custom Layout 1 1 1 2 1 1 1 1 2, e briefing de internalização de Power BI fornecido pelo usuário. Implementação parametrizada em visual-layouts.js. Identidade visual em brands/michelin.

Campos: title, subtitle, statusTitle, count, countLabel, deadline, takeaway, steps (4 textos), constraints (3 textos). O conteúdo específico deve permanecer em presentations. Não usar quando as quantidades indicadas ou a densidade forem incompatíveis; ajustar a composição e incrementar a versão.

## Aprendizados

Validado tecnicamente em 27/09/2026: PPTX gerado e seis PNGs revisados com renderização do PowerPoint desktop. Todos os textos do plano estão no arquivo; os diagramas usam formas nativas e os ícones são SVGs Lucide incorporados. A versão 4 usa o layout exato Custom Layout 111211112, com faixa azul arredondada e título branco. O rodapé institucional vem do layout 1112111112. O corpo fica abaixo de y=1,25 e acima de y=6,95 polegadas. Linhas e polígonos são formas nativas editáveis.

A legenda de prazo pode quebrar em três linhas em Open Sans ExtraBold a 19 pt; reservar altura 1,1 polegada. As três restrições têm caixas com 0,95 polegada. O número do prazo é um dado do briefing, não uma contagem automática.

A revisão cobre os textos do exemplo internalizacao-power-bi, não comprimentos arbitrários nem aprovação do usuário. Mudanças nesta composição devem incrementar a versão; mudanças compartilhadas em visual-layouts.js devem atualizar todas as receitas afetadas.

Revisão da versão 3: seis PNGs conferidos após trocar os ícones por Lucide e adotar o fundo do layout nativo. O título mantém geometria e estilo do layout. O rodapé foi comparado pixel a pixel com a referência e permaneceu idêntico nos seis slides. Não duplicar a faixa estreita do slide de referência. Ícones novos devem usar slide.addIcon; preservar os ícones originais do rodapé.

Versão 4 revisada: seis PNGs conferidos e rodapé idêntico pixel a pixel. Os layouts 111211112 e 1112111112 são diferentes; selecionar pelo nome exato. A imagem de fundo do primeiro inclui espaço branco abaixo da faixa azul, portanto sua altura total não indica a área azul: manter subtítulos escuros em y=1,25. A troca de rodapé ocorre somente na cópia de trabalho, preservando os objetos do doador e o arquivo original.

Versão 5 validada tecnicamente: PPTX e PNG do slide 4 revisados na revisão 2026-09-27T22-02-28.035Z-4. Fluxo híbrido confirmou os outros cinco slides preservados em componentes e renderização. Publicado no arquivo principal e viewer. Validação técnica não significa aprovação do usuário.
