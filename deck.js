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

render();
