# Michelin: estruturas do template de dados

Usar com `brand: 'michelin'` e `engine: 'powerpoint-template'`. Estas receitas dependem dos IDs e layouts do arquivo `template_michelin.pptx` recebido. A geometria e a identidade visual de base permanecem no template nativo.

O exemplo combina capa, conteúdo em duas colunas, conteúdo criado diretamente de um layout e encerramento. O quarto slide original (Town Hall) não entra nessa sequência de exemplo, mas continua no template fonte e pode ser utilizado pelo ID `2147483593`. Nenhum conteúdo dele é transferido para slides novos.

## Referências

O template salvo pelo usuário tem 4 slides, 3 mestres e 113 layouts em 960 × 540 pontos (16:9). Execute `npm run template:inspect -- michelin-example` para gerar inventário completo e PNGs dos slides originais. Os arquivos ficam em `presentations/michelin-example/output/`.

## Aprendizados

- Há shapes diferentes com o mesmo nome na capa. Selecionar `shapeId` evita alterar a data no lugar do subtítulo.
- Os mestres 2 e 3 têm layouts com nomes iguais. Selecionar layout pelo par `master` e `name`, não apenas pelo nome.
- Duplicar o slide conserva suas alterações locais; criar a partir do layout utiliza a geometria definida no mestre. As duas opções podem ter aparência diferente e precisam ser revisadas.
- Preservar todos os mestres e layouts antes de remover os slides originais da cópia evita perder opções não usadas pelo exemplo.
- O fundo, fotos e logos mantêm o tipo de objeto que tinham no template. Elementos que já eram imagens continuam imagens; a integração não transforma imagens em vetores ou gráficos nativos.
- Ao criar caixas de texto via COM, o PowerPoint pode encolher a caixa vazia antes de desativar AutoSize. A engine reaplica a geometria depois da formatação para manter a área especificada pelo layout.

Os quatro padrões do exemplo inicial e as seis composições de internalizacao-power-bi foram renderizados e revisados com PowerPoint desktop. O arquivo gerado conserva 3 mestres e 113 layouts. A comparação do hash SHA-256 confirmou que o template fonte não mudou. Esta revisão valida o conteúdo curto do exemplo, não textos arbitrariamente longos.

Mudanças no arquivo fonte podem invalidar IDs ou nomes. Reinspecione o template e atualize as receitas antes de marcar a nova versão como validada. Novos textos precisam de revisão visual mesmo quando o padrão já estiver validado.

## Preferências gerais confirmadas

As composições executivas usam os fundos dos layouts nativos, com espaço amplo para títulos, preservando o rodapé. Os ícones novos devem vir de Lucide; os do rodapé original permanecem intactos. Não reutilizar o cabeçalho compacto dos slides de referência nas novas composições.

Layout solicitado para as composições executivas: **Custom Layout 111211112** (nome interno `Custom Layout 1 1 1 2 1 1 1 1 2`), mestre `Slides Internos (Conteúdo)`. Preservar o rodapé do layout `Custom Layout 1 1 1 2 1 1 1 1 1 2` por meio de `footerFrom`, substituindo somente os elementos abaixo de 6,7 polegadas na cópia de trabalho. O arquivo fonte não é alterado. O layout do título azul em fundo branco usado antes não é o fundo escolhido pelo usuário.

### Referência manual de composição

A edição manual do slide 1 de internalizacao-power-bi é a referência mais recente: manual-reference/README.md nessa apresentação descreve os ajustes. Reutilizar a hierarquia visual, o alinhamento de blocos comparáveis, as bordas sem preenchimento e o destaque da frase central quando pertinentes. Antes de regenerar essa apresentação, sincronizar ou preservar o slide manual; a receita v7 ainda não incorpora esses ajustes.

## Preservação de edições manuais

### Referência consolidada de 28/09/2026

Os seis slides de `internalizacao-power-bi` receberam refinamentos manuais e estão protegidos. A referência completa está em `presentations/internalizacao-power-bi/manual-reference/inspection-20260928-061842/`.

Princípios confirmados: simplificar títulos; usar amarelo como destaque da mensagem central; representar colaboração por proximidade e agrupamento; dimensionar metáforas visuais de acordo com a relação que comunicam; usar cabeçalhos preenchidos para distinguir cenários; remover conclusões redundantes; centralizar texto horizontal e verticalmente dentro de contêineres. Antes de alterar qualquer slide dessa apresentação, partir do PPTX atual e sincronizar somente o slide selecionado.

Refinamento do slide 5 em 28/09/2026: listas comparativas devem usar recuo pendente e espaçamento suficiente entre itens. Aplicar negrito ou marca-texto apenas à consequência decisiva, mantendo os marcadores fora do realce. Reposicionar o conjunto antes de reduzir a fonte. Referência em `presentations/internalizacao-power-bi/manual-reference/slide5-final-20260928-064633/`.

Atualização de 27/09/2026: slides **1 e 2** de internalizacao-power-bi estão protegidos. A referência manual do slide 2 está em `presentations/internalizacao-power-bi/manual-reference/slide2-20260927-183157/`. Para comparações, aproveitar seus títulos alinhados, proximidade entre números e rótulos e distribuição espacial dos conceitos na metáfora visual. As receitas anteriores não reproduzem os refinamentos manuais; não reconstruir esses slides.

Em apresentações híbridas, o PPTX salvo pelo usuário é a fonte principal. O slide 1 de internalizacao-power-bi está protegido e não deve ser reconstruído. Use scripts/edit-slides.js com seleção explícita. Antes de regenerar um slide selecionado, incorporar à receita os ajustes finos daquele slide que devam permanecer. Slides não selecionados são preservados integralmente; o sistema verifica os componentes e a renderização.

Referência manual do slide 3 (27/09/2026): privilegiar agrupamentos compactos de ícone/título/descrição, conceito central maior e relações comunicadas por posição, dispensando conectores quando redundantes. Ver manual-reference/slide3-20260927-185322 na apresentação internalizacao-power-bi. Proteção atual: slides 1, 2 e 3.
