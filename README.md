# ⚽ ASE Athletics - Plataforma de Análisis de Fútbol

Este proyecto es una solución integral diseñada para ojeadores y entrenadores de fútbol, permitiendo la gestión de datos de jugadores, visualización de métricas de rendimiento y generación de reportes técnicos.

---

## 🚀 Demostración en Vivo
* **Aplicación Frontend:** desplegar en Netlify (ver sección *Despliegue en Netlify*).
* **API Backend:** desplegar por separado (Railway, Render, Fly.io, etc.) y configurar la URL en el frontend.
* **Credenciales de acceso:** `demo@ase-athletics.com` / `demo123`.

---

## 🐳 Levantar todo con Docker (un solo comando)

Si tienes **Docker** y **Docker Compose** instalados, puedes levantar la base de datos, el backend y el frontend con:

```bash
# Desde la raíz del repositorio
docker compose up --build
```

- **Frontend:** http://localhost:3000  
- **API Backend:** http://localhost:5000  
- **PostgreSQL:** puerto 5432 (user: `user_ase`, password: `password_ase`, DB: `ase_athletics`)

La primera vez se ejecutan las migraciones y el seed de datos. Credenciales de acceso: `demo@ase-athletics.com` / `demo123`.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* **React.js:** Con Context API/Redux para la gestión del estado global.
* **Tailwind CSS:** Diseño moderno, profesional y totalmente responsive.
* **Recharts / Chart.js:** Visualización interactiva de estadísticas y rendimiento.

**Backend:**
* **Node.js & Express:** Arquitectura robusta para el servidor API.
* **PostgreSQL:** Base de datos relacional para integridad de datos.
* **JWT & Bcrypt:** Autenticación segura y cifrado de contraseñas.

---

## ⚙️ Configuración de Desarrollo Local

### 1. Requisitos Previos
* Node.js (v16 o superior)
* PostgreSQL (Instancia local o en la nube)
* Git

### 2. Configuración del Backend
```bash
# Navegar a la carpeta
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno (DATABASE_URL y JWT_SECRET)
cp .env.example .env

# Preparar la base de datos y cargar datos iniciales (JSON)
npm run db:create
npm run db:migrate
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Pruebas

**Backend (requiere Postgres con esquema y opcionalmente seed):**
```bash
cd backend
npm test
```
Incluye: pruebas de API (auth, jugadores, reportes), health check y un flujo de integración (registro → login → crear reporte).

**Frontend:**
```bash
cd frontend
npm test -- --watchAll=false
```
Incluye: pruebas unitarias de utilidades (p. ej. formateo de números).

---

## 🌐 Despliegue en Netlify (frontend)

El frontend está preparado para desplegarse en Netlify. La raíz del repo incluye `netlify.toml` con la base en `frontend`, el comando de build y las redirecciones SPA.

### Pasos

1. **Conectar el repositorio**
   - Entra en [Netlify](https://www.netlify.com/) y *Add new site* → *Import an existing project*.
   - Conecta GitHub/GitLab y elige este repositorio.

2. **Configuración de build (opcional)**
   - Netlify usa por defecto la configuración de `netlify.toml`:
     - **Base directory:** `frontend`
     - **Build command:** `npm run build`
     - **Publish directory:** `frontend/build` (Netlify lo resuelve desde `base` + `publish` → `build`).

3. **Variable de entorno para la API**
   - En *Site settings* → *Environment variables* añade:
     - **Key:** `REACT_APP_API_URL`
     - **Value:** URL pública de tu backend (ej. `https://tu-api.railway.app` o `https://tu-app.onrender.com`).
   - Sin esta variable, el frontend usará `http://localhost:5000` (solo útil en local).

4. **Desplegar**
   - *Deploy site*. Cada push a la rama principal puede desplegarse automáticamente si está activo el deploy automático.

**Nota:** El backend (Node + PostgreSQL) debe estar desplegado en otro servicio; ver sección *Despliegue del backend*. CORS está habilitado por defecto; en producción puedes restringirlo al dominio de Netlify.

### Si la página está caída, en blanco o 404

