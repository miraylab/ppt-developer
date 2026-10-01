# Apresentações Michelin

## Edição híbrida de apresentações com ajustes manuais

`internalizacao-power-bi` usa `editMode: 'hybrid'` e protege o slide 1. O build completo está bloqueado. Para substituir somente o slide 2: `node scripts/edit-slides.js internalizacao-power-bi 2`. Para vários slides não protegidos, use números separados por vírgula. A ordem deve coincidir com `src/index.js`; remapeie o código se inserir ou reordenar slides manualmente.

O ponto de partida é sempre o PPTX mais recente em output. Salve suas alterações no PowerPoint antes de pedir a próxima edição. Cada rodada guarda uma cópia integral em `revisions/<data>/before.pptx`. A substituição troca somente as partes dos slides indicados e incorpora suas novas imagens; todos os outros componentes originais são verificados byte a byte. Os slides não selecionados também são renderizados antes/depois e comparados. Um salvamento detectado durante a operação cancela a publicação. Se o PowerPoint bloquear o arquivo para gravação, feche-o antes de tentar novamente.

O slide protegido nunca é reconstruído pelo código. Os outros slides podem receber ajustes manuais, mas, quando selecionados explicitamente para regeneração, seu conteúdo será substituído pela receita; incorpore primeiro os refinamentos que devam permanecer. Layouts e rodapés existentes são preservados. A edição seletiva suporta textos, formas e imagens/SVGs; relações de gráficos ou outros objetos não suportados na nova geração fazem a operação falhar sem publicar.

O modo híbrido requer Python 3, sem bibliotecas adicionais. Usa `PYTHON_PATH`, o Python local fornecido pelo Codex quando disponível, ou `python` no PATH. Teste adicional: `python engine/template/test_replace_slides.py`. Os relatórios ficam em `output/hybrid-report.json` e na pasta da revisão.

Sistema local para criar apresentações editáveis a partir de `template_michelin.pptx`. JavaScript define conteúdo e ordem dos slides; PowerPoint desktop trabalha em uma cópia do template e exporta o PPTX. O viewer exibe somente os PNGs renderizados desse arquivo.

## Requisitos e instalação

- Windows com PowerPoint desktop instalado e funcional em uma sessão de usuário.
- Node.js 20 ou superior com npm no PATH.
- Fontes Open Sans e Open Sans ExtraBold instaladas para reproduzir o template.
- `template_michelin.pptx` na raiz do projeto.

```powershell
npm install
npm run build
npm run preview
```

Sem argumentos, os comandos usam `michelin-example`. A instalação baixa pacotes npm; geração e renderização são locais, sem upload ou APIs externas. As fontes não são baixadas nem incorporadas automaticamente.

## Comandos

```powershell
npm run build -- michelin-example
npm run preview -- michelin-example
npm run dev -- michelin-example
npm run template:inspect -- michelin-example
npm run knowledge -- "conteúdo"
npm test
```

- **build:** carrega conteúdo e receitas, copia o template, preenche os objetos e salva o PPTX. Limpa previews antigos, gera PNGs e publica o manifesto. Um lock evita builds concorrentes da mesma apresentação.
- **preview:** abre o viewer local com thumbnails, anterior/próximo, setas, Home/End e contador.
- **dev:** observa slides, config, marca, receitas, engine, assets e o template selecionado. Agrupa alterações e executa os builds em novos processos para recarregar todos os módulos. Ignora output.
- **template:inspect:** gera `output/template-inventory.json` com slides, mestres, layouts e shapes, além de `output/reference-preview/` com os slides originais renderizados. Trabalha em uma cópia isolada da fonte.
- **knowledge:** procura estruturas por nome, descrição e tags, ignorando acentos. Não faz análise visual automática.

O servidor escuta somente em `127.0.0.1`, na porta 3000 por padrão. Para mudar a porta ou impedir abertura automática do navegador:

```powershell
$env:PORT = '3001'
$env:NO_OPEN = '1'
npm run preview
```

Use Ctrl+C para encerrar. Não execute dois viewers na mesma porta. Paths são resolvidos a partir da localização do projeto; scripts podem ser chamados por caminho absoluto. O npm normalmente deve ser executado na raiz ou com `npm --prefix <pasta>`.

## Arquitetura

```text
brands/michelin/                  Tokens e descrição do design
instrucoes-ppt/michelin-dados/    Receitas, layouts e aprendizados
engine/template/                 Plano de slides e automação PowerPoint
engine/knowledge/                Busca e carregamento das receitas
engine/render/                   Renderização local dos previews
engine/utils/                    Paths, arquivos e processos
viewer/                          HTML/CSS/JS e servidor local
presentations/michelin-example/  Exemplo funcional e output
scripts/                         Comandos de operação
```

A identidade visual vem do template. `brands/michelin/colors.js` e `typography.js` centralizam os tokens das caixas novas e as referências de cores. As composições e critérios de uso ficam em `instrucoes-ppt`.

Veja a [descrição do design Michelin](brands/michelin/DESIGN.md) para cores, fontes, tamanhos, medidas e distinção entre elementos herdados e escolhas da implementação.

## Nova apresentação

1. Copie `presentations/michelin-example` para `presentations/minha-apresentacao`, sem output.
2. Altere `id` no config para coincidir com o nome da pasta.
3. Edite os arquivos de `src/slides/` e organize suas importações em `src/index.js`.
4. Execute `npm run dev -- minha-apresentacao`.

```js
export default {
  id: 'minha-apresentacao',
  title: 'Minha apresentação',
  brand: 'michelin',
  style: 'michelin-dados',
  engine: 'powerpoint-template',
  outputName: 'presentation.pptx',
  renderer: 'powerpoint'
};
```

