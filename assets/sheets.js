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

  // ── Grilla de talleres (novedades.html) ──
  renderTalleres();

  // ── Nota individual (novedad.html) ──
  renderNota();

  // ── Actualizar opciones de honorarios si el formulario está presente ──
  if (typeof window.actualizarHonorariosConfig === 'function') {
    try { window.actualizarHonorariosConfig(); } catch (e) { console.error(e); }
  }
}


/* ═══════════════════════════════════════════
   RENDERIZAR TALLERES Y NOVEDADES
   ═══════════════════════════════════════════ */

function renderTalleres() {
  const lista = document.getElementById('news-list');
  if (!lista) return;

  const rawTalleres = SITE.data.talleres || [];

  if (!rawTalleres.length) {
    lista.innerHTML = `
      <div style="text-align:center;padding:3rem 1.5rem">
        <p style="color:rgba(33,33,33,.55)">Próximamente publicaremos nuevas propuestas.</p>
      </div>`;
    return;
  }

  // Normalizar talleres y asignar categorías canónicas
  const talleres = rawTalleres.map(t => {
    let titulo = (t.titulo || '').trim();
    // Corregir falta de tilde en Clínica de la Psicosis Ordinaria
    titulo = titulo.replace(/\bClinica\b/g, 'Clínica');

    let cat = (t.categoria || '').trim();
    let mod = (t.modalidad || '').trim();
    let filterSlugs = [];

    const lowerTit = titulo.toLowerCase();
    const lowerCat = cat.toLowerCase();
    const lowerMod = mod.toLowerCase();

    // Detección de artículo
    const isArticulo = lowerCat.includes('artículo') || lowerCat.includes('articulo') ||
                       lowerMod.includes('artículo') || lowerMod.includes('articulo') ||
                       lowerCat.includes('psicoanálisis') || lowerCat.includes('psicoanalisis') ||
                       lowerCat.includes('acompañamiento') || lowerCat.includes('acompanamiento') ||
                       lowerTit.includes('decisión de empezar') || lowerTit.includes('decision de empezar') ||
                       lowerTit.includes('padecimiento subjetivo') || lowerTit.includes('no hay recetas');

    // Detección de taller
    const isTaller = lowerCat.includes('taller') || lowerTit.includes('taller') ||
                     lowerTit.includes('psicosis ordinaria') || lowerTit.includes('pensar la práctica');

    // Detección de formación profesional
    const isFormacion = lowerCat.includes('formaci') || lowerCat.includes('profesional') ||
                        lowerTit.includes('psicosis ordinaria') || lowerTit.includes('pensar la práctica') ||
                        lowerTit.includes('interpretación en freud') || lowerTit.includes('interpretacion en freud');

    if (isArticulo) {
      filterSlugs.push('articulos');
      if (!cat || cat === 'Psicoanálisis' || cat === 'Clínica' || cat === 'Acompañamiento') {
        cat = 'Artículo';
      }
    }
    if (isTaller) {
      filterSlugs.push('talleres');
      if (!cat) cat = 'Taller';
    }
    if (isFormacion) {
      filterSlugs.push('formacion-profesional');
      if (!cat || cat === 'Taller') {
        // mantener categoría o etiquetarlo claramente
      }
    }

    if (filterSlugs.length === 0) {
      filterSlugs.push('talleres');
      if (!cat) cat = 'Taller';
    }

    return {
      ...t,
      titulo,
      categoria: cat,
      filterSlugs
    };
  });

  lista.innerHTML = talleres.map((t, i) => {
    const meta = [t.fecha, t.modalidad].filter(Boolean).join(' · ');
    const tieneNota = !!(t.contenido && t.contenido.trim());

    // Destino: link externo si lo hay, sino la nota interna, sino nada
    let href = '#';
    let target = '';
    let label = 'Ver más';
    if (t.link && t.link.trim() && t.link.trim() !== '#') {
      href = t.link.trim();
      target = ' target="_blank" rel="noopener"';
      label = 'Ver más';
    } else if (tieneNota) {
      href = 'novedad.html?post=' + encodeURIComponent(t.slug || slugify(t.titulo));
      label = (/art[ií]culo/i.test(t.modalidad || '') || t.filterSlugs.includes('articulos')) ? 'Leer artículo' : 'Ver más';
    }

    // Miniatura: imagen real o placeholder con forma de marca
    const forma = ['25','22','21','2','9'][i % 5];
    const thumb = t.imagen && t.imagen.trim()
      ? `<img class="news-thumb" src="${escapeAttr(t.imagen)}" alt="" loading="lazy"
             onerror="this.outerHTML='<div class=\\'news-thumb-ph\\'><img src=\\'assets/formas/${forma}.png\\' alt=\\'\\'></div>'">`
      : `<div class="news-thumb-ph"><img src="assets/formas/${forma}.png" alt=""></div>`;

    return `
      <a class="news-item reveal ${i % 2 ? 'd2' : 'd1'}" data-cats="${t.filterSlugs.join(' ')}" href="${escapeAttr(href)}"${target}>
        <div>${thumb}</div>
        <div class="news-body">
          <span class="news-tag">${escapeHtml(t.categoria)}</span>
          <h3>${escapeHtml(t.titulo)}</h3>
          ${t.descripcion ? `<p>${escapeHtml(t.descripcion)}</p>` : ''}
          ${meta ? `<span class="news-meta">${escapeHtml(meta)}</span>` : ''}
          ${href !== '#' ? `<span class="news-more">${label} <i class="ti ti-arrow-right"></i></span>` : ''}
        </div>
      </a>`;
  }).join('');

  renderFiltros();

  if (typeof revealObs !== 'undefined') {
    lista.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  } else {
    lista.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}


function renderFiltros() {
  const cont = document.getElementById('news-filters');
  if (!cont) return;

  const tabs = [
    { label: 'Todos', slug: 'all' },
    { label: 'Talleres', slug: 'talleres' },
    { label: 'Formación Profesional', slug: 'formacion-profesional' },
    { label: 'Artículos', slug: 'articulos' }
  ];

  cont.innerHTML = tabs.map((tab, idx) => 
    `<button class="news-filter ${idx === 0 ? 'active' : ''}" data-filter="${tab.slug}">${tab.label}</button>`
  ).join('');

  const filtros = cont.querySelectorAll('.news-filter');
  const items   = document.querySelectorAll('.news-item');

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(el => {
        const itemSlugs = (el.dataset.cats || '').split(' ');
        el.style.display = (cat === 'all' || itemSlugs.includes(cat)) ? '' : 'none';
      });
    });
  });
}


