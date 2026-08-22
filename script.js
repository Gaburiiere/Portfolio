// ---------- sound engine (Web Audio, no assets needed) ----------
let audioCtx = null;
let soundOn = localStorage.getItem('soundOn') === 'true';

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function beep(freq = 440, dur = 0.06, type = 'square', vol = 0.05) {
  if (!soundOn) return;
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

const sfxHover = () => beep(660, 0.04, 'square', 0.03);
const sfxClick = () => beep(880, 0.08, 'square', 0.05);
const sfxUnlock = () => { beep(523, 0.09, 'triangle', 0.05); setTimeout(() => beep(784, 0.12, 'triangle', 0.05), 90); };

const soundToggle = document.getElementById('sound-toggle');
function syncSoundUI() {
  soundToggle.classList.toggle('on', soundOn);
  soundToggle.innerHTML = soundOn ? '<i class="bi bi-volume-up-fill"></i>' : '<i class="bi bi-volume-mute-fill"></i>';
}
syncSoundUI();
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('soundOn', soundOn);
  syncSoundUI();
  if (soundOn) { initAudio(); sfxClick(); }
});

document.querySelectorAll('a, button').forEach((el) => {
  el.addEventListener('mouseenter', sfxHover);
  el.addEventListener('click', sfxClick);
});

// ---------- boot screen ----------
const boot = document.getElementById('boot');
const bootFill = document.getElementById('boot-fill');
let bootDone = false;

function finishBoot() {
  if (bootDone) return;
  bootDone = true;
  boot.classList.add('hidden');
  document.body.style.overflow = '';
  sessionStorage.setItem('booted', '1');
}

if (sessionStorage.getItem('booted') === '1') {
  boot.classList.add('hidden');
} else {
  document.body.style.overflow = 'hidden';
  let pct = 0;
  const timer = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(timer);
      setTimeout(finishBoot, 300);
    }
    bootFill.style.width = pct + '%';
  }, 120);
  boot.addEventListener('click', finishBoot);
  window.addEventListener('keydown', finishBoot, { once: true });
}

// ---------- mobile menu ----------
const btnBurger = document.getElementById('btn-burger');
const navMobile = document.getElementById('nav-mobile');
btnBurger.addEventListener('click', () => navMobile.classList.toggle('open'));
document.querySelectorAll('.nav-mobile .nav-link').forEach((link) => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ---------- scroll-spy + XP bar ----------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const xpFill = document.getElementById('xp-fill');

const setActive = (id) => {
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === id));
};

const spyObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }),
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);
sections.forEach((section) => spyObserver.observe(section));

function updateXP() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  xpFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateXP, { passive: true });
updateXP();

// ---------- reveal on scroll ----------
document.querySelectorAll(
  '.sobre-grid, .marquee, .skills-cloud, .loot-grid, .achv, .terminal, .title, .section-sub'
).forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in');
          if (entry.target.classList.contains('achv')) sfxUnlock();
        }, i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- game menu keyboard nav ----------
const gameMenu = document.getElementById('game-menu');
const menuLinks = [...gameMenu.querySelectorAll('a')];
let menuIdx = 0;
menuLinks[0].classList.add('kb-active');

window.addEventListener('keydown', (e) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowDown') { menuLinks[menuIdx].classList.remove('kb-active'); menuIdx = (menuIdx + 1) % menuLinks.length; menuLinks[menuIdx].classList.add('kb-active'); sfxHover(); }
  if (e.key === 'ArrowUp') { menuLinks[menuIdx].classList.remove('kb-active'); menuIdx = (menuIdx - 1 + menuLinks.length) % menuLinks.length; menuLinks[menuIdx].classList.add('kb-active'); sfxHover(); }
  if (e.key === 'Enter') { menuLinks[menuIdx].click(); }
});

// ---------- character card flip ----------
document.getElementById('char-card').addEventListener('click', function () {
  this.classList.toggle('flipped');
});

// ---------- loot card flip (click to flip) ----------
document.querySelectorAll('.loot-card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    card.classList.toggle('flipped');
  });
});

