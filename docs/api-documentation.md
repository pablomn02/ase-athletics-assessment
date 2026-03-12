## API ASE Athletics - Documentación Backend

Todas las rutas de la API responden en JSON.

- **Base URL (desarrollo)**: `http://localhost:5000`
- **Formato de autenticación** (cuando aplica):  
  `Authorization: Bearer <token_jwt>`

---

## Autenticación

### POST /api/auth/register

- **Descripción**: Registro de un nuevo usuario (ojeador).
- **Autenticación**: No requerida.
- **Body (JSON)**:
  - `name` (string, requerido, min 2, max 100)
  - `email` (string, requerido, formato email)
  - `password` (string, requerido, min 6, max 128)
- **Ejemplo de solicitud**:

```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Pablo",
  "email": "pablo@test.com",
  "password": "123456"
}
```

- **Ejemplo de respuesta (201)**:

```json
{
  "ok": true,
  "message": "Usuario registrado correctamente",
  "user": {
    "id": 1,
    "name": "Pablo",
    "email": "pablo@test.com"
  }
}
```

---

### POST /api/auth/login

- **Descripción**: Inicio de sesión y obtención de token JWT.
- **Autenticación**: No requerida.
- **Body (JSON)**:
  - `email` (string, requerido, formato email)
  - `password` (string, requerido, min 6)
