/* nav-footer.js — injects shared nav + footer + WA button */

const NAV_HTML = `
<nav class="nav" role="navigation" aria-label="Navegación principal">
  <a href="index.html"><img class="nav-logo" src="assets/logos/Logo_Blanco_Amarillo.png" alt="Psi a Todo"></a>
  <ul class="nav-links">
    <li><a href="index.html">Inicio</a></li>
    <li><a href="psi-a-todo.html">Psi a Todo</a></li>
    <li><a href="quienes-somos.html">Quiénes somos</a></li>
    <li><a href="profesionales.html">Profesionales</a></li>
    <li><a href="faq.html">Preguntas frecuentes</a></li>
    <li><a href="novedades.html">Novedades</a></li>
    <li><a href="contacto.html">Contacto</a></li>
    <li><a href="consulta.html" class="nav-cta">Quiero empezar</a></li>
  </ul>
  <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false" onclick="toggleMenu()">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="mob-menu" id="mobMenu" role="dialog" aria-label="Menú de navegación">
  <a href="index.html" onclick="closeMenu()">Inicio</a>
  <a href="psi-a-todo.html" onclick="closeMenu()">Psi a Todo</a>
  <a href="quienes-somos.html" onclick="closeMenu()">Quiénes somos</a>
  <a href="profesionales.html" onclick="closeMenu()">Profesionales</a>
  <a href="faq.html" onclick="closeMenu()">Preguntas frecuentes</a>
  <a href="novedades.html" onclick="closeMenu()">Novedades</a>
  <a href="contacto.html" onclick="closeMenu()">Contacto</a>
  <a href="consulta.html" class="mob-cta" onclick="closeMenu()">Quiero empezar →</a>
</div>`;

const FOOTER_HTML = `
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <img class="footer-logo-img" src="assets/logos/Logo_Blanco_Amarillo.png" alt="Psi a Todo">
        <p class="footer-tagline">
          Acompañamos el inicio de tu proceso terapéutico.<br>
          Derivaciones pensadas con criterio clínico.<br>
          Atención presencial en CABA (Argentina) y virtual para todo el mundo.
        </p>
        <div class="footer-social">
          <a href="https://www.instagram.com/psi.a.todo" target="_blank" rel="noopener" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
          <a href="https://wa.me/5491140463306" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="ti ti-brand-whatsapp"></i></a>
          <a href="https://www.linkedin.com/company/psi-a-todo" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="ti ti-brand-linkedin"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Secciones</h4>
        <a href="index.html">Inicio</a>
        <a href="psi-a-todo.html">Psi a Todo</a>
        <a href="quienes-somos.html">Quiénes somos</a>
        <a href="profesionales.html">Profesionales</a>
        <a href="faq.html">Preguntas frecuentes</a>
        <a href="novedades.html">Novedades</a>
        <a href="contacto.html">Contacto</a>
      </div>
      <div class="footer-col">
        <h4>Contacto</h4>
        <a href="mailto:info@psiatodo.com">info@psiatodo.com</a>
        <a href="https://wa.me/5491140463306" target="_blank" rel="noopener">WhatsApp</a>
        <a href="consulta.html" style="margin-top:.75rem; color:rgba(237,189,53,.7)">→ Quiero empezar terapia</a>
        <a href="profesionales.html" style="color:rgba(127,158,215,.7)">→ Soy profesional</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Psi a Todo. Todos los derechos reservados.</span>
      <a href="#">Política de privacidad</a>
    </div>
  </div>
</footer>
<a class="wa" href="https://wa.me/5491140463306" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
</a>`;

const WA_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

document.addEventListener('DOMContentLoaded', () => {
  const navEl = document.getElementById('nav-placeholder');
  if (navEl) navEl.outerHTML = NAV_HTML;
  const footerEl = document.getElementById('footer-placeholder');
  if (footerEl) footerEl.outerHTML = FOOTER_HTML;
});
