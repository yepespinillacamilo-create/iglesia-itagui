# 🏛️ Panel Pastoral · Iglesia Itagüí
## Guía de instalación paso a paso

---

## Requisitos previos

Antes de empezar necesitas tener instalados:
- **Node.js** (versión 18 o superior) → https://nodejs.org
- **Git** → https://git-scm.com
- Una cuenta en **GitHub** → https://github.com
- Una cuenta en **Supabase** (gratis) → https://supabase.com
- Una cuenta en **Vercel** (gratis) → https://vercel.com

---

## PASO 1 — Subir el proyecto a GitHub

1. Ve a https://github.com y crea un **nuevo repositorio**
   - Nombre: `iglesia-itagui-panel`
   - Visibilidad: **Private** ✓
   - Sin README (ya tienes uno)

2. Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Panel pastoral - versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/iglesia-itagui-panel.git
git push -u origin main
```

---

## PASO 2 — Crear proyecto en Supabase

1. Inicia sesión en https://supabase.com
2. Clic en **"New project"**
3. Nombre: `iglesia-itagui`
4. Contraseña de DB: anota una contraseña segura (guárdala)
5. Región: **South America (São Paulo)** — la más cercana a Colombia
6. Espera ~2 minutos mientras se crea el proyecto

---

## PASO 3 — Crear las tablas (esquema SQL)

1. En Supabase, ve a **SQL Editor** (menú izquierdo)
2. Clic en **"New query"**
3. Copia TODO el contenido del archivo `supabase/schema.sql`
4. Pégalo en el editor y clic en **"Run"** (o Ctrl+Enter)
5. Deberías ver: `Success. No rows returned`

> Esto crea las 4 tablas, activa la seguridad RLS y carga las 9 áreas iniciales.

---

## PASO 4 — Crear las cuentas de Camilo y Karen

1. En Supabase, ve a **Authentication** > **Users** (menú izquierdo)
2. Clic en **"Add user"** > **"Create new user"**
3. Crea la cuenta de Camilo:
   - Email: `camilo@iglesiaitagui.com` (o el que quieras)
   - Password: una contraseña segura
   - Marcar: **Auto Confirm User** ✓
4. Repite para Karen:
   - Email: `karen@iglesiaitagui.com`
   - Password: contraseña segura
   - Marcar: **Auto Confirm User** ✓

> Estos serán los correos y contraseñas que usan para entrar a la app.

---

## PASO 5 — Obtener las credenciales de Supabase

1. En Supabase, ve a **Settings** > **API** (menú izquierdo)
2. Anota estos dos valores:
   - **Project URL** → algo como `https://abcdefgh.supabase.co`
   - **anon / public key** → una clave larga que empieza con `eyJ...`

---

## PASO 6 — Configurar variables de entorno localmente

1. En la carpeta del proyecto, copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Abre el archivo `.env` y rellena con tus valores de Supabase:
```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## PASO 7 — Probar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:5173 en tu navegador.

✅ Deberías ver la pantalla de login.
✅ Ingresa con el correo y contraseña que creaste para Camilo.
✅ La app carga con las 9 áreas ya guardadas en Supabase.

---

## PASO 8 — Desplegar en Vercel

1. Ve a https://vercel.com e inicia sesión con tu cuenta de GitHub
2. Clic en **"Add New Project"**
3. Importa el repositorio `iglesia-itagui-panel`
4. En la sección **"Environment Variables"** agrega:
   - `VITE_SUPABASE_URL` = tu Project URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key de Supabase
5. Clic en **"Deploy"**
6. Espera ~1 minuto

¡Listo! Vercel te dará una URL como:
`https://iglesia-itagui-panel.vercel.app`

---

## PASO 9 (Opcional) — Dominio personalizado

Si quieres una URL propia como `panel.iglesiaitagui.com`:
1. En Vercel, ve a tu proyecto > **Settings** > **Domains**
2. Agrega tu dominio y sigue las instrucciones de DNS

---

## Actualizaciones futuras

Cada vez que hagas cambios en el código:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
Vercel detecta el push y redespliega automáticamente en ~30 segundos.

---

## ¿Algo salió mal?

| Problema | Solución |
|----------|----------|
| "Missing VITE_SUPABASE_URL" | Verifica el archivo `.env` o las variables en Vercel |
| Login no funciona | Verifica que el usuario esté creado en Supabase Auth > Users |
| Pantalla en blanco | Abre la consola del navegador (F12) y envíame el error |
| No carga datos | Verifica que el SQL se ejecutó correctamente en Supabase |