1. **Revisa el build en Netlify:** *Deploys* → último deploy → *Build log*. Si el build falla, verás el error (p. ej. `npm run build` fallido, falta de memoria, Node distinto).
2. **Configuración de build en la UI:** *Site configuration* → *Build & deploy* → *Build settings*. Debe coincidir con `netlify.toml`:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build` (relativo a la base)
3. **Variable de entorno:** Añade `REACT_APP_API_URL` con la URL de tu backend (sin `/api` al final). Sin backend desplegado, la app cargará pero login y datos fallarán.
4. **Rutas directas (ej. /players/1):** Debe existir la redirección SPA (`/*` → `/index.html`). Viene en `netlify.toml` y en `frontend/public/_redirects`. Si tras un deploy manual cambiaste la publish directory, comprueba que no se haya perdido.
5. **Redeploy:** Después de cambiar variables de entorno o `netlify.toml`, haz *Trigger deploy* → *Deploy site* para que el build use la nueva configuración.

---

## 🔧 Despliegue del backend (Node + PostgreSQL)

El backend usa **Express**, **PostgreSQL** y variables de entorno: `DATABASE_URL`, `JWT_SECRET` y opcionalmente `PORT`. Estas plataformas permiten desplegar API + base de datos en un mismo sitio:

| Plataforma | Ventaja | Plan gratuito |
|------------|---------|----------------|
| **[Railway](https://railway.app)** | Muy sencillo: proyecto + PostgreSQL en un clic, URL pública automática | Límite de uso mensual |
| **[Render](https://render.com)** | Web Service + PostgreSQL gratuitos, buen equilibrio | Free tier con “spin down” tras inactividad |
| **[Fly.io](https://fly.io)** | Control fino, Postgres incluido | Free tier con límites |

### Variables de entorno necesarias

- **`DATABASE_URL`** – URL de conexión a PostgreSQL (la proporciona la plataforma al crear la base de datos).
- **`JWT_SECRET`** – Cadena secreta para firmar los JWT (inventa una larga y aleatoria).
- **`PORT`** – Opcional; la mayoría de plataformas lo inyectan automáticamente.

### Pasos genéricos

1. Crear un **nuevo proyecto** y añadir un **servicio PostgreSQL** (o base de datos).
2. Crear un **servicio Web** que use este repositorio:
   - **Root directory / Base directory:** `backend`.
   - **Build command:** `npm install` (o el que indique la plataforma para Node).
   - **Start command:** `npm start` (ejecuta `node src/index.js`).
3. En el servicio Web, configurar las variables de entorno: `DATABASE_URL` (copiar desde el Postgres del proyecto), `JWT_SECRET`.
4. **Esquema y datos iniciales:** en este proyecto el esquema se aplica con `node scripts/wait-and-migrate.js` (ejecuta `migrations/init_schema.sql`) y el seed con `npm run db:seed`. En Railway/Render puedes usar un *Pre-Deploy* o *Release* command como `node scripts/wait-and-migrate.js && npm run db:seed`, o ejecutarlo una vez por CLI usando la `DATABASE_URL` de producción.

### Railway (resumen rápido)

1. [railway.app](https://railway.app) → *Start a New Project* → *Deploy from GitHub repo* → elige el repo.
2. Añade **PostgreSQL** en el mismo proyecto (*New* → *Database* → *PostgreSQL*). Railway te dará `DATABASE_URL` en Variables.
3. Para el **servicio del backend:** *New* → *GitHub Repo* → mismo repo. En **Settings** del servicio:
   - **Root Directory:** `backend` ← **obligatorio**. Si no lo pones, Railpack analiza la raíz del repo (donde no hay `package.json`) y falla con *"Railpack could not determine how to build the app"*.
   - Build y Start: Railpack detectará Node.js al tener `backend` como raíz; opcionalmente usa el `railway.toml` dentro de `backend/`.
4. Variables: añade `JWT_SECRET`; `DATABASE_URL` suele inyectarse si el Postgres está en el mismo proyecto.
5. *Deploy*. La URL del servicio (ej. `https://tu-app.railway.app`) es la que debes poner en **`REACT_APP_API_URL`** en Netlify.

### Render (resumen rápido)

1. [render.com](https://render.com) → *New* → *PostgreSQL* (crear base de datos) y anotar la **Internal/External Database URL**.
2. *New* → *Web Service* → conectar el repo. **Root Directory:** `backend`. **Build:** `npm install`. **Start:** `npm start`.
3. En *Environment* del Web Service: `DATABASE_URL` (la URL del Postgres), `JWT_SECRET`.
4. Opcional: en *Advanced* puedes definir un *Pre-Deploy Command* para migraciones/seed si lo tienes scriptado.
5. La URL del servicio (ej. `https://tu-app.onrender.com`) es la que usas en **`REACT_APP_API_URL`** en Netlify.
