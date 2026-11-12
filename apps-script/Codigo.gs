/**
 * PSI A TODO — Google Apps Script
 * ================================
 *
 * Este script cumple DOS funciones:
 *
 *  1. doGet()  → Devuelve el contenido editable del sitio (precios, talleres)
 *                en formato JSON, para que la web lo lea.
 *                Lee la planilla MAESTRA (pestañas Config y Talleres).
 *
 *  2. doPost() → Recibe los formularios y los guarda en una planilla
 *                SEPARADA (pestañas Consultas, Contacto y Postulaciones).
 *                Esa planilla se crea con crearPlanillaDeRespuestas().
 *
 * ─────────────────────────────────────────────────────────────
 * CÓMO INSTALARLO (una sola vez):
 * ─────────────────────────────────────────────────────────────
 *  1. Abrí la planilla de Google Sheets
 *  2. Menú: Extensiones → Apps Script
 *  3. Borrá todo el código que aparece y pegá ESTE archivo completo
 *  4. Click en "Implementar" (Deploy) → "Nueva implementación"
 *  5. Tipo: "Aplicación web"
 *     - Ejecutar como: "Yo"
 *     - Quién tiene acceso: "Cualquier persona"
 *  6. Click "Implementar" y autorizá los permisos
 *  7. COPIÁ la URL que te da (termina en /exec)
 *  8. Pegá esa URL en assets/config.js del sitio
 * ─────────────────────────────────────────────────────────────
 *
 * URL DE LA IMPLEMENTACIÓN ACTUAL (ya cargada en assets/config.js):
 * https://script.google.com/macros/s/AKfycbyATp-5zmzIuH5uTQxjQJAUi207CS0Fh3rq979txxn_vi2-wZIYKeN-fxVmfdxyHnxd8A/exec
 * ─────────────────────────────────────────────────────────────
 */


// ═══════════════════════════════════════════════════════════
// LECTURA — devuelve el contenido del sitio como JSON
// ═══════════════════════════════════════════════════════════

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var data = {
      config:   leerConfig(ss),
      talleres: leerTalleres(ss),
      ok: true
    };

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Lee la pestaña "Config" — pares clave/valor.
 * Ejemplo de fila:  precio_minimo  |  $25.000
 * Devuelve: { precio_minimo: "$25.000", ... }
 */
function leerConfig(ss) {
  var hoja = ss.getSheetByName('Config');
  if (!hoja) return {};

  var filas = hoja.getDataRange().getDisplayValues();
  var config = {};

  // Empieza en 1 para saltear la fila de encabezados
  for (var i = 1; i < filas.length; i++) {
    var clave = String(filas[i][0]).trim();
    var valor = filas[i][1];
    if (clave) config[clave] = String(valor).trim();
  }

  return config;
}


/**
 * Lee la pestaña "Talleres".
 * Solo devuelve los que tienen Publicado = SI
 * Los ordena por la columna Orden (menor primero)
 */
function leerTalleres(ss) {
  var hoja = ss.getSheetByName('Talleres');
  if (!hoja) return [];

  var filas = hoja.getDataRange().getValues();
  if (filas.length < 2) return [];

  var encabezados = filas[0].map(function(h) {
    return String(h).trim().toLowerCase();
  });

  var talleres = [];

  for (var i = 1; i < filas.length; i++) {
    var fila = filas[i];
    var item = {};

    for (var j = 0; j < encabezados.length; j++) {
      item[encabezados[j]] = String(fila[j] || '').trim();
    }

    // Solo publicar los marcados con SI
    var publicado = (item['publicado'] || '').toUpperCase();
    if (publicado !== 'SI' && publicado !== 'SÍ') continue;

    // Necesita al menos un título
    if (!item['titulo']) continue;

    talleres.push({
      categoria:   item['categoria']   || 'Novedades',
      titulo:      item['titulo'],
      descripcion: item['descripcion'] || '',
      fecha:       item['fecha']       || '',
      modalidad:   item['modalidad']   || '',
      imagen:      item['imagen']      || '',
      contenido:   item['contenido']   || '',
      link:        item['link']        || '',
      slug:        item['slug']        || generarSlug(item['titulo']),
      orden:       parseInt(item['orden'] || '99', 10)
    });
  }

  // Ordenar por columna Orden
  talleres.sort(function(a, b) { return a.orden - b.orden; });

  return talleres;
}


