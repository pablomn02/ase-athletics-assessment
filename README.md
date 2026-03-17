# ⚽ ASE Athletics - Plataforma de Análisis de Fútbol

Plataforma para ojeadores y entrenadores: gestión de jugadores, métricas de rendimiento y reportes técnicos.

---

## Credenciales de prueba

- **Email:** `demo@ase-athletics.com`
- **Contraseña:** `demo123`

---

## Opción 1: Probar con Docker (recomendado)

Si tienes **Docker** y **Docker Compose** instalados:

```bash
# Desde la raíz del repositorio
docker compose up --build
```

- **App (frontend):** http://localhost:3000  
- **API (backend):** http://localhost:5000  

La primera vez se crean las tablas y se cargan datos de ejemplo. Usa las credenciales anteriores para iniciar sesión.

**Nota:** Por defecto se usa un `JWT_SECRET` de desarrollo. En un entorno compartido o producción, define la variable de entorno antes de levantar: `export JWT_SECRET=tu_secreto_largo_y_aleatorio` (y luego `docker compose up --build`).

---

## Opción 2: Instalación local (sin Docker)

### Requisitos

- **Node.js** v18 o superior  
- **PostgreSQL** (local o en la nube)  
- **Git**

### 1. Base de datos

Crea la base de datos en PostgreSQL (solo una vez), por ejemplo:

```bash
psql -U postgres -c "CREATE DATABASE ase_athletics;"
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` y configura:

- **`DATABASE_URL`** – Conexión a PostgreSQL (ej. `postgresql://usuario:contraseña@localhost:5432/ase_athletics`)
- **`JWT_SECRET`** – Una cadena secreta cualquiera (ej. `mi_secreto_jwt`)

Luego:

```bash
npm run db:migrate   # Crea las tablas
npm run db:seed      # Carga datos de ejemplo
npm run dev          # Servidor en http://localhost:5000
```

### 3. Frontend

En **otra terminal**, desde la raíz del repo:

```bash
cd frontend
npm install
npm start
```

La app se abrirá en http://localhost:3000 y usará la API en `http://localhost:5000` por defecto.

Si tu backend está en otra URL, crea un `.env` en `frontend` con:

```
REACT_APP_API_URL=http://localhost:5000
```

(o la URL que uses).

---

## Pruebas automáticas

**Backend** (con PostgreSQL levantado y migraciones/seed hechos):

```bash
cd backend
npm test
```

**Frontend:**

```bash
cd frontend
npm test -- --watchAll=false
```

---

## Documentación adicional

- **Esquema de base de datos:** `docs/database-schema.md`  
- **API:** `docs/api-documentation.md`  
- **Checklist de requisitos:** `docs/CHECKLIST-REQUISITOS.md`
