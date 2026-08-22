// ---------- lightbox for case-study images ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

if (lightbox) {
  document.querySelectorAll('.case-gallery img, .case-sequence img, .case-cover img, .vs-frame img').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => lightbox.classList.remove('open');
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// ---------- reveal on scroll ----------
document.querySelectorAll('.case-section, .case-cover, .vs-compare').forEach((el) => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- starfield background (same as home) ----------
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      s: Math.random() * 0.3 + 0.05,
      a: Math.random() * 1,
      da: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
      hue: [270, 190, 320][Math.floor(Math.random() * 3)],
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      star.y += star.s;
      if (star.y > canvas.height) star.y = 0;
      star.a += star.da;
      if (star.a <= 0.1 || star.a >= 1) star.da *= -1;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${star.hue}, 90%, 70%, ${star.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize();
  tick();
}
