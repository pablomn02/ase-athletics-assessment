ASE Athletics - Plataforma de Análisis de Fútbol
Demostración en Vivo
Aplicación Frontend: [Pendiente de despliegue - Vercel/Netlify]
API Backend: [Pendiente de despliegue - Heroku/Railway/DigitalOcean]
Documentación de API: [URL de Swagger UI o Markdown detallado]
Resumen del Proyecto
Implementación de un espacio de trabajo digital profesional para ojeadores y entrenadores de fútbol
. La plataforma permite la gestión integral de jugadores, visualización de métricas de rendimiento mediante paneles interactivos, comparación avanzada de perfiles y generación de reportes de scouting estructurados
.
Stack Tecnológico
Frontend
Framework: React.js con Context API/Redux
.
Estilos: Tailwind CSS (Modern utility-first)
.
Gráficos: Recharts / Chart.js (Visualización interactiva)
.
Enrutamiento: React Router
.
Backend
Runtime: Node.js
.
Framework: Express
.
Base de Datos: PostgreSQL (Relacional)
.
Autenticación: JWT (JSON Web Tokens) con hashing de contraseñas mediante bcrypt
.
Validación: Joi o Yup
.
DevOps y Despliegue
Host Frontend: Vercel o Netlify
.
Host Backend: Railway o Heroku
.
Host Base de Datos: PostgreSQL administrado
.
Control de Versiones: Git con GitHub
.
Configuración de Desarrollo Local
Prerrequisitos
Node.js (v16 o superior)
.
PostgreSQL (Instancia local o en la nube)
.
Git
.
Configuración Backend
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configuración de entorno
cp .env.example .env 
# (Configurar DATABASE_URL y JWT_SECRET en el archivo .env)

# Configuración de base de datos
npm run db:create
npm run db:migrate
npm run db:seed # Carga de datos desde players_Data_production.json [14]

# Iniciar servidor de desarrollo
npm run dev
Configuración Frontend
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Configuración de entorno
cp .env.example .env 
# Establecer REACT_APP_API_URL=http://localhost:5000

# Iniciar servidor de desarrollo
npm start
Esquema de Base de Datos
El sistema utiliza un diseño relacional con las siguientes entidades principales
:
Users: Gestión de ojeadores y personal técnico.
Players: Datos centrales, estadísticas y valor de mercado.
Player_Attributes: Métricas físicas y técnicas detalladas.
Scout_Reports: Evaluaciones de rendimiento y recomendaciones.
Endpoints de API Principales
Autenticación
POST /api/auth/register - Registro de nuevos usuarios.
POST /api/auth/login - Inicio de sesión y entrega de token JWT.
Gestión de Jugadores
GET /api/players - Listado paginado con filtros de posición, equipo y edad
.
GET /api/players/:id - Detalle completo de un jugador.
POST /api/players - Creación de perfiles de jugador.
Análisis y Reportes
GET /api/dashboard/stats - Métricas agregadas para el panel principal
.
POST /api/reports - Creación de reportes de scouting con escala 1-10
.
Pruebas
# Pruebas backend
cd backend && npm test

# Pruebas frontend
cd frontend && npm test
Credenciales de Demostración
Usuario: demo@ase-athletics.com
Contraseña: demo123