// ---------- marquees: duplicate content for a seamless loop ----------
['marquee-track', 'graphic-marquee-track'].forEach((id) => {
  const track = document.getElementById(id);
  if (track) track.innerHTML += track.innerHTML;
});

// ---------- graphic marquee: gamepad-style controls (play/pause/prev/next) ----------
(function () {
  const wrap = document.getElementById('graphic-marquee');
  const track = document.getElementById('graphic-marquee-track');
  const playBtn = document.getElementById('graphic-play');
  const prevBtn = document.getElementById('graphic-prev');
  const nextBtn = document.getElementById('graphic-next');
  if (!wrap || !track || !playBtn) return;

  track.style.animation = 'none';

  let pos = 0;
  let playing = true;
  let hovering = false;
  const CYCLE_SECONDS = 32;

  const loopWidth = () => track.scrollWidth / 2;
  const cardStep = () => {
    const card = track.querySelector('.graphic-card');
    const gap = parseFloat(getComputedStyle(track).gap) || 18;
    return card.offsetWidth + gap;
  };
  const speed = () => loopWidth() / (CYCLE_SECONDS * 60);

  function apply() {
    const lw = loopWidth();
    if (pos <= -lw) pos += lw;
    if (pos > 0) pos -= lw;
    track.style.transform = `translateX(${pos}px)`;
  }

  function tick() {
    if (playing && !hovering) {
      pos -= speed();
      apply();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function setPlaying(next) {
    playing = next;
    playBtn.innerHTML = playing ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>';
    playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir');
  }

  playBtn.addEventListener('click', () => setPlaying(!playing));
  prevBtn.addEventListener('click', () => { pos += cardStep(); apply(); });
  nextBtn.addEventListener('click', () => { pos -= cardStep(); apply(); });

  wrap.addEventListener('mouseenter', () => { hovering = true; });
  wrap.addEventListener('mouseleave', () => { hovering = false; });
})();

// ---------- lightbox for the design gráfico gallery (multi-image per project) ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

if (lightbox) {
  let gallery = [];
  let galleryIdx = 0;
  let galleryTitle = '';

  function renderLightbox() {
    const current = gallery[galleryIdx];
    const isVideo = current.startsWith('embed:');

    if (isVideo) {
      lightboxImg.style.display = 'none';
      lightboxImg.src = '';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = current.slice('embed:'.length);
    } else {
      lightboxVideo.style.display = 'none';
      lightboxVideo.src = '';
      lightboxImg.style.display = 'block';
      lightboxImg.src = current;
    }

    lightboxTitle.textContent = galleryTitle;
    lightboxCounter.textContent = gallery.length > 1 ? `${galleryIdx + 1} / ${gallery.length}` : '';
    const multi = gallery.length > 1;
    lightboxPrev.classList.toggle('hidden', !multi);
    lightboxNext.classList.toggle('hidden', !multi);
  }

  document.querySelectorAll('.graphic-card').forEach((card) => {
    card.addEventListener('click', () => {
      gallery = (card.dataset.gallery || card.querySelector('img').src).split(',');
      galleryTitle = card.dataset.title || card.querySelector('img').alt;
      galleryIdx = 0;
      renderLightbox();
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => { lightbox.classList.remove('open'); lightboxVideo.src = ''; };
  const showPrev = () => { galleryIdx = (galleryIdx - 1 + gallery.length) % gallery.length; renderLightbox(); };
  const showNext = () => { galleryIdx = (galleryIdx + 1) % gallery.length; renderLightbox(); };

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

// ---------- starfield background ----------
const canvas = document.getElementById('bg-canvas');
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

// ---------- contact form -> envia direto pro e-mail via Formspree ----------
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('contact-submit');
const status = document.getElementById('term-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'term-status';
  status.textContent = '';
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> enviando_sinal...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      form.reset();
      status.textContent = '> sinal_enviado com sucesso. Obrigada pelo contato!';
      status.className = 'term-status term-status-ok';
      sfxUnlock();
    } else {
      throw new Error('request failed');
    }
  } catch (err) {
    status.textContent = '> falha_na_transmissão. Tenta de novo ou manda um e-mail direto pra gabriellenprosa@gmail.com';
    status.className = 'term-status term-status-error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send-fill"></i> enviar_sinal()';
  }
});
