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
    precio_minimo:    '',
    precio_texto:     'Esta info nos permite orientarte hacia el profesional adecuado.',
    whatsapp:         '5491140463306',
    email:            'info@psiatodo.com',
    tiempo_respuesta: '24 horas hábiles'
  },
  talleres: [
    {
      categoria: 'Talleres',
      titulo: 'Clínica de la Psicosis Ordinaria',
      descripcion: '¿Es la psicosis su desencadenamiento? No lo creemos. La estructura psicótica es mucho más que su expresión extraordinaria en los fenómenos elementales.',
      fecha: 'Septiembre 2026',
      modalidad: 'Virtual',
      imagen: 'https://i.postimg.cc/JhSJZRHx/Captura-de-pantalla-2026-08-06-032601.png',
      contenido: '¿Es la psicosis su desencadenamiento?\n\nNo lo creemos. La estructura psicótica es mucho más que su expresión extraordinaria en los fenómenos elementales.\n\nNos interesa pensar la clínica allí donde la psicosis no se presenta bajo la forma del brote, sino cuando la estructura opera a partir de otro anudamiento, sosteniendo arreglos singulares que no pasan por la descompensación clásica.',
      link: '',
      slug: 'clinica-de-la-psicosis-ordinaria'
    },
    {
      categoria: 'Artículos',
      titulo: 'La decisión de empezar terapia',
      descripcion: 'Solemos vivir sin pensar mucho en nosotros mismos, ocupados por las tareas de la vida cotidiana y las personas que nos rodean, son cada vez menos los momentos en los que nos detenemos a reflexionar.',
      fecha: 'Junio 2026',
      modalidad: 'Artículo',
      imagen: 'https://static.wixstatic.com/media/c3309b_3210190f67834d48bd6d75e1d8d323e0~mv2.jpg/v1/fill/w_454,h_341,fp_0.50_0.50,q_90,enc_avif,quality_auto/c3309b_3210190f67834d48bd6d75e1d8d323e0~mv2.jpg',
      contenido: 'Solemos vivir sin pensar mucho en nosotros mismos, ocupados por las tareas de la vida cotidiana y las personas que nos rodean, son cada vez menos los momentos en los que nos detenemos a reflexionar.\n\nLa decisión de empezar terapia nunca es fácil y casi siempre viene acompañada de un periodo de mucha postergación. Entre darnos cuenta que algo viene mal y animarnos a consultar suele transcurrir mucho tiempo.',
      link: '',
      slug: 'la-decision-de-empezar-terapia'
    },
    {
      categoria: 'Formación Profesional',
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
      categoria: 'Formación Profesional',
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
      categoria: 'Artículos',
      titulo: 'Acompañar el padecimiento subjetivo',
      descripcion: 'Alojar aquello que duele, escuchar sin apurar sentidos y sostener un espacio donde el malestar pueda ser dicho, pensado y trabajado.',
      fecha: '2026',
      modalidad: 'Artículo',
      imagen: '',
      contenido: 'Acompañar el padecimiento subjetivo supone alojar aquello que duele, escuchar sin apurar sentidos y sostener un espacio donde el malestar pueda ser dicho, pensado y trabajado en su singularidad.\n\nNo todo malestar puede ser nombrado rápido ni resuelto con una indicación. Algunas experiencias necesitan tiempo, presencia y un espacio donde decirse.',
      link: '',
      slug: 'acompanar-el-padecimiento-subjetivo'
    }
  ]
};