`brand`, `style` e `engine` assumem os valores acima quando omitidos. IDs aceitam letras, números, hífen e underscore. `outputName` deve ser um nome simples terminado em `.pptx`.

Exemplo de slide que reutiliza uma estrutura:

```js
export function createSlide(context) {
  return context.knowledge.create('layout-conteudo', context, {
    title: 'Próximas entregas',
    body: 'A equipe revisará o plano a cada semana.'
  });
}
```

Cada função cria exatamente um slide. Os padrões atuais são capa, conteúdo em duas colunas, conteúdo criado de um layout e encerramento. Consulte as instruções de cada padrão antes de adicionar conteúdo.

## API de template

```js
const slide = pptx.addTemplateSlide({ slideId: 256 });
slide.setText({ shapeId: 1227 }, 'DATA BOARD');

const other = pptx.addTemplateSlide({
  layout: {
    master: 'Slides Internos (Conteúdo)',
    name: 'Custom Layout 1 1 1 2 1 1 1 1 1 2'
  }
});
other.setText({ placeholderType: 1 }, 'Novo assunto');
```

Selecione texto por `shapeId`, `name` ou `placeholderType`, um por vez. Seletores ausentes ou ambíguos interrompem o build. IDs e nomes devem vir do inventário. Os placeholders 1 e 4 são título e subtítulo. A substituição conserva o estilo do objeto, mas pode uniformizar diferenças de formatação dentro daquele texto.

Para texto novo, use `slide.addText(texto, { x, y, w, h, fontFace, fontSize, color, bold })`, obtendo posições e estilos de `theme`. `align` aceita `left`, `center` e `right`; `spaceAfter` define o espaço entre parágrafos em pontos. Posições estão em polegadas; fontes em pontos. As medidas do inventário nativo estão em pontos.

Diagramas editáveis usam `slide.addShape(tipo, { x, y, w, h, fill, line })`, `slide.addLine([x1,y1], [x2,y2], { color, width, arrow })` e `slide.addPolygon([[x,y], ...], { fill })`. Tipos disponíveis: `rect`, `ellipse`, `hexagon`, `triangle`, `downArrow`, `rightArrow`, `chevron` e `pentagon`. Cores são hexadecimais sem `#`; largura de linha em pontos. A API não inclui criação programática de tabelas e gráficos de dados.

Ícones usam `slide.addIcon('shield-check', { x, y, w, h, color: '005AAB', strokeWidth: 2 })`. A engine lê o SVG oficial da dependência local `lucide-static` e o incorpora ao PPTX, sem vínculos externos ou chamadas de rede durante o build. O SVG pode ser movido e redimensionado no PowerPoint; seus traços internos não são formas separadas. A licença ISC acompanha o pacote. Referência: [Lucide Static](https://lucide.dev/guide/static).

O exemplo executivo completo está em `presentations/internalizacao-power-bi`. Gere com `node scripts/build.js internalizacao-power-bi` e visualize com `node scripts/preview.js internalizacao-power-bi`.

O template está definido em `brands/michelin/theme.js`. Um config pode selecionar outra versão Michelin com `template: 'caminho/arquivo.pptx'`, relativo à raiz. Alterar IDs ou nomes no arquivo fonte pode exigir remapear as receitas.

## Renderização, outputs e Git

```text
presentations/<id>/output/
  presentation.pptx
  manifest.json
  knowledge-usage.json
  template-build.json
  preview/slide-01.png ...
```

O original nunca é editado pelo build. A cópia de trabalho e os temporários ficam dentro de output e são limpos ao terminar. O arquivo gerado mantém os mestres e layouts; fotos e logos conservam seus tipos originais. Textos continuam editáveis. A inspeção do exemplo confirmou 3 mestres e 113 layouts preservados.

O fluxo padrão é PPTX → PowerPoint → PNGs em 1600 × 900 para o template 16:9. O browser não recria os slides em HTML. Durante build ou erro, o viewer informa o estado; só apresenta previews prontos após sucesso.

A engine exige PowerPoint no Windows para criar o PPTX. Há uma alternativa opcional de renderização via LibreOffice + Poppler (`PPTX_RENDERER=libreoffice`, `SOFFICE_PATH` e `PDFTOPPM_PATH`), mas ela não substitui o PowerPoint na criação a partir do template. Pode haver diferenças visuais entre renderizadores. Cada comando de conversão tem timeout de dois minutos.

`template-build.json` registra origem, hash e plano aplicado. `knowledge-usage.json` registra receitas e versões. Ambos se referem à última geração concluída; confira o estado atual em `manifest.json`.

Outputs e node_modules são ignorados no Git. Versione fontes, receitas, assets, template e package-lock.json. Use `npm ci` para reproduzir a instalação. Edições manuais no PPTX de output não retornam ao JavaScript e serão substituídas no próximo build.

## Solução de problemas

- **Arquivo bloqueado:** feche o PPTX de output no PowerPoint antes de reconstruir.
- **COM indisponível:** abra o PowerPoint desktop normalmente e conclua eventuais telas de ativação.
- **Fonte diferente:** instale as fontes presentes no template.
- **Layout/shape ausente:** reinspecione o arquivo e atualize a receita.
- **Porta ocupada:** altere PORT ou encerre o viewer anterior.
- **Lock inválido:** confirme que nenhum build está ativo antes de remover `output/.build.lock`. Locks de processos encerrados são recuperados automaticamente.
- **npm não reconhecido:** instale Node.js com npm e abra um novo terminal.

Referências: [layouts nativos](https://learn.microsoft.com/en-us/office/vba/api/powerpoint.customlayout) e [identificação de slides](https://learn.microsoft.com/en-us/office/vba/api/powerpoint.slides.findbyslideid).