/**
 * Convierte un título en slug para la URL.
 * "La compulsión de optimización" → "la-compulsion-de-optimizacion"
 */
function generarSlug(texto) {
  if (!texto) return '';
  return String(texto)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // saca acentos
    .replace(/[^a-z0-9\s-]/g, '')                       // saca símbolos
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}


// ═══════════════════════════════════════════════════════════
// ESCRITURA — recibe las consultas del formulario
// ═══════════════════════════════════════════════════════════

/**
 * Devuelve la planilla donde se guardan las respuestas de los formularios
 * (Consultas, Contacto, Postulaciones).
 *
 * Es una planilla SEPARADA de la maestra (que solo tiene Config y Talleres).
 * Su ID se guarda en las "Propiedades del script" al correr
 * crearPlanillaDeRespuestas(). Si todavía no se creó, usa la planilla
 * maestra para que nunca se pierda una consulta.
 */
function getRespuestasSS() {
  var id = PropertiesService.getScriptProperties().getProperty('RESPUESTAS_SS_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) { /* cae al fallback */ }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}


function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    var ss = getRespuestasSS();

    // Según el tipo, va a una pestaña u otra
    var tipo = datos.tipo || 'consulta';
    var nombreHoja = {
      'consulta':    'Consultas',
      'contacto':    'Contacto',
      'postulacion': 'Postulaciones'
    }[tipo] || 'Consultas';

    var hoja = ss.getSheetByName(nombreHoja);
    if (!hoja) {
      hoja = ss.insertSheet(nombreHoja);
    }

    // Si la hoja está vacía, crear encabezados con las claves recibidas
    if (hoja.getLastRow() === 0) {
      var claves = ['fecha'].concat(Object.keys(datos).filter(function(k) {
        return k !== 'tipo';
      }));
      hoja.appendRow(claves);
      hoja.getRange(1, 1, 1, claves.length)
          .setFontWeight('bold')
          .setBackground('#212121')
          .setFontColor('#fff7ec');
      hoja.setFrozenRows(1);
    }

    // Armar la fila siguiendo el orden de los encabezados existentes
    var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn())
                          .getValues()[0];
    var fila = encabezados.map(function(col) {
      var clave = String(col).trim();
      if (clave === 'fecha') {
        return new Date();
      }
      return datos[clave] || '';
    });

    hoja.appendRow(fila);

    // Notificación por mail
    enviarNotificacion(datos, nombreHoja);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Envía un mail cuando llega una consulta nueva.
 * Para activarlo: descomentar la llamada en doPost() y poner el mail.
 */
function enviarNotificacion(datos, tipoFormulario) {
  var destinatario = 'info@psiatodo.com';  // ← CAMBIAR

  var cuerpo = 'Llegó una nueva ' + tipoFormulario + ':\n\n';
  for (var clave in datos) {
    if (clave === 'tipo') continue;
    cuerpo += clave + ': ' + datos[clave] + '\n';
  }
  cuerpo += '\n---\nVer todas: ' + getRespuestasSS().getUrl();

  MailApp.sendEmail({
    to: destinatario,
    subject: 'Psi a Todo — Nueva ' + tipoFormulario.toLowerCase(),
    body: cuerpo
  });
}


// ═══════════════════════════════════════════════════════════
// UTILIDAD — crear la estructura inicial de la planilla
// ═══════════════════════════════════════════════════════════

/**
 * Ejecutá esta función UNA VEZ desde el editor de Apps Script
 * (seleccionala del desplegable y apretá ▶ Ejecutar)
 * para que arme las pestañas Config y Talleres de la planilla maestra.
 */
function crearEstructuraInicial() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Pestaña CONFIG ──
  var config = ss.getSheetByName('Config') || ss.insertSheet('Config');
  config.clear();
  config.getRange('A1:C1').setValues([['Clave', 'Valor', 'Dónde aparece']]);
  config.getRange('A2:C7').setValues([
    ['tarifa_minima_ar',     '$30.000',  'Tarifa mínima Argentina'],
    ['tarifa_minima_eu',     '35€',      'Tarifa mínima Europa'],
    ['tarifa_minima_usd',    '25USD',    'Tarifa mínima Resto del mundo'],
    ['whatsapp',             '5491140463306', 'Botón flotante + links'],
    ['email',                'info@psiatodo.com', 'Footer + contacto'],
    ['tiempo_respuesta',     '24 horas hábiles', 'Varios lugares del sitio']
  ]);
  config.getRange('A1:C1')
        .setFontWeight('bold')
        .setBackground('#212121')
        .setFontColor('#fff7ec');
  config.setColumnWidth(1, 160);
  config.setColumnWidth(2, 320);
  config.setColumnWidth(3, 260);
  config.setFrozenRows(1);

  // ── Pestaña TALLERES ──
  var talleres = ss.getSheetByName('Talleres') || ss.insertSheet('Talleres');
  talleres.clear();
  talleres.getRange('A1:K1').setValues([[
    'Orden', 'Publicado', 'Categoria', 'Titulo', 'Descripcion',
    'Fecha', 'Modalidad', 'Imagen', 'Contenido', 'Link', 'Slug'
  ]]);
  talleres.getRange('A2:K3').setValues([
    ['1', 'SI', 'Taller',
     'Pensar la práctica clínica: ¿pensamos o repetimos?',
     'Un espacio para incomodarnos un poco. Para cuestionar lo heredado.',
     'Mayo 2026', 'Presencial + Virtual',
     '',
     'Pensar la práctica clínica implica algo más que aplicar conceptos o técnicas.\n\nSupone revisar lo que hacemos, cómo lo hacemos y desde dónde intervenimos.\n\n## Sobre el taller\n\nUn espacio para detenerse, revisar herramientas y sostener la clínica junto a otros.',
     '', ''],
    ['2', 'SI', 'Psicoanálisis',
     'La interpretación en Freud y la tradición postfreudiana',
     'Hacer consciente lo inconsciente: insight, elaboración y simbolización.',
     'Junio 2026', 'Virtual',
     '',
     'La interpretación ocupa un lugar central en la práctica analítica.\n\nEn Freud, se trata de hacer consciente lo inconsciente. En Lacan, la intervención pasa por el equívoco, el corte y la conmoción del sentido.',
     '', '']
  ]);
  talleres.getRange('A1:K1')
          .setFontWeight('bold')
          .setBackground('#212121')
          .setFontColor('#fff7ec');
  talleres.setColumnWidth(1, 60);   // Orden
  talleres.setColumnWidth(2, 85);   // Publicado
  talleres.setColumnWidth(3, 120);  // Categoria
  talleres.setColumnWidth(4, 280);  // Titulo
  talleres.setColumnWidth(5, 300);  // Descripcion
  talleres.setColumnWidth(6, 110);  // Fecha
  talleres.setColumnWidth(7, 140);  // Modalidad
  talleres.setColumnWidth(8, 220);  // Imagen
  talleres.setColumnWidth(9, 380);  // Contenido
  talleres.setColumnWidth(10, 180); // Link
  talleres.setColumnWidth(11, 160); // Slug
  talleres.setFrozenRows(1);
  talleres.getRange('I2:I200').setWrap(true);
  talleres.getRange('E2:E200').setWrap(true);

  // Nota explicativa en la fila de encabezados
  talleres.getRange('H1').setNote('URL de una imagen pública.\nPuede ser de Unsplash, Drive (link directo) o cualquier hosting.\nDejar vacío si no tiene imagen.');
  talleres.getRange('I1').setNote('Texto completo de la nota.\n\nUsá:\n## Título de sección\n**negrita**\n*cursiva*\n[texto](https://link.com)\n\nSeparar párrafos con línea en blanco.');
  talleres.getRange('J1').setNote('Si querés que "Ver más" lleve a una página externa (ej: inscripción),\npegá la URL acá.\n\nSi lo dejás vacío y hay Contenido, abre la nota dentro del sitio.');
  talleres.getRange('K1').setNote('Se genera solo desde el título.\nSolo completar si querés una URL personalizada.');

  // Validación: Publicado solo SI o NO
  var reglaPublicado = SpreadsheetApp.newDataValidation()
    .requireValueInList(['SI', 'NO'], true)
    .setAllowInvalid(false)
    .build();
  talleres.getRange('B2:B200').setDataValidation(reglaPublicado);

  // Validación: categorías permitidas
  var reglaCategoria = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Taller', 'Seminario', 'Psicoanálisis', 'Clínica', 'Acompañamiento', 'Novedades'], true)
    .setAllowInvalid(true)
    .build();
  talleres.getRange('C2:C200').setDataValidation(reglaCategoria);

  // Sacar la hoja por defecto si quedó vacía
  var hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && ss.getSheets().length > 1 && hoja1.getLastRow() === 0) {
    ss.deleteSheet(hoja1);
  }

  SpreadsheetApp.getUi().alert(
    'Listo ✓\n\n' +
    'Planilla maestra con las pestañas:\n' +
    '• Config — tarifas y datos generales\n' +
    '• Talleres — eventos y novedades\n\n' +
    'Las consultas, contactos y postulaciones van a otra planilla.\n' +
    'Ejecutá ahora crearPlanillaDeRespuestas().'
  );
}


