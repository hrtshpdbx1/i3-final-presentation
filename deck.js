// ============================================================
// Show one slide at a time.
// The .active class controls opacity AND visibility. Hidden
// slides are removed from the accessibility tree and from the
// tab order, so a screen reader never reads an off-screen slide.
// ============================================================

const slides = Array.from(document.querySelectorAll('.slide'));
const announcer = document.getElementById('announcer');
const count = document.getElementById('count');
const progress = document.getElementById('progress');
let index = 0;

// --- Closing drop -------------------------------------------
// The portraits fall 2s after the slide is shown, not on page
// load. The class is removed when we leave, so it plays again
// if I come back to the slide.
let dropTimer = null;

function handleDrop() {
  clearTimeout(dropTimer);
  slides.forEach((s) => s.classList.remove('is-dropped'));

  const current = slides[index];
  if (!current.hasAttribute('data-drop')) return;

  dropTimer = setTimeout(() => current.classList.add('is-dropped'), 2000);
}

function render() {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);

    // Stop any video as soon as we leave its slide.
    // Sound running under the next slide is confusing.
    if (i !== index) slide.querySelector('video')?.pause();
  });

  count.textContent = `${index + 1} / ${slides.length}`;
  progress.style.width = `${((index + 1) / slides.length) * 100}%`;

  // Move focus to the slide, so the screen reader reads the new
  // content and the keyboard user is in the right place.
  slides[index].focus();

  announcer.textContent = `Diapositive ${index + 1} sur ${slides.length}`;

  // Trigger the closing animation if this slide has data-drop.
  handleDrop();
}

function go(step) {
  const next = index + step;
  if (next < 0 || next >= slides.length) return;
  index = next;
  render();
}

document.getElementById('next').addEventListener('click', () => go(1));
document.getElementById('prev').addEventListener('click', () => go(-1));

document.addEventListener('keydown', (e) => {
  // Never steal a key while the video player has focus:
  // its native controls need the arrows and the space bar.
  const tag = document.activeElement?.tagName;
  if (tag === 'VIDEO' || tag === 'BUTTON') return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  if (e.key === 'Home') { e.preventDefault(); index = 0; render(); }
  if (e.key === 'End') { e.preventDefault(); index = slides.length - 1; render(); }
});

// Touch swipe on mobile.
let startX = null;
document.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const delta = e.changedTouches[0].clientX - startX;
  if (Math.abs(delta) > 60) go(delta < 0 ? 1 : -1);
  startX = null;
});

// --- Pause control ------------------------------------------
// Motion that lasts more than 5s needs a way to stop it.
// WCAG 2.2.2. animation-play-state freezes everything in place
// instead of resetting it, so nothing jumps when I resume.
const dropToggle = document.getElementById('drop-toggle');
const closingSlide = document.querySelector('[data-drop]');

dropToggle.addEventListener('click', () => {
  const paused = closingSlide.classList.toggle('is-paused');

  dropToggle.setAttribute('aria-pressed', String(paused));
  dropToggle.textContent = paused
    ? "Relancer l'animation"
    : "Mettre l'animation en pause";
});

render();