/* ═══════════════════════════════════════════
   PÁGINA DE NOTA INDIVIDUAL
   ═══════════════════════════════════════════ */

function renderNota() {
  const cont = document.getElementById('post-root');
  if (!cont) return;

  const params = new URLSearchParams(location.search);
  const buscado = params.get('post');

  const talleres = SITE.data.talleres || [];
  const nota = talleres.find(t => (t.slug || slugify(t.titulo)) === buscado);

  if (!nota) {
    cont.innerHTML = `
      <section class="post-hero">
        <div class="post-hero-inner">
          <a class="post-back" href="novedades.html"><i class="ti ti-arrow-left"></i> Volver a novedades</a>
          <h1 class="post-title">No encontramos esta nota</h1>
          <p class="post-meta">Puede que haya sido despublicada o que el enlace esté mal.</p>
        </div>
      </section>
      <div class="post-body">
        <div class="post-content">
          <a class="btn btn-red" href="novedades.html">Ver todas las novedades <i class="ti ti-arrow-right"></i></a>
        </div>
      </div>`;
    return;
  }

  const tituloNota = (nota.titulo || '').replace(/\bClinica\b/g, 'Clínica');
  document.title = tituloNota + ' | Psi a Todo';

  const meta = [nota.fecha, nota.modalidad].filter(Boolean).join(' · ');

  cont.innerHTML = `
    <section class="post-hero">
      <div class="post-hero-inner">
        <a class="post-back" href="novedades.html"><i class="ti ti-arrow-left"></i> Volver a novedades</a>
        <span class="post-tag">${escapeHtml(nota.categoria || 'Novedades')}</span>
        <h1 class="post-title">${escapeHtml(tituloNota)}</h1>
        ${meta ? `<p class="post-meta">${escapeHtml(meta)}</p>` : ''}
      </div>
    </section>

    ${nota.imagen && nota.imagen.trim()
      ? `<img class="post-cover" src="${escapeAttr(nota.imagen)}" alt="" onerror="this.remove()">`
      : ''}

    <div class="post-body">
      <article class="post-content">
        ${formatearTexto(nota.contenido || nota.descripcion || '')}

        <div class="post-cta">
          <p style="font-size:14px;color:rgba(33,33,33,.7);margin-bottom:1rem">
            ¿Buscás iniciar un proceso terapéutico?
          </p>
          <a class="btn btn-red" href="consulta.html">Quiero empezar <i class="ti ti-arrow-right"></i></a>
        </div>
      </article>
    </div>`;
}


/**
 * Convierte el texto de la planilla en HTML.
 * Soporta: ## títulos, **negrita**, *cursiva*, [link](url),
 *          > citas, - listas, y párrafos separados por línea en blanco.
 */
function formatearTexto(texto) {
  if (!texto) return '<p>Contenido próximamente.</p>';

  const bloques = String(texto).split(/\n\s*\n/);

  return bloques.map(bloque => {
    let b = bloque.trim();
    if (!b) return '';

    // Títulos
    if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
    if (b.startsWith('## '))  return `<h2>${inline(b.slice(3))}</h2>`;
    if (b.startsWith('# '))   return `<h2>${inline(b.slice(2))}</h2>`;

    // Cita
    if (b.startsWith('> ')) {
      const cita = b.split('\n').map(l => l.replace(/^>\s?/, '')).join(' ');
      return `<blockquote>${inline(cita)}</blockquote>`;
    }

    // Lista con viñetas
    if (/^[-*]\s/.test(b)) {
      const items = b.split('\n')
        .filter(l => /^[-*]\s/.test(l.trim()))
        .map(l => `<li>${inline(l.trim().replace(/^[-*]\s/, ''))}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    // Lista numerada
    if (/^\d+[.)]\s/.test(b)) {
      const items = b.split('\n')
        .filter(l => /^\d+[.)]\s/.test(l.trim()))
        .map(l => `<li>${inline(l.trim().replace(/^\d+[.)]\s/, ''))}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    }

    // Imagen suelta
    if (/^https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)$/i.test(b)) {
      return `<img src="${escapeAttr(b)}" alt="" loading="lazy">`;
    }

    // Párrafo normal (respeta saltos de línea simples)
    return `<p>${inline(b).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}


/** Formato dentro de un párrafo: negrita, cursiva, links */
function inline(txt) {
  return escapeHtml(txt)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
             '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
}


function slugify(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
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
      body: JSON.stringify({ ...datos, tipo })   // tipo va último: ningún campo puede pisarlo
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