- **Ejemplo de solicitud**:

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "pablo@test.com",
  "password": "123456"
}
```

- **Ejemplo de respuesta (200)**:

```json
{
  "ok": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /api/auth/logout

- **Descripción**: Logout lógico de la sesión. En JWT, el cliente debe borrar el token.
- **Autenticación**: Recomendado enviar el token, pero la lógica es stateless.
- **Body**: Sin body.
- **Ejemplo de solicitud**:

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

- **Ejemplo de respuesta (200)**:

```json
{
  "ok": true,
  "message": "Logout exitoso. Por favor elimina el token en el cliente."
}
```

---

## Gestión de Jugadores

### GET /api/players

- **Descripción**: Lista paginada de jugadores con filtros opcionales.
- **Autenticación**: Requerida (`Authorization: Bearer <token>`).
- **Parámetros de query**:
  - `page` (number, opcional, por defecto 1)
  - `limit` (number, opcional, por defecto 20)
  - `position` (string, opcional)
  - `team` (string, opcional)
  - `minAge` (number, opcional)
  - `maxAge` (number, opcional)
- **Ejemplo de solicitud**:

```http
GET /api/players?page=1&limit=10&position=Forward
Authorization: Bearer <token>
```

- **Ejemplo de respuesta (200)**:

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Jugador 1",
      "position": "Forward",
      "age": 24,
      "team": "Equipo Demo",
      "nationality": "España",
      "height": 1.80,
      "weight": 75,
      "goals": 10,
      "assists": 5,
      "appearances": 30,
      "contract_salary": 1000000,
      "contract_end": "2027-06-30",
      "market_value": 15000000,
      "pace": 8,
      "shooting": 9,
      "passing": 7,
      "defending": 5,
      "dribbling": 8,
      "physicality": 7
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 120,
    "totalPages": 12
  }
}
```

---

### GET /api/players/:id

- **Descripción**: Obtiene el detalle completo de un jugador por ID.
- **Autenticación**: Requerida.
- **Parámetros de ruta**:
  - `id` (number, requerido)
- **Ejemplo de solicitud**:

```http
GET /api/players/1
Authorization: Bearer <token>
```

- **Ejemplo de respuesta (200)**: igual estructura que un elemento de `data` en `GET /api/players`.

---

### POST /api/players

- **Descripción**: Crea un nuevo jugador con sus métricas básicas y atributos opcionales.
- **Autenticación**: Requerida.
- **Body (JSON)**:
  - `name` (string, requerido)
  - `position` (string, opcional)
  - `age` (number, opcional)
  - `team` (string, opcional)
  - `nationality` (string, opcional)
  - `height` (number, opcional)
  - `weight` (number, opcional)
  - `goals`, `assists`, `appearances` (number, opcional)
  - `contract_salary` (number, opcional)
  - `contract_end` (string fecha ISO, opcional)
  - `market_value` (number, opcional)
  - `attributes` (objeto opcional con escala 1–10):
    - `pace`, `shooting`, `passing`, `defending`, `dribbling`, `physicality`
- **Ejemplo de solicitud**:

```json
POST /api/players
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jugador Demo",
  "position": "Midfielder",
  "age": 25,
  "team": "Equipo Demo",
  "nationality": "España",
  "height": 1.8,
  "weight": 75,
  "goals": 5,
  "assists": 7,
  "appearances": 20,
  "contract_salary": 1000000,
  "contract_end": "2027-06-30",
  "market_value": 15000000,
  "attributes": {
    "pace": 8,
    "shooting": 7,
    "passing": 9,
    "defending": 6,
    "dribbling": 8,
    "physicality": 7
  }
}
```

- **Ejemplo de respuesta (201)**:

```json
{
  "ok": true,
  "message": "Jugador creado correctamente",
  "data": {
    "id": 201,
    "name": "Jugador Demo",
    "position": "Midfielder",
    "age": 25,
    "team": "Equipo Demo",
    "nationality": "España",
    "height": 1.8,
    "weight": 75,
    "goals": 5,
    "assists": 7,
    "appearances": 20,
    "contract_salary": 1000000,
    "contract_end": "2027-06-30",
    "market_value": 15000000,
    "created_at": "2024-03-10T10:00:00.000Z",
    "updated_at": "2024-03-10T10:00:00.000Z"
  }
}
```

---

### PUT /api/players/:id

- **Descripción**: Actualiza un jugador existente (mismas reglas de validación que `POST /api/players`).
- **Autenticación**: Requerida.
- **Parámetros de ruta**:
  - `id` (number, requerido)
- **Body (JSON)**: Igual estructura que `POST /api/players`.

---

### DELETE /api/players/:id

- **Descripción**: Elimina un jugador existente y sus relaciones (atributos y reportes asociados).
- **Autenticación**: Requerida.
- **Parámetros de ruta**:
  - `id` (number, requerido)
- **Ejemplo de solicitud**:

```http
DELETE /api/players/1
Authorization: Bearer <token>
```

- **Ejemplo de respuesta (204)**: sin contenido.

---

### GET /api/players/search

- **Descripción**: Búsqueda de jugadores por nombre, equipo o nacionalidad (búsqueda global de texto).
- **Autenticación**: Requerida.
- **Parámetros de query**:
  - `q` (string, requerido) – término de búsqueda.
  - `page` (number, opcional)
  - `limit` (number, opcional)
- **Ejemplo de solicitud**:

```http
GET /api/players/search?q=Messi&page=1&limit=10
Authorization: Bearer <token>
```

---

## Dashboard de Análisis

### GET /api/dashboard/stats

- **Descripción**: Devuelve métricas agregadas para el panel de análisis (total de jugadores, edad promedio, rankings y desgloses).
- **Autenticación**: Requerida.
- **Parámetros**: Ninguno.
- **Ejemplo de respuesta (200)**:

```json
{
  "ok": true,
  "data": {
    "totalPlayers": 200,
    "avgAge": "24.35",
    "topByGoals": [
      { "id": 1, "name": "Jugador 1", "team": "Equipo A", "goals": 20 }
    ],
    "topByAssists": [
      { "id": 2, "name": "Jugador 2", "team": "Equipo B", "assists": 15 }
    ],
    "byPosition": [
      { "position": "Forward", "count": 50 }
    ],
    "byTeam": [
      { "team": "Equipo A", "count": 10 }
    ]
  }
}
```

---

## Reportes de Scouting

### GET /api/reports

- **Descripción**: Lista paginada de reportes de scouting con filtros por jugador o scout.
- **Autenticación**: Requerida.
- **Parámetros de query**:
  - `page` (number, opcional, por defecto 1)
  - `limit` (number, opcional, por defecto 20)
  - `playerId` (number, opcional)
  - `scoutId` (number, opcional)
- **Ejemplo de solicitud**:

```http
GET /api/reports?page=1&limit=10&playerId=1
Authorization: Bearer <token>
```

---

### POST /api/reports

- **Descripción**: Crea un nuevo reporte de scouting asociado a un jugador.
- **Autenticación**: Requerida.
- **Body (JSON)**:
  - `player_id` (number, requerido)
  - `scout_id` (number, opcional)
  - `match_date` (string fecha ISO, opcional)
  - `overall_rating` (integer 1–10, requerido)
  - `strengths` (string, opcional)
  - `weaknesses` (string, opcional)
  - `recommendation` (string, opcional)
- **Ejemplo de solicitud**:

```json
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "player_id": 1,
  "scout_id": 1,
  "match_date": "2024-03-10",
  "overall_rating": 8,
  "strengths": "Gran visión de juego, buen pase largo",
  "weaknesses": "Velocidad limitada en transición defensiva",
  "recommendation": "Fichar"
}
```

---

### PUT /api/reports/:id

- **Descripción**: Actualiza un reporte de scouting existente.
- **Autenticación**: Requerida.
- **Parámetros de ruta**:
  - `id` (number, requerido)
- **Body (JSON)**: misma estructura que `POST /api/reports`.

---

### DELETE /api/reports/:id

- **Descripción**: Elimina un reporte de scouting existente.
- **Autenticación**: Requerida.
- **Parámetros de ruta**:
  - `id` (number, requerido)
- **Ejemplo de solicitud**:

```http
DELETE /api/reports/1
Authorization: Bearer <token>
```

---

## Salud del Servicio

### GET /health

- **Descripción**: Endpoint simple para verificar que la API está levantada.
- **Autenticación**: No requerida.
- **Ejemplo de respuesta (200)**:

```json
{
  "ok": true
}
```

