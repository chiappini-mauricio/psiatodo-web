/**
 * PSI A TODO — Configuración
 * ═══════════════════════════
 *
 * Acá va la URL del Apps Script que conecta el sitio con Google Sheets.
 *
 * Para obtenerla:
 *   1. Abrí la planilla → Extensiones → Apps Script
 *   2. Implementar → Nueva implementación → Aplicación web
 *   3. Copiá la URL que termina en /exec
 *   4. Pegala abajo, entre las comillas
 *
 * Mientras esté vacía, el sitio usa los valores por defecto
 * que están más abajo en DEFAULTS.
 */

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwvUUrx_Z5VShOijnkTM7gkYVKdZ3Ya8mRu4zEU9k4WUpR2HPYMKc82bq_N5gPTy7zFGQ/exec';   // ← PEGAR ACÁ LA URL DEL APPS SCRIPT


/**
 * Valores por defecto.
 * Se usan si la planilla no responde o si SHEETS_URL está vacía.
 * Así el sitio nunca se rompe.
 */
const DEFAULTS = {
  config: {
    precio_minimo:    '$20.000',
    precio_texto:     'La tarifa mínima en Argentina es $20.000 por sesión.',
    whatsapp:         '5491140463306',
    email:            'info@psiatodo.com',
    tiempo_respuesta: '24 horas hábiles'
  },
  talleres: [
    {
      categoria: 'Taller',
      titulo: 'Pensar la práctica clínica: ¿pensamos o repetimos?',
      descripcion: 'Un espacio para incomodarnos un poco. Para cuestionar lo heredado. Para salir de posiciones tomadas sin haberlas interrogado.',
      fecha: 'Mayo 2026',
      modalidad: 'Presencial + Virtual',
      link: '#'
    },
    {
      categoria: 'Psicoanálisis',
      titulo: 'La interpretación en Freud y la tradición postfreudiana',
      descripcion: 'Hacer consciente lo inconsciente: insight, elaboración y simbolización. La intervención en Lacan: el equívoco, el corte y la conmoción del sentido.',
      fecha: 'Junio 2026',
      modalidad: 'Virtual',
      link: '#'
    },
    {
      categoria: 'Clínica',
      titulo: 'Acompañar el padecimiento subjetivo',
      descripcion: 'Supone alojar aquello que duele, escuchar sin apurar sentidos y sostener un espacio donde el malestar pueda ser dicho, pensado y trabajado en su singularidad.',
      fecha: '2026',
      modalidad: 'Artículo',
      link: '#'
    },
    {
      categoria: 'Acompañamiento',
      titulo: 'No hay recetas. Hay preguntas.',
      descripcion: 'Y un espacio donde pensarlas con otros y otras. Reflexiones sobre la práctica de la derivación cuidada y el acompañamiento clínico.',
      fecha: '2026',
      modalidad: 'Artículo',
      link: '#'
    }
  ]
};
