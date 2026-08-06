# Psi a Todo — Guía de la planilla

Esta guía explica cómo conectar el sitio con Google Sheets y cómo
editar el contenido sin tocar código.

---

## Parte 1 — Instalación (se hace una sola vez)

### 1. Crear la planilla

Entrá a [sheets.google.com](https://sheets.google.com) y creá una planilla nueva.
Ponele de nombre **Psi a Todo — Web**.

### 2. Instalar el script

Dentro de la planilla:

1. Menú **Extensiones → Apps Script**
2. Se abre una pestaña nueva con un editor de código
3. Borrá todo lo que dice ahí (`function myFunction() {}`)
4. Abrí el archivo `apps-script/Codigo.gs` de este proyecto, copiá **todo** el contenido y pegalo
5. Apretá el ícono de guardar (💾)

### 3. Crear las pestañas automáticamente

Todavía en el editor de Apps Script:

1. En el desplegable de arriba (donde dice `doGet`), elegí **`crearEstructuraInicial`**
2. Apretá **▶ Ejecutar**
3. Google va a pedir permisos: **Revisar permisos → elegí tu cuenta → Configuración avanzada → Ir a (nombre del proyecto) → Permitir**
4. Volvé a la planilla: ya deberían estar creadas las pestañas **Config**, **Talleres**, **Consultas**, **Contacto** y **Postulaciones**

### 4. Publicar como aplicación web

De vuelta en el editor de Apps Script:

1. Botón **Implementar** (arriba a la derecha) → **Nueva implementación**
2. Al lado de "Seleccionar tipo" hacé click en el engranaje ⚙ → **Aplicación web**
3. Configurá así:
   - **Descripción:** `API sitio Psi a Todo`
   - **Ejecutar como:** `Yo (tu-mail@gmail.com)`
   - **Quién tiene acceso:** `Cualquier persona` ⚠️ *(importante — sin esto el sitio no puede leer)*
4. **Implementar**
5. Copiá la **URL de la aplicación web** (termina en `/exec`)

### 5. Conectar el sitio

1. Abrí el archivo `assets/config.js` del proyecto
2. En la primera línea, pegá la URL entre las comillas:

```js
const SHEETS_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

3. Guardá, y subí los cambios:

```
git add .
git commit -m "conectar planilla"
git push
```

Listo. En 30 segundos el sitio está leyendo de la planilla.

---

## Parte 2 — Uso diario

### Cambiar el precio mínimo

1. Abrí la planilla → pestaña **Config**
2. Buscá la fila `precio_minimo` y cambiá el valor de la columna B
3. Buscá también `precio_texto` y actualizá la frase completa
4. Listo — el sitio se actualiza solo, sin hacer nada más

| Clave | Valor de ejemplo | Dónde aparece |
|---|---|---|
| `precio_minimo` | `$25.000` | FAQ |
| `precio_texto` | `La tarifa mínima en Argentina es $25.000 por sesión.` | Formulario de consulta |
| `whatsapp` | `5491140463306` | Botón flotante |
| `email` | `info@psiatodo.com` | Footer y contacto |
| `tiempo_respuesta` | `24 horas hábiles` | Varios lugares |

> **Nota:** el cambio puede tardar unos minutos en verse por el caché del navegador.
> Si querés verlo al instante, abrí el sitio en una ventana de incógnito.

---

### Agregar un taller o novedad

1. Abrí la planilla → pestaña **Talleres**
2. Escribí una fila nueva al final:

| Columna | Qué poner | Ejemplo |
|---|---|---|
| **Orden** | Número — el más chico aparece primero | `1` |
| **Publicado** | `SI` para que se vea, `NO` para ocultarlo | `SI` |
| **Categoria** | Elegí del desplegable | `Taller` |
| **Titulo** | Nombre del taller o artículo | `Pensar la práctica clínica` |
| **Descripcion** | 1-2 oraciones | `Un espacio para incomodarnos...` |
| **Fecha** | Texto libre | `Mayo 2026` |
| **Modalidad** | Texto libre | `Presencial + Virtual` |
| **Link** | URL de inscripción, o `#` si todavía no hay | `https://...` |

3. Guardá (Google Sheets guarda solo)

**Para ocultar un taller viejo:** cambiá su `Publicado` de `SI` a `NO`.
No hace falta borrar la fila — así queda el historial.

**Para reordenar:** cambiá los números de la columna **Orden**.

> Los filtros de categoría del sitio se generan solos según las
> categorías que estés usando. Si agregás una categoría nueva,
> el filtro aparece automáticamente.

---

### Ver las consultas que llegan

Las tres pestañas se llenan solas:

- **Consultas** → formulario principal (el de "Quiero empezar")
- **Contacto** → formulario de la página de contacto
- **Postulaciones** → profesionales que quieren sumarse

Cada fila incluye la fecha y hora automáticamente.

**Consejo:** podés usar los filtros de Google Sheets para marcar cuáles
ya contactaste. Agregá una columna al final llamada `Estado` y usá
valores como `Nuevo` / `Contactado` / `Derivado`.

---

### Recibir un mail cuando llega una consulta

Por defecto está desactivado. Para activarlo:

1. Editor de Apps Script → buscá la función `enviarNotificacion`
2. Cambiá `info@psiatodo.com` por el mail donde querés recibirlas
3. Más arriba, en `doPost`, buscá esta línea y sacale las `//`:

```js
// enviarNotificacion(datos, nombreHoja);
```

4. Guardá y volvé a implementar: **Implementar → Administrar implementaciones → ✏️ (editar) → Versión: Nueva → Implementar**

---

## Preguntas frecuentes

**¿Qué pasa si rompo algo en la planilla?**
Nada grave. Si la planilla falla o no responde, el sitio usa valores por
defecto que están guardados en `assets/config.js`. Nunca se ve roto.

**¿Puedo agregar más campos a Config?**
Sí. Agregá una fila con una clave nueva, y después en el HTML usá
`<span data-sheet="mi_clave">valor por defecto</span>`.
Eso ya requiere tocar código, así que avisame y lo hago.

**¿Cuánta gente puede editar la planilla?**
Las que quieras. Compartila desde el botón "Compartir" de Google Sheets
con permiso de edición.

**¿Esto tiene costo?**
No. Google Sheets y Apps Script son gratuitos. El límite de Apps Script
es de unas 20.000 lecturas por día, muy por encima de lo que este sitio
va a necesitar.