/**
 * Ejecutá esta función UNA VEZ (▶ Ejecutar) para separar las respuestas.
 *
 *  1. Crea una planilla nueva "Psi a Todo — Respuestas" con las pestañas
 *     Consultas, Contacto y Postulaciones.
 *  2. Copia ahí lo que ya hubiera en esas pestañas de la maestra.
 *  3. Guarda el ID de la planilla nueva para que doPost() escriba ahí.
 *
 * No borra nada de la maestra: cuando verifiques que todo quedó bien en la
 * planilla nueva, podés eliminar a mano las pestañas viejas de la maestra.
 * Si ya la ejecutaste antes, reutiliza la planilla existente (no duplica).
 */
function crearPlanillaDeRespuestas() {
  var props = PropertiesService.getScriptProperties();
  var maestra = SpreadsheetApp.getActiveSpreadsheet();
  var destino = null;

  var idGuardado = props.getProperty('RESPUESTAS_SS_ID');
  if (idGuardado) {
    try { destino = SpreadsheetApp.openById(idGuardado); } catch (err) { destino = null; }
  }
  if (!destino) {
    destino = SpreadsheetApp.create('Psi a Todo — Respuestas');
    props.setProperty('RESPUESTAS_SS_ID', destino.getId());
  }

  var definiciones = {
    'Consultas': [
      'fecha', 'nombre', 'apellido', 'edad', 'telefono', 'email',
      'pais', 'nacionalidad', 'motivo', 'modalidad', 'zona',
      'horarios', 'tratamiento', 'genero_preferencia', 'edad_preferencia',
      'honorarios', 'moneda', 'arancel_diferenciado'
    ],
    'Contacto': ['fecha', 'nombre', 'apellido', 'email', 'telefono', 'soy', 'mensaje'],
    'Postulaciones': [
      'fecha', 'nombre', 'apellido', 'email', 'telefono',
      'matricula', 'enfoque', 'experiencia', 'mensaje'
    ]
  };

  var migradas = [];

  Object.keys(definiciones).forEach(function(nombre) {
    var hojaDestino = destino.getSheetByName(nombre);
    var origen = maestra.getSheetByName(nombre);
    var origenTieneDatos = origen && origen.getLastRow() > 0;

    if (!hojaDestino) {
      if (origenTieneDatos) {
        // Copiar la pestaña tal cual (datos, formato y encabezados reales)
        hojaDestino = origen.copyTo(destino);
        hojaDestino.setName(nombre);
        migradas.push(nombre + ' (' + Math.max(origen.getLastRow() - 1, 0) + ' filas)');
      } else {
        hojaDestino = destino.insertSheet(nombre);
        var claves = definiciones[nombre];
        hojaDestino.getRange(1, 1, 1, claves.length).setValues([claves])
                   .setFontWeight('bold')
                   .setBackground('#212121')
                   .setFontColor('#fff7ec');
        hojaDestino.setFrozenRows(1);
      }
    }
  });

  // Sacar la hoja por defecto de la planilla nueva
  var porDefecto = destino.getSheetByName('Hoja 1') || destino.getSheetByName('Sheet1');
  if (porDefecto && destino.getSheets().length > 1) {
    destino.deleteSheet(porDefecto);
  }

  Logger.log('Planilla de respuestas: ' + destino.getUrl());
  SpreadsheetApp.getUi().alert(
    'Listo ✓\n\n' +
    'Planilla de respuestas:\n' + destino.getUrl() + '\n\n' +
    (migradas.length ? 'Se copiaron desde la maestra: ' + migradas.join(', ') + '.\n\n' : '') +
    'Desde ahora, consultas, contactos y postulaciones se guardan ahí.\n' +
    'Recordá crear una NUEVA VERSIÓN de la implementación (Implementar → ' +
    'Administrar implementaciones → editar → Nueva versión).'
  );
}
