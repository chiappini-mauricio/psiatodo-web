/**
 * PSI A TODO — Integración con Google Sheets
 * ═══════════════════════════════════════════
 *
 * Se encarga de:
 *   • Traer el contenido editable (precios, talleres) desde la planilla
 *   • Reemplazarlo en la página
 *   • Enviar los formularios a la planilla
 *
 * No hace falta tocar este archivo.
 * La URL de la planilla se configura en config.js
 */

const SITE = {
  data: DEFAULTS,
  cargado: false
};


/* ═══════════════════════════════════════════
   TRAER CONTENIDO DE LA PLANILLA
   ═══════════════════════════════════════════ */

async function cargarContenido() {
  if (!SHEETS_URL) {
    aplicarContenido();
    return;
  }

  try {
    const res = await fetch(SHEETS_URL, { redirect: 'follow' });
    const json = await res.json();

    if (json.ok) {
      // Mezclar lo que viene de la planilla con los defaults
      SITE.data = {
        config:   { ...DEFAULTS.config, ...(json.config || {}) },
        talleres: (json.talleres && json.talleres.length)
                    ? json.talleres
                    : DEFAULTS.talleres
      };
      SITE.cargado = true;
    }
  } catch (err) {
    console.warn('No se pudo leer la planilla, usando valores por defecto.', err);
  }

  aplicarContenido();
}


/* ═══════════════════════════════════════════
   APLICAR EL CONTENIDO A LA PÁGINA
   ═══════════════════════════════════════════ */

function aplicarContenido() {
  const cfg = SITE.data.config;

  // ── Textos marcados con data-sheet ──
  // Ejemplo en el HTML:  <span data-sheet="precio_minimo">$20.000</span>
  document.querySelectorAll('[data-sheet]').forEach(el => {
    const clave = el.dataset.sheet;
    if (cfg[clave]) el.textContent = cfg[clave];
  });

  // ── Placeholders de inputs ──
  // Ejemplo:  <input data-sheet-placeholder="precio_texto">
  document.querySelectorAll('[data-sheet-placeholder]').forEach(el => {
    const clave = el.dataset.sheetPlaceholder;
    if (cfg[clave]) el.placeholder = cfg[clave];
  });

  // ── Links de WhatsApp ──
  if (cfg.whatsapp) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.href = 'https://wa.me/' + cfg.whatsapp;
    });
  }

  // ── Links de email ──
  if (cfg.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = 'mailto:' + cfg.email;
      if (a.textContent.includes('@')) a.textContent = cfg.email;
    });
  }

  // ── Grilla de talleres (solo en novedades.html) ──
  renderTalleres();
}


/* ═══════════════════════════════════════════
   RENDERIZAR TALLERES Y NOVEDADES
   ═══════════════════════════════════════════ */

function renderTalleres() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const talleres = SITE.data.talleres || [];

  if (!talleres.length) {
    grid.innerHTML = `
      <div class="news-card" style="grid-column:1/-1;text-align:center;padding:3rem 1.5rem">
        <p style="color:rgba(33,33,33,.6)">Próximamente publicaremos nuevas propuestas.</p>
      </div>`;
    return;
  }

  grid.innerHTML = talleres.map((t, i) => {
    const cat  = (t.categoria || 'Novedades');
    const slug = cat.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '-');
    const meta = [t.fecha, t.modalidad].filter(Boolean).join(' · ');
    const esArticulo = /art[ií]culo/i.test(t.modalidad || '');

    return `
      <div class="news-card reveal ${i % 2 ? 'd2' : 'd1'}" data-cat="${slug}">
        <p class="news-tag">${escapeHtml(cat)}</p>
        <h3>${escapeHtml(t.titulo)}</h3>
        <p>${escapeHtml(t.descripcion)}</p>
        ${meta ? `<p class="news-card-date">${escapeHtml(meta)}</p>` : ''}
        <a href="${escapeAttr(t.link || '#')}">
          ${esArticulo ? 'Leer artículo' : 'Ver más'} <i class="ti ti-arrow-right"></i>
        </a>
      </div>`;
  }).join('');

  // Reconstruir los filtros según las categorías que existan
  renderFiltros(talleres);

  // Volver a activar el scroll reveal en las cards nuevas
  if (typeof revealObs !== 'undefined') {
    grid.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  } else {
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}


function renderFiltros(talleres) {
  const cont = document.getElementById('news-filters');
  if (!cont) return;

  // Categorías únicas, en el orden en que aparecen
  const cats = [];
  talleres.forEach(t => {
    const c = t.categoria || 'Novedades';
    if (!cats.includes(c)) cats.push(c);
  });

  cont.innerHTML =
    `<button class="news-filter active" data-filter="all">Todos</button>` +
    cats.map(c => {
      const slug = c.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '-');
      return `<button class="news-filter" data-filter="${slug}">${escapeHtml(c)}</button>`;
    }).join('');

  // Reconectar los clicks
  const filtros = cont.querySelectorAll('.news-filter');
  const cards   = document.querySelectorAll('.news-card[data-cat]');

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}


/* ═══════════════════════════════════════════
   ENVIAR FORMULARIOS A LA PLANILLA
   ═══════════════════════════════════════════ */

async function enviarAPlanilla(tipo, datos) {
  if (!SHEETS_URL) {
    console.warn('SHEETS_URL vacía — el formulario no se guardó. Configurá config.js');
    return { ok: false, sinConfigurar: true };
  }

  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',                       // Apps Script no manda CORS headers
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ tipo, ...datos })
    });
    // Con no-cors no se puede leer la respuesta, asumimos éxito
    return { ok: true };
  } catch (err) {
    console.error('Error al enviar:', err);
    return { ok: false, error: err };
  }
}


/**
 * Junta los valores de un contenedor.
 * Cada input/select/textarea con id o name se convierte en una clave.
 */
function juntarDatos(contenedor) {
  const datos = {};
  const campos = (contenedor || document).querySelectorAll('input, select, textarea');

  campos.forEach(campo => {
    const clave = campo.name || campo.id;
    if (!clave) return;

    if (campo.type === 'radio') {
      if (campo.checked) datos[clave] = campo.value;
    } else if (campo.type === 'checkbox') {
      datos[clave] = campo.checked ? 'SI' : 'NO';
    } else {
      datos[clave] = campo.value;
    }
  });

  return datos;
}


/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str == null ? '' : str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ═══════════════════════════════════════════
   ARRANQUE
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', cargarContenido);
