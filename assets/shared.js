/* ── Theme Toggle (Light / Dark mode) ── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('psiatodo-theme', theme);

  const icon = document.getElementById('themeIcon');
  const iconMob = document.getElementById('themeIconMob');
  const label = document.getElementById('themeLabel');
  const logo = document.querySelector('.nav-logo');

  if (logo) logo.src = 'assets/logos/Logo_Blanco_Amarillo.png';

  if (theme === 'dark') {
    if (icon) icon.className = 'ti ti-sun';
    if (iconMob) iconMob.className = 'ti ti-sun';
    if (label) label.textContent = 'Claro';
  } else {
    if (icon) icon.className = 'ti ti-moon';
    if (iconMob) iconMob.className = 'ti ti-moon';
    if (label) label.textContent = 'Oscuro';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function initTheme() {
  const saved = localStorage.getItem('psiatodo-theme') || 'light';
  applyTheme(saved);
}
initTheme();

/* ── Scroll progress bar & Nav scroll effect ── */
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  
  const progBar = document.getElementById('scrollProgress');
  if (progBar) {
    progBar.style.width = scrolled + '%';
  }

  const nav = document.querySelector('.nav');
  if (nav) {
    nav.classList.toggle('scrolled', winScroll > 20);
  }
}, { passive: true });

/* ── Scroll reveal observer ── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    revealObs.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', observeReveals);

// Observe dynamically added content
const mutationObs = new MutationObserver(() => {
  observeReveals();
});
mutationObs.observe(document.body, { childList: true, subtree: true });

/* ── Nav: active link ── */
function updateActiveNav() {
  let path = location.pathname.split('/').pop() || 'index.html';
  if (path === 'novedad.html') path = 'novedades.html';
  document.querySelectorAll('.nav-links a, .mob-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', updateActiveNav);

/* ── Nav: burger toggle ── */
function toggleMenu() {
  const m = document.getElementById('mobMenu');
  const b = document.getElementById('burger');
  if (!m || !b) return;
  const open = m.classList.toggle('open');
  b.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMenu() {
  const m = document.getElementById('mobMenu');
  const b = document.getElementById('burger');
  if (!m || !b) return;
  m.classList.remove('open');
  b.classList.remove('open');
  b.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  const m = document.getElementById('mobMenu');
  const b = document.getElementById('burger');
  if (m && b && m.classList.contains('open') && !m.contains(e.target) && !b.contains(e.target)) closeMenu();
});

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const ans = btn.nextElementSibling;
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); });
  if (!isOpen) { ans.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

/* ── Multi-step form ── */
function goStep(n) {
  document.querySelectorAll('.form-step').forEach(s => {
    s.classList.remove('active');
  });
  const s = document.getElementById('step' + n);
  if (s) {
    s.classList.add('active');
  }
  for (let i = 1; i <= 4; i++) {
    const d = document.getElementById('pd' + i);
    if (d) d.classList.toggle('done', i <= n);
  }
  const formEl = document.getElementById('formulario') || document.querySelector('.form-section');
  if (formEl) setTimeout(() => formEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

/* ── Testimonial slider with touch swipe ── */
function initSlider(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const slider = wrap.querySelector('.tslider');
  const dots   = wrap.querySelectorAll('.tdot');
  const cards  = wrap.querySelectorAll('.tcard');
  if (!slider || cards.length === 0) return;
  
  let cur = 0;
  let timer;

  function go(n) {
    cur = (n + cards.length) % cards.length;
    slider.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
  wrap.querySelector('.tprev')?.addEventListener('click', () => { go(cur - 1); restart(); });
  wrap.querySelector('.tnext')?.addEventListener('click', () => { go(cur + 1); restart(); });

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(cur + 1), 6000);
  }

  // Touch Swipe Support
  let startX = 0;
  let dist = 0;
  slider.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    dist = 0;
  }, { passive: true });
  
  slider.addEventListener('touchmove', e => {
    dist = e.touches[0].clientX - startX;
  }, { passive: true });
  
  slider.addEventListener('touchend', () => {
    if (Math.abs(dist) > 40) {
      if (dist < 0) go(cur + 1);
      else go(cur - 1);
      restart();
    }
  });

  go(0);
  restart();
}

/* ── Counter animation ── */
function animCount(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(update);
  })(performance.now());
}
document.addEventListener('DOMContentLoaded', () => {
  const statRow = document.querySelector('.stat-row');
  if (statRow) {
    let ran = false;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran) {
        ran = true;
        animCount('c1', 92, 1200);
        animCount('c2', 24, 900);
        animCount('c3', 80, 1400);
      }
    }, { threshold: .5 }).observe(statRow);
  }
});

/* ── News filter ── */
function initNewsFilter() {
  const filters = document.querySelectorAll('.news-filter');
  const cards   = document.querySelectorAll('.news-card[data-cat]');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}
document.addEventListener('DOMContentLoaded', initNewsFilter);

/* ── Mouse Parallax effect on decorative shapes ── */
if (window.innerWidth > 768) {
  document.addEventListener('mousemove', e => {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll('.deco, .hero-shapes img').forEach(img => {
      img.style.transform = `translate3d(${mouseX * 0.4}px, ${mouseY * 0.4}px, 0)`;
    });
  });
}
