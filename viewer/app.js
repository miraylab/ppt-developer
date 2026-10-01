const $ = id => document.getElementById(id);
let slides = [], current = 0, version;
function imageUrl(name) { return `/preview/${encodeURIComponent(name)}?v=${version}`; }
function select(index) {
  if (!slides.length) return;
  current = Math.max(0, Math.min(index, slides.length - 1));
  $('slide').src = imageUrl(slides[current]);
  $('slide').alt = `Slide ${current + 1} de ${slides.length}`;
  $('slide').hidden = false;
  $('position').textContent = `${current + 1} / ${slides.length}`;
  $('previous').disabled = current === 0;
  $('next').disabled = current === slides.length - 1;
  [...$('thumbnails').children].forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
  $('thumbnails').children[current]?.scrollIntoView({ block: 'nearest' });
}
function clear() {
  slides = [];
  $('thumbnails').replaceChildren();
  $('slide').hidden = true;
  $('slide').removeAttribute('src');
  $('count').textContent = '0 slides';
  $('position').textContent = '—';
  $('previous').disabled = $('next').disabled = true;
}
async function refresh() {
  try {
    const response = await fetch('/api/slides', { cache: 'no-store' });
    if (!response.ok) throw new Error('Resposta inválida do servidor.');
    const data = await response.json();
    if (data.title) { $('title').textContent = data.title; document.title = `${data.title} · Preview`; }
    if (data.status !== 'ready') {
      version = undefined;
      clear();
      $('status').textContent = data.status === 'building' ? 'Gerando apresentação e previews…' : data.status === 'error' ? data.error : 'Nenhum preview disponível. Execute o comando build para esta apresentação.';
      return;
    }
    $('status').textContent = 'Previews renderizados do PowerPoint';
    if (version === data.version) return;
    version = data.version;
    slides = data.slides;
    $('count').textContent = `${slides.length} slides`;
    $('thumbnails').replaceChildren(...slides.map((name, index) => {
      const button = document.createElement('button');
      button.className = 'thumbnail';
      button.setAttribute('aria-label', `Abrir slide ${index + 1}`);
      const img = document.createElement('img'); img.src = imageUrl(name); img.alt = ''; img.loading = 'lazy';
      const label = document.createElement('span'); label.textContent = `Slide ${String(index + 1).padStart(2, '0')}`;
      button.append(img, label); button.addEventListener('click', () => select(index)); return button;
    }));
    select(current);
  } catch { $('status').textContent = 'Sem conexão com o viewer. Tentando novamente…'; }
  finally { setTimeout(refresh, 1000); }
}
$('previous').addEventListener('click', () => select(current - 1));
$('next').addEventListener('click', () => select(current + 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    select(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
$('slide').addEventListener('error', () => { $('status').textContent = 'Falha ao carregar o PNG. Aguarde o build ou consulte o terminal.'; version = undefined; });
refresh();
