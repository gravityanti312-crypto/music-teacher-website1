// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => links.classList.toggle('open'));
links?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => links.classList.remove('open'))
);

// Reveal on scroll
const revealEls = document.querySelectorAll(
  '.section-head, .card, .why-item, .quote, .about-copy, .about-img, .contact-copy, .contact-form, .faq-list details'
);
revealEls.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// First-lesson-free promo popup
(function () {
  const overlay = document.getElementById('promoOverlay');
  if (!overlay) return;
  const closeBtn = document.getElementById('promoClose');
  const dismissBtn = document.getElementById('promoDismiss');

  function openPromo() {
    overlay.hidden = false;
    // allow the element to render before transitioning in
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function closePromo() {
    overlay.classList.remove('show');
    setTimeout(() => { overlay.hidden = true; }, 320);
  }

  closeBtn?.addEventListener('click', closePromo);
  dismissBtn?.addEventListener('click', closePromo);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePromo(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePromo(); });

  // Show once per visit: only if it hasn't already been shown this browser session.
  if (!sessionStorage.getItem('promoShown')) {
    sessionStorage.setItem('promoShown', '1');
    setTimeout(openPromo, 1200);
  }
})();

// Testimonials slider (shows multiple, advances one card at a time)
(function () {
  const track = document.getElementById('testiTrack');
  if (!track) return;
  const cards = [...track.children];
  const viewport = track.parentElement;
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  let i = 0;

  // How wide one card step is (card + gap), and how many fit / max index
  function metrics() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.round(viewport.clientWidth / step));
    const maxIndex = Math.max(0, cards.length - visible);
    return { step, maxIndex };
  }

  function buildDots(maxIndex) {
    dotsWrap.innerHTML = '';
    for (let k = 0; k <= maxIndex; k++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to review ' + (k + 1));
      if (k === i) b.classList.add('active');
      b.addEventListener('click', () => { go(k); restart(); });
      dotsWrap.appendChild(b);
    }
  }

  function go(n) {
    const { step, maxIndex } = metrics();
    if (n > maxIndex) n = 0;          // wrap to start
    if (n < 0) n = maxIndex;          // wrap to end
    i = n;
    track.style.transform = `translateX(-${i * step}px)`;
    [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function refresh() {
    const { maxIndex } = metrics();
    if (i > maxIndex) i = maxIndex;
    buildDots(maxIndex);
    go(i);
  }

  prevBtn.addEventListener('click', () => { go(i - 1); restart(); });
  nextBtn.addEventListener('click', () => { go(i + 1); restart(); });

  // Auto-advance, pause on hover
  let timer = setInterval(() => go(i + 1), 6000);
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
  const slider = track.closest('.testi-slider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);

  // Swipe on touch devices
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  }, { passive: true });

  // Recompute on resize (visible count changes between breakpoints)
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(refresh, 150); });

  refresh();
})();

// Form handler
function handleSubmit(form) {
  const data = new FormData(form);
  const name = data.get('name');
  const contact = data.get('contact');
  const instrument = data.get('instrument');
  const msg = data.get('message');

  // Open default mail client with prefilled email
  const subject = encodeURIComponent(`New lesson inquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nContact: ${contact}\nInstrument: ${instrument}\n\nMessage:\n${msg}`
  );
  window.location.href = `mailto:ryguyvaughn09@gmail.com?subject=${subject}&body=${body}`;

  form.reset();
  alert(`Thanks ${name}! Your message is ready to send — Julie will be in touch within 24 hours.`);
}
