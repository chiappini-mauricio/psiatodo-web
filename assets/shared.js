/* ── shared.js — runs on every page ── */

/* Scroll reveal */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => revealObs.observe(el));

/* Nav: active link */
(function() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
})();

/* Nav: burger toggle */
function toggleMenu() {
  const m = document.getElementById('mobMenu');
  const b = document.getElementById('burger');
  const open = m.classList.toggle('open');
  b.classList.toggle('open', open);
  b.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMenu() {
  const m = document.getElementById('mobMenu');
  const b = document.getElementById('burger');
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

/* FAQ accordion */
function toggleFaq(btn) {
  const ans = btn.nextElementSibling;
  const isOpen = ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); });
  if (!isOpen) { ans.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

/* Multi-step form */
function goStep(n) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  const s = document.getElementById('step' + n);
  if (s) s.classList.add('active');
  for (let i = 1; i <= 4; i++) {
    const d = document.getElementById('pd' + i);
    if (d) d.classList.toggle('done', i <= n);
  }
  const formEl = document.getElementById('formulario') || document.querySelector('.form-section');
  if (formEl) setTimeout(() => formEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}
function submitForm() {
  // TODO: replace URL with your Google Apps Script web app URL
  // const data = collectFormData();
  // fetch('YOUR_APPS_SCRIPT_URL', { method:'POST', body: JSON.stringify(data) });
  document.querySelectorAll('.form-step').forEach(s => s.style.display = 'none');
  const prog = document.querySelector('.prog');
  if (prog) prog.style.display = 'none';
  const t = document.getElementById('thanks');
  if (t) t.classList.add('show');
}

/* Testimonial slider */
function initSlider(containerId) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const slider = wrap.querySelector('.tslider');
  const dots   = wrap.querySelectorAll('.tdot');
  const cards  = wrap.querySelectorAll('.tcard');
  let cur = 0;
  let timer;

  function go(n) {
    cur = (n + cards.length) % cards.length;
    slider.style.transform = `translateX(calc(-${cur * 100}% - ${cur}px))`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
  wrap.querySelector('.tprev')?.addEventListener('click', () => { go(cur - 1); restart(); });
  wrap.querySelector('.tnext')?.addEventListener('click', () => { go(cur + 1); restart(); });

  function restart() { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000); }
  go(0);
  restart();
}

/* Counter animation */
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
function initCounters() {
  animCount('c1', 92, 1200);
  animCount('c2', 24, 900);
  animCount('c3', 80, 1400);
}
const statRow = document.querySelector('.stat-row');
if (statRow) {
  let ran = false;
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !ran) { ran = true; initCounters(); } }, { threshold: .5 }).observe(statRow);
}

/* News filter */
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
initNewsFilter();
