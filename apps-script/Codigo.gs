/**
 * PSI A TODO — Google Apps Script
 * ================================
 *
 * Este script cumple DOS funciones:
 *
 *  1. doGet()  → Devuelve el contenido editable del sitio (precios, talleres)
 *                en formato JSON, para que la web lo lea.
 *
 *  2. doPost() → Recibe las consultas del formulario y las guarda
 *                en la pestaña "Consultas".
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

  var filas = hoja.getDataRange().getValues();
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
      link:        item['link']        || '#',
      orden:       parseInt(item['orden'] || '99', 10)
    });
  }

  // Ordenar por columna Orden
  talleres.sort(function(a, b) { return a.orden - b.orden; });

  return talleres;
}


// ═══════════════════════════════════════════════════════════
// ESCRITURA — recibe las consultas del formulario
// ═══════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

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

    // Notificación por mail (opcional — descomentar y poner el mail)
    // enviarNotificacion(datos, nombreHoja);

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
  cuerpo += '\n---\nVer todas: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

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
 * para que arme las pestañas con sus encabezados.
 */
function crearEstructuraInicial() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Pestaña CONFIG ──
  var config = ss.getSheetByName('Config') || ss.insertSheet('Config');
  config.clear();
  config.getRange('A1:C1').setValues([['Clave', 'Valor', 'Dónde aparece']]);
  config.getRange('A2:C6').setValues([
    ['precio_minimo',      '$20.000',  'Formulario de consulta + FAQ'],
    ['precio_texto',       'La tarifa mínima en Argentina es $20.000 por sesión.', 'FAQ - respuesta sobre aranceles'],
    ['whatsapp',           '5491140463306', 'Botón flotante + links'],
    ['email',              'info@psiatodo.com', 'Footer + contacto'],
    ['tiempo_respuesta',   '24 horas hábiles', 'Varios lugares del sitio']
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
  talleres.getRange('A1:H1').setValues([[
    'Orden', 'Publicado', 'Categoria', 'Titulo', 'Descripcion', 'Fecha', 'Modalidad', 'Link'
  ]]);
  talleres.getRange('A2:H4').setValues([
    ['1', 'SI', 'Taller',
     'Pensar la práctica clínica: ¿pensamos o repetimos?',
     'Un espacio para incomodarnos un poco. Para cuestionar lo heredado.',
     'Mayo 2026', 'Presencial + Virtual', '#'],
    ['2', 'SI', 'Psicoanálisis',
     'La interpretación en Freud y la tradición postfreudiana',
     'Hacer consciente lo inconsciente: insight, elaboración y simbolización.',
     'Junio 2026', 'Virtual', '#'],
    ['3', 'NO', 'Clínica',
     'Ejemplo de taller NO publicado',
     'Este no aparece en la web porque Publicado dice NO.',
     '2026', 'Virtual', '#']
  ]);
  talleres.getRange('A1:H1')
          .setFontWeight('bold')
          .setBackground('#212121')
          .setFontColor('#fff7ec');
  talleres.setColumnWidth(1, 60);
  talleres.setColumnWidth(2, 80);
  talleres.setColumnWidth(3, 120);
  talleres.setColumnWidth(4, 300);
  talleres.setColumnWidth(5, 340);
  talleres.setColumnWidth(6, 120);
  talleres.setColumnWidth(7, 150);
  talleres.setColumnWidth(8, 200);
  talleres.setFrozenRows(1);

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

  // ── Pestaña CONSULTAS ──
  var consultas = ss.getSheetByName('Consultas') || ss.insertSheet('Consultas');
  if (consultas.getLastRow() === 0) {
    consultas.getRange('A1:N1').setValues([[
      'fecha', 'nombre', 'apellido', 'edad', 'telefono', 'email',
      'pais', 'nacionalidad', 'motivo', 'modalidad', 'zona',
      'horarios', 'tratamiento', 'honorarios'
    ]]);
    consultas.getRange('A1:N1')
             .setFontWeight('bold')
             .setBackground('#212121')
             .setFontColor('#fff7ec');
    consultas.setFrozenRows(1);
  }

  // ── Pestaña CONTACTO ──
  var contacto = ss.getSheetByName('Contacto') || ss.insertSheet('Contacto');
  if (contacto.getLastRow() === 0) {
    contacto.getRange('A1:F1').setValues([[
      'fecha', 'nombre', 'apellido', 'email', 'telefono', 'mensaje'
    ]]);
    contacto.getRange('A1:F1')
            .setFontWeight('bold')
            .setBackground('#212121')
            .setFontColor('#fff7ec');
    contacto.setFrozenRows(1);
  }

  // ── Pestaña POSTULACIONES ──
  var postul = ss.getSheetByName('Postulaciones') || ss.insertSheet('Postulaciones');
  if (postul.getLastRow() === 0) {
    postul.getRange('A1:I1').setValues([[
      'fecha', 'nombre', 'apellido', 'email', 'telefono',
      'matricula', 'enfoque', 'experiencia', 'mensaje'
    ]]);
    postul.getRange('A1:I1')
          .setFontWeight('bold')
          .setBackground('#212121')
          .setFontColor('#fff7ec');
    postul.setFrozenRows(1);
  }

  // Sacar la hoja por defecto si quedó vacía
  var hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && ss.getSheets().length > 1 && hoja1.getLastRow() === 0) {
    ss.deleteSheet(hoja1);
  }

  SpreadsheetApp.getUi().alert(
    'Listo ✓\n\n' +
    'Se crearon las pestañas:\n' +
    '• Config — precio mínimo y datos generales\n' +
    '• Talleres — eventos y novedades\n' +
    '• Consultas — formulario principal\n' +
    '• Contacto — formulario de contacto\n' +
    '• Postulaciones — profesionales\n\n' +
    'Ahora implementá el script como aplicación web.'
  );
}
