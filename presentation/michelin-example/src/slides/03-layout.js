export function createSlide(context) {
  return context.knowledge.create('layout-conteudo', context, {
    title: 'Rotina de acompanhamento',
    body: 'A equipe revisará as entregas em andamento a cada semana.\n\nAs decisões serão registradas com o responsável e o prazo combinado.'
  });
}
