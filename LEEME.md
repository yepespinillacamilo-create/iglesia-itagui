# 🏛️ Iglesia Itagüí — Panel Pastoral v2

Tu app rediseñada: blanca, azul, moderna, con **chat IA** e **instalable en el celular**.

---

## Qué hay de nuevo

- 🎨 **Diseño nuevo** — blanco, azul, estilo Linear/Vercel, más compacto
- ✦ **Chat con IA** — le escribes y crea tareas/reuniones, o te dice qué tienes pendiente
- 📱 **Instalable** — se agrega a la pantalla de inicio del celular como app real (PWA)
- 🔒 **IA segura** — tu llave de Groq vive en el servidor, nunca en el navegador

---

## Antes de empezar

Ya tienes de la versión anterior:
- Proyecto en Supabase ✓
- Proyecto en Vercel ✓
- Repositorio en GitHub ✓

Vamos a **reemplazar el código** del repo con esta versión nueva y agregar **una variable** (la llave de Groq).

---

## PASO 1 — Subir el código nuevo a GitHub

La forma más simple desde el navegador:

1. Ve a tu repositorio en **github.com**
2. **Borra los archivos viejos** (o simplemente sube encima): clic en cada carpeta `src`, etc.
   > Más fácil: crea un repo nuevo y arrastra todo. Pero si quieres mantener el mismo, sube los archivos nuevos reemplazando.
3. Lo más cómodo: en la página principal del repo, clic en **"Add file" → "Upload files"**, y **arrastra todas las carpetas y archivos** de esta versión (`src`, `api`, `public`, `index.html`, `package.json`, etc.)
4. Abajo, clic en **"Commit changes"**

> ⚠️ Importante: que queden en la raíz del repo `package.json`, `index.html`, y las carpetas `src/`, `api/`, `public/`.

---

## PASO 2 — Actualizar la base de datos

1. Ve a **Supabase → SQL Editor → New query**
2. Abre el archivo `supabase-schema.sql`, copia TODO y pégalo
3. Clic en **Run**

Es seguro aunque ya tengas datos: solo agrega lo que falte (la columna `titulo` en bitácora) y no borra nada.

---

## PASO 3 — Conseguir tu llave de Groq (gratis)

1. Ve a **console.groq.com**
2. Inicia sesión (o crea cuenta gratis)
3. Menú **API Keys → Create API Key**
4. Copia la llave (empieza con `gsk_`)

---

## PASO 4 — Agregar las variables en Vercel

Ve a **Vercel → tu proyecto → Settings → Environment Variables**.

Necesitas **3 variables** (las 2 primeras quizá ya están):

| Nombre | Valor | ¿Ya la tienes? |
|--------|-------|----------------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase | Sí (de antes) |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key de Supabase | Sí (de antes) |
| `GROQ_API_KEY` | La llave `gsk_...` de Groq | **Nueva — agrégala** |

> 🔑 Importante: la de Groq se llama **`GROQ_API_KEY`** (sin `VITE_` adelante). Eso hace que viva solo en el servidor y nunca llegue al navegador. Es lo que mantiene tu llave segura.

Para agregar la nueva: escribe el nombre en **Key**, pega el valor en **Value**, clic en **Add**.

---

## PASO 5 — Redesplegar

1. Vercel → pestaña **Deployments**
2. En el último, clic en los **`...`** → **Redeploy**
3. Espera ~1 minuto

¡Listo! Tu app nueva está en línea.

---

## PASO 6 — Instalarla en el celular

### En iPhone (Safari)
1. Abre tu URL de Vercel en **Safari**
2. Toca el botón **Compartir** (cuadro con flecha hacia arriba)
3. Baja y toca **"Agregar a inicio"**
4. Aparece el ícono en tu pantalla como una app

### En Android (Chrome)
1. Abre tu URL en **Chrome**
2. Toca el menú **⋮** (arriba derecha)
3. Toca **"Instalar aplicación"** o **"Agregar a pantalla principal"**
4. Listo, queda como app

Cuando la abres desde el ícono, se ve a pantalla completa, sin barra del navegador — como una app de verdad.

---

## Cómo usar el chat con IA

Toca el botón azul ✦ en el centro de la barra inferior. Ejemplos:

| Le escribes | Hace |
|-------------|------|
| "Dar la predicación este domingo sobre el Salmo 23" | Crea tarea en Predicación, domingo, alta |
| "Reunión de pastorado el miércoles 6pm en la oficina" | Crea reunión con fecha, hora y lugar |
| "Me comprometí a llevar sillas y comprar materiales" | Crea **2 tareas** a la vez |
| "¿Qué tengo urgente?" | Te lista las tareas urgentes |
| "¿Qué hay esta semana?" | Resumen de lo próximo |

**Truco:** usa el micrófono del teclado de tu celular para dictar en vez de escribir.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| El chat dice "No pude procesar" | Falta `GROQ_API_KEY` en Vercel, o no redesplegaste |
| Login no funciona | Revisa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` |
| No aparece "Instalar app" | En iPhone usa Safari; en Android usa Chrome |
| Pantalla en blanco | Abre la consola (F12) y revisa el error |
| No carga datos | Verifica que corriste el SQL del Paso 2 |

---

## Estructura del proyecto (referencia)

```
api/
  chat.js            ← función serverless que habla con Groq (segura)
public/
  icon-192.png       ← íconos de la app instalable
  icon-512.png
src/
  App.jsx            ← orquestador principal
  screens/           ← Inicio, Tareas, Agenda, Chat, Áreas, Login
  components/         ← tarjetas, modales, navegación, UI
  lib/               ← supabase, datos, constantes, íconos
supabase-schema.sql  ← la base de datos
```
