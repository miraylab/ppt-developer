export function createSlide(context) {
  return context.knowledge.create('conteudo', context, {
    title: 'Prioridades da equipe',
    intro: 'Projeto piloto para organizar o acompanhamento das entregas.',
    leftTitle: 'Planejamento',
    leftBody: 'Cada entrega terá um responsável e uma data acordada com a equipe.',
    rightTitle: 'Acompanhamento',
    rightBody: 'Uma reunião semanal permitirá revisar pendências e ajustar o plano.'
  });
}
