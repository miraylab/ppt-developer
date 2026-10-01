# Três pilares de apoio

> Referência manual de 28/09/2026: remover o bloco intermediário quando ele repetir a conclusão; usar a frase final em negrito com destaque amarelo como fechamento visual único. Ver `presentations/internalizacao-power-bi/manual-reference/inspection-20260928-061842/preview/slide-06.png`. A receita atual não reproduz essa referência.

Apresentar três compromissos e encerrar com os resultados esperados.

Origem: template_michelin.pptx, mestre Slides Internos (Conteúdo), layout Custom Layout 1 1 1 2 1 1 1 1 2, e briefing de internalização de Power BI fornecido pelo usuário. Implementação parametrizada em visual-layouts.js. Identidade visual em brands/michelin.

Campos: title, closingTitle, quote, pillars (3 objetos title/body), outcomes (3 textos). O conteúdo específico deve permanecer em presentations. Não usar quando as quantidades indicadas ou a densidade forem incompatíveis; ajustar a composição e incrementar a versão.

## Aprendizados

Validado tecnicamente em 27/09/2026: PPTX gerado e seis PNGs revisados com renderização do PowerPoint desktop. Todos os textos do plano estão no arquivo; os diagramas usam formas nativas e os ícones são SVGs Lucide incorporados. A versão 4 usa o layout exato Custom Layout 111211112, com faixa azul arredondada e título branco. O rodapé institucional vem do layout 1112111112. O corpo fica abaixo de y=1,25 e acima de y=6,95 polegadas. Linhas e polígonos são formas nativas editáveis.

Os parágrafos de disponibilidade e patrocínio ocupam quatro linhas a 20 pt. O fechamento permanece acima do rodapé original, com frase final em caixa de 0,62 polegada para permitir quebra sem corte.

A revisão cobre os textos do exemplo internalizacao-power-bi, não comprimentos arbitrários nem aprovação do usuário. Mudanças nesta composição devem incrementar a versão; mudanças compartilhadas em visual-layouts.js devem atualizar todas as receitas afetadas.

Revisão da versão 3: seis PNGs conferidos após trocar os ícones por Lucide e adotar o fundo do layout nativo. O título mantém geometria e estilo do layout. O rodapé foi comparado pixel a pixel com a referência e permaneceu idêntico nos seis slides. Não duplicar a faixa estreita do slide de referência. Ícones novos devem usar slide.addIcon; preservar os ícones originais do rodapé.

Versão 4 revisada: seis PNGs conferidos e rodapé idêntico pixel a pixel. Os layouts 111211112 e 1112111112 são diferentes; selecionar pelo nome exato. A imagem de fundo do primeiro inclui espaço branco abaixo da faixa azul, portanto sua altura total não indica a área azul: manter subtítulos escuros em y=1,25. A troca de rodapé ocorre somente na cópia de trabalho, preservando os objetos do doador e o arquivo original.
