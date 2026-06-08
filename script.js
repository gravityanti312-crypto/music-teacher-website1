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
