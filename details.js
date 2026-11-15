const legacyPlaces = new Set([
  'machinery', 'museum', 'yilou', 'fenglin', 'flag-site', 'architecture',
  'youth', 'fields', 'park',
]);

function followOldPlaceLink() {
  const fragment = window.location.hash.slice(1);
  if (legacyPlaces.has(fragment)) window.location.replace(`place-${fragment}.html`);
  if (['directory', 'carnival', 'chengfu'].includes(fragment)) window.location.replace('places.html');
}

followOldPlaceLink();
window.addEventListener('hashchange', followOldPlaceLink);

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const controls = carousel.querySelector('[data-controls]');
  const caption = carousel.querySelector('[data-slide-caption]');
  const counter = carousel.querySelector('[data-slide-count]');
  const toggle = carousel.querySelector('[data-slide-toggle]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let requested = 0;
  let timer;
  let paused = reducedMotion.matches;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden) {
      timer = setTimeout(() => show(1), 7000);
    }
  }

  function setPaused(value) {
    paused = value;
    toggle.textContent = paused ? '播放' : '暂停';
    toggle.setAttribute('aria-label', paused ? '播放封面轮播' : '暂停封面轮播');
    schedule();
  }

  async function show(step) {
    clearTimeout(timer);
    const index = (requested + step + slides.length) % slides.length;
    requested = index;
    const incoming = slides[index];
    if (incoming.dataset.src) {
      incoming.src = incoming.dataset.src;
      delete incoming.dataset.src;
    }
    await incoming.decode().catch(() => {});
    if (index !== requested) return;
    if (incoming.naturalWidth) {
      slides[current].hidden = true;
      incoming.hidden = false;
      current = index;
      caption.textContent = incoming.alt;
      counter.textContent = `${index + 1} / ${slides.length}`;
    }
    schedule();
  }

  for (const button of controls.querySelectorAll('[data-slide-step]')) {
    button.addEventListener('click', () => show(Number(button.dataset.slideStep)));
  }
  toggle.addEventListener('click', () => setPaused(!paused));
  reducedMotion.addEventListener('change', (event) => setPaused(event.matches));
  document.addEventListener('visibilitychange', schedule);
  counter.textContent = `1 / ${slides.length}`;
  controls.hidden = false;
  setPaused(paused);
}
