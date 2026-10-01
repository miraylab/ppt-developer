# Memória de estruturas Michelin

`brands/michelin` guarda identidade visual e tokens. `instrucoes-ppt/michelin-dados` guarda composição, critérios de uso e aprendizados. O conteúdo de cada apresentação fica em `presentations`.

```text
instrucoes-ppt/michelin-dados/
  catalog.json
  layouts.js
  README.md
  patterns/
    capa/
    conteudo/
    layout-conteudo/
    encerramento/
```

Cada padrão contém `create-slide.js` e um README. As receitas dependem dos slides e layouts do template Michelin e usam a engine `powerpoint-template`.

## Aprendizado e reutilização

A memória é explícita, local e versionável. O autor ou o Codex transforma composições reutilizáveis em receitas e registra correções observadas. Não há treinamento de modelo ou dedução automática de layouts. O AGENTS.md da raiz orienta o processo nas próximas tarefas.

1. Consulte o catálogo antes de criar outra composição: `npm run knowledge -- "conteúdo"`.
2. Leia as instruções do padrão e reutilize-o com conteúdo novo, sem transferir nomes ou dados antigos.
3. Se nenhum padrão servir, desenvolva uma receita Michelin parametrizada e registre sua origem, campos e limites.
4. Gere o PPTX, revise os PNGs e corrija cortes e sobreposições.
5. Registre o aprendizado no README da receita. Atualize sua versão quando mudar código ou composição.

Novos padrões começam com status `draft`. Use `validated` após revisão visual; isso não indica aprovação comercial pelo usuário. Um build bem-sucedido não valida automaticamente o design.

## Usar uma receita

O config seleciona `brand: 'michelin'`, `style: 'michelin-dados'` e `engine: 'powerpoint-template'`; esses valores também são os padrões do build.

```js
export function createSlide(context) {
  return context.knowledge.create('layout-conteudo', context, {
    title: 'Próximas entregas',
    body: 'A equipe revisará o plano a cada semana.'
  });
}
```

A busca compara palavras com nomes, descrições e tags, ignorando acentos. Não faz análise visual. Ler a instrução do padrão é necessário para escolher a estrutura adequada.

## Registrar uma estrutura

- Adicione a pasta `patterns/<id>/` com `create-slide.js` e `README.md`.
- Inclua no catálogo `id`, `title`, `description`, `tags`, `version` inteira positiva, `status` e referência em `examples`.
- Exporte `createSlide({ pptx, theme, presentation, number, paths, content })`, criando exatamente um slide.
- Consulte `npm run template:inspect` para obter IDs, nomes e geometria dos layouts da fonte.
- Use `layouts.js` para posições de caixas novas e a brand para cores e fontes. Mestres e objetos herdados permanecem no template.
- Documente quando usar e evitar, campos, limites e aprendizados observados.

Os 113 layouts originais estão preservados. Há dez receitas revisadas: quatro do exemplo inicial e seis composições executivas em visual-layouts.js (convergência, iceberg, riscos, jornada, cenários e pilares). Reinspecione e remapeie as receitas se o arquivo fonte mudar.

## Persistência

O conhecimento durável é o código e os READMEs versionados. `output/knowledge-usage.json` registra os usos no último build concluído; sua versão temporal coincide com o manifesto desse build. Em caso de falha, consulte o status em `manifest.json`. Slides escritos diretamente não aparecem na lista de usos.

PNGs e PPTXs gerados permanecem em output. Não inclua dados específicos de clientes nos aprendizados genéricos. O modo dev observa alterações nas receitas e no template.
