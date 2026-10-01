# Comparação de três cenários

> Referência manual de 28/09/2026: cada cenário usa faixa superior preenchida na sua cor, com ícone branco e título dentro da faixa; o fechamento inferior foi removido. Essa hierarquia acelera a leitura das alternativas e deixa o corpo plano. Ver `presentations/internalizacao-power-bi/manual-reference/inspection-20260928-061842/preview/slide-05.png`. A receita atual não reproduz essa referência.

## Refinamento inferior de 28/09/2026

Manter as faixas superiores intactas. Abaixo de cada cabeçalho, usar um parágrafo curto que descreva a alternativa; depois, um traço horizontal e três consequências em bullets. O parágrafo usa Open Sans regular e cor neutra. Os bullets carregam a cor do cenário: azul para Planejada, azul-marinho com traço amarelo para AS IS e vermelho para Não Avançar. Não usar negrito em todo o corpo.

Os três blocos devem compartilhar as mesmas posições verticais para facilitar a comparação, mesmo quando os textos quebram em quantidades diferentes de linhas. Preservar espaço entre os bullets e o rodapé. Implementação pontual e editável em `scripts/edit-slide5-manual.ps1`; a receita `visual-layouts.js` ainda não incorpora esta versão e não deve reconstruir o slide protegido.

A versão 5 torna `takeaway` opcional para não reintroduzir a frase inferior removida. O restante da composição manual ainda não foi sincronizado na receita; por isso o padrão permanece `draft` e o slide 5 continua protegido.

## Aprendizado manual final

Referência: `presentations/internalizacao-power-bi/manual-reference/slide5-final-20260928-064633/preview/slide-05.png`.

- Usar recuo pendente nos bullets: marcador em uma coluna própria e linhas seguintes alinhadas com o início do texto.
- Aumentar o espaço entre bullets para que cada consequência seja percebida separadamente.
- Destacar apenas a consequência decisiva. Na alternativa planejada, usar negrito no risco crítico; em AS IS, aplicar marca-texto amarelo somente ao texto dos bullets, mantendo os marcadores azuis fora do realce.
- Elevar traço e lista quando houver excesso de espaço entre a descrição e as consequências. Preservar margem confortável até o rodapé.
- Manter cabeçalhos e faixas superiores intactos durante ajustes no corpo.

A referência final do usuário prevalece sobre `scripts/edit-slide5-manual.ps1` e sobre a receita v5 atual.

Comparar ações e consequências de três alternativas.

Origem: template_michelin.pptx, mestre Slides Internos (Conteúdo), layout Custom Layout 1 1 1 2 1 1 1 1 2, e briefing de internalização de Power BI fornecido pelo usuário. Implementação parametrizada em visual-layouts.js. Identidade visual em brands/michelin.

Campos: title, takeaway, scenarios (3 objetos title/actions/results). O conteúdo específico deve permanecer em presentations. Não usar quando as quantidades indicadas ou a densidade forem incompatíveis; ajustar a composição e incrementar a versão.

## Aprendizados

Validado tecnicamente em 27/09/2026: PPTX gerado e seis PNGs revisados com renderização do PowerPoint desktop. Todos os textos do plano estão no arquivo; os diagramas usam formas nativas e os ícones são SVGs Lucide incorporados. A versão 4 usa o layout exato Custom Layout 111211112, com faixa azul arredondada e título branco. O rodapé institucional vem do layout 1112111112. O corpo fica abaixo de y=1,25 e acima de y=6,95 polegadas. Linhas e polígonos são formas nativas editáveis.

A área de resultados precisa de 1,25 polegada para os resultados com quebra de linha. A comparação revisada usa até quatro ações e três resultados por cenário. Verde, amarelo e vermelho são semânticos, não uma paleta oficial adicional da marca.

A revisão cobre os textos do exemplo internalizacao-power-bi, não comprimentos arbitrários nem aprovação do usuário. Mudanças nesta composição devem incrementar a versão; mudanças compartilhadas em visual-layouts.js devem atualizar todas as receitas afetadas.

Revisão da versão 3: seis PNGs conferidos após trocar os ícones por Lucide e adotar o fundo do layout nativo. O título mantém geometria e estilo do layout. O rodapé foi comparado pixel a pixel com a referência e permaneceu idêntico nos seis slides. Não duplicar a faixa estreita do slide de referência. Ícones novos devem usar slide.addIcon; preservar os ícones originais do rodapé.

Versão 4 revisada: seis PNGs conferidos e rodapé idêntico pixel a pixel. Os layouts 111211112 e 1112111112 são diferentes; selecionar pelo nome exato. A imagem de fundo do primeiro inclui espaço branco abaixo da faixa azul, portanto sua altura total não indica a área azul: manter subtítulos escuros em y=1,25. A troca de rodapé ocorre somente na cópia de trabalho, preservando os objetos do doador e o arquivo original.
