# Design Michelin no projeto

O arquivo `template_michelin.pptx` é a referência visual. A integração conserva seus 3 mestres e 113 layouts. Fotos, logos Michelin e Michelin Connected Fleet, faixas e rodapés permanecem como objetos do arquivo original.

## Cores

| Papel | Cor | Origem e aplicação |
| --- | --- | --- |
| Azul | `#005AAB` | Observado no layout de conteúdo (`slideLayout55.xml`), inclusive no estilo do título. |
| Azul escuro | `#002165` | Observado no layout de conteúdo, no preenchimento do rodapé. |
| Amarelo | `#FCE500` | Observado na faixa de destaque do layout da capa (`slideLayout65.xml`). |
| Amarelo vivo | `#FFFF00` | Observado na data da capa e nos destaques do layout de conteúdo. |
| Branco | `#FFFFFF` | Base clara e contraste presentes no template. |
| Texto novo | `#172B42` | Escolhido na implementação para as caixas de conteúdo adicionadas. Não foi extraído de uma especificação oficial Michelin. |

As referências estão em `colors.js` e também controlam os novos diagramas editáveis. Mudar esses tokens não recolore automaticamente mestres, fotos ou logos. Para mudar os elementos herdados, edite o template e gere novamente.

Os diagramas executivos acrescentam cores de apoio escolhidas no projeto: gelo `#C8DFF1`, fundo claro `#EFF5FA`, linhas `#BED0E0`, verde semântico `#20804B` e vermelho semântico `#B32C35`. O amarelo `#FCE500` também sinaliza atenção. Verde e vermelho atendem à comparação de cenários do briefing e não são apresentados como cores oficiais da marca.

O tema global do arquivo ainda contém a paleta padrão do Office. Por isso a descrição acima usa cores aplicadas nos elementos dos layouts selecionados, não a paleta global. Não é uma declaração do manual oficial da marca nem uma lista de todas as cores existentes nos 113 layouts. Algumas faixas e logos já são imagens e mantêm suas próprias cores.

## Tipografia

- **Títulos herdados:** Open Sans ExtraBold, com peso, itálico e demais propriedades preservados de cada placeholder.
- **Texto herdado:** Open Sans nas áreas principais inspecionadas. Alguns campos auxiliares dos layouts usam Calibri/Arial, mantidos como vieram.
- **Caixas novas:** Open Sans ExtraBold a 24 pt nos títulos das duas colunas; Open Sans a 22 pt na introdução e no corpo. Esses valores estão em `typography.js`.
- **Diagramas executivos:** mantêm as famílias acima, com hierarquia própria. Textos principais entre 18 e 25 pt; legendas do mapa de riscos entre 13,3 e 15 pt; prazo em destaque a 55 pt. Geometria e tamanhos estão em `instrucoes-ppt/michelin-dados/visual-layouts.js`.
- **Referências do arquivo original:** título da capa a 48 pt; identificação/data a 16 pt; título do slide de conteúdo existente a 24 pt; mensagem de encerramento a aproximadamente 46,67 pt; identificação do encerramento a 36 pt. Outros layouts podem ter valores diferentes.

As fontes precisam estar instaladas no computador. O projeto não baixa nem incorpora fontes automaticamente. Textos substituídos mantêm o estilo do objeto original; uma substituição completa pode uniformizar variações de formatação dentro daquele texto.

## Formato e composição

- Widescreen 16:9: 960 × 540 pontos, equivalente a 13⅓ × 7,5 polegadas.
- Capa com fotografia, título à esquerda, acento amarelo e logos originais.
- Conteúdo em duas colunas com cabeçalho compacto e rodapé de marca preservados do slide fonte.
- Conteúdo criado de layout nativo com título azul e corpo na área livre. O cabeçalho difere do slide duplicado porque o slide fonte possui alterações locais.
- As seis composições executivas usam o layout nativo `Custom Layout 1 1 1 2 1 1 1 1 2` do mestre `Slides Internos (Conteúdo)`: faixa azul com canto arredondado e título branco; o rodapé institucional vem do layout doador indicado abaixo. O conteúdo é reposicionado abaixo dessa área, mantendo os tamanhos de fonte do corpo.
- Encerramento com fotografia de caminhão, título e identificação editáveis.

As posições do conteúdo novo estão em `instrucoes-ppt/michelin-dados/layouts.js`: margem esquerda de 0,7 polegada no slide de duas colunas; cada coluna tem largura de 5,4 polegadas, com a segunda iniciando em 7,0; o corpo do layout nativo inicia em x=0,9 e y=1,85, com largura de 11,5 polegadas. A área do rodapé permanece livre.

## Editabilidade e limites

Ícones novos vêm de [Lucide](https://lucide.dev/guide/static), versão fixada em package.json. São SVGs vetoriais incorporados, movíveis e redimensionáveis no PowerPoint. Os ícones da marca no rodapé original não são substituídos. Traços novos usam azul; ícones de cenário usam as cores semânticas. O alerta usa `#B88700` para manter contraste sobre branco.

Os textos substituídos e adicionados são nativos do PowerPoint. Fotos e logos que já eram imagens continuam imagens; não são reconstruídos como vetores. Os PNGs servem apenas para revisão. Dez receitas foram revisadas visualmente; os outros layouts estão preservados e disponíveis para seleção, mas ainda não foram todos catalogados como receitas validadas.

Layout solicitado para as composições executivas: **Custom Layout 111211112** (nome interno `Custom Layout 1 1 1 2 1 1 1 1 2`), mestre `Slides Internos (Conteúdo)`. Preservar o rodapé do layout `Custom Layout 1 1 1 2 1 1 1 1 1 2` por meio de `footerFrom`, substituindo somente os elementos abaixo de 6,7 polegadas na cópia de trabalho. O arquivo fonte não é alterado. O layout do título azul em fundo branco usado antes não é o fundo escolhido pelo usuário.
