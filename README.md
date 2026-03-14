# ⚽ ASE Athletics - Plataforma de Análisis de Fútbol

Este proyecto es una solución integral diseñada para ojeadores y entrenadores de fútbol, permitiendo la gestión de datos de jugadores, visualización de métricas de rendimiento y generación de reportes técnicos.

---

## 🚀 Demostración en Vivo
* **Aplicación Frontend:** [Pendiente de despliegue - Vercel/Netlify]
* **API Backend:** [Pendiente de despliegue - Railway/Heroku]
* **Credenciales de Acceso:** * **Usuario:** `demo@ase-athletics.com`
  * **Contraseña:** `demo123`

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
