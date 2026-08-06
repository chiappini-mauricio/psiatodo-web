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

const SHEETS_URL = '';   // ← PEGAR ACÁ LA URL DEL APPS SCRIPT


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
      descripcion: 'Un espacio para incomodarnos un poco. Para cuestionar lo heredado y salir de posiciones tomadas sin haberlas interrogado.',
      fecha: 'Mayo 2026',
      modalidad: 'Presencial + Virtual',
      imagen: '',
      contenido: 'Pensar la práctica clínica implica algo más que aplicar conceptos o técnicas.\n\nSupone revisar lo que hacemos, cómo lo hacemos y desde dónde intervenimos.\n\n## Sobre el taller\n\nUn espacio para detenerse, revisar herramientas y sostener la clínica junto a otros. No hay recetas: hay preguntas, y un lugar donde pensarlas con otros y otras.',
      link: '',
      slug: 'pensar-la-practica-clinica-pensamos-o-repetimos'
    },
    {
      categoria: 'Psicoanálisis',
      titulo: 'La interpretación en Freud y la tradición postfreudiana',
      descripcion: 'Hacer consciente lo inconsciente: insight, elaboración y simbolización. La intervención en Lacan: el equívoco, el corte y la conmoción del sentido.',
      fecha: 'Junio 2026',
      modalidad: 'Virtual',
      imagen: '',
      contenido: 'La interpretación ocupa un lugar central en la práctica analítica, pero su sentido cambió mucho a lo largo de la historia del psicoanálisis.\n\n## En Freud\n\nSe trata de hacer consciente lo inconsciente. El trabajo pasa por el insight, la elaboración y la simbolización.\n\n## En Lacan\n\nLa intervención pasa por el equívoco, el corte y la conmoción del sentido. No se trata de develar un significado oculto, sino de producir un efecto en el decir.',
      link: '',
      slug: 'la-interpretacion-en-freud-y-la-tradicion-postfreud'
    },
    {
      categoria: 'Clínica',
      titulo: 'Acompañar el padecimiento subjetivo',
      descripcion: 'Alojar aquello que duele, escuchar sin apurar sentidos y sostener un espacio donde el malestar pueda ser dicho, pensado y trabajado.',
      fecha: '2026',
      modalidad: 'Artículo',
      imagen: '',
      contenido: 'Acompañar el padecimiento subjetivo supone alojar aquello que duele, escuchar sin apurar sentidos y sostener un espacio donde el malestar pueda ser dicho, pensado y trabajado en su singularidad.\n\nNo todo malestar puede ser nombrado rápido ni resuelto con una indicación. Algunas experiencias necesitan tiempo, presencia y un espacio donde decirse.',
      link: '',
      slug: 'acompanar-el-padecimiento-subjetivo'
    },
    {
      categoria: 'Acompañamiento',
      titulo: 'No hay recetas. Hay preguntas.',
      descripcion: 'Y un espacio donde pensarlas con otros y otras. Reflexiones sobre la derivación cuidada y el acompañamiento clínico.',
      fecha: '2026',
      modalidad: 'Artículo',
      imagen: '',
      contenido: 'Cuando alguien busca terapia, muchas veces lo que encuentra es un listado. Nombres, especialidades, precios.\n\nPero elegir con quién trabajar el propio padecimiento no debería ser una decisión al azar.\n\n## Una derivación es una decisión clínica\n\nLeer cada consulta antes de derivarla no es un trámite: es parte del trabajo. Es lo que hace que un proceso pueda empezar en las mejores condiciones y sostenerse en el tiempo.',
      link: '',
      slug: 'no-hay-recetas-hay-preguntas'
    }
  ]
};
