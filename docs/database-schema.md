# Esquema de Base de Datos - ASE Athletics

Este documento describe el esquema de la base de datos PostgreSQL utilizada por la aplicación. El script SQL de creación se encuentra en **`backend/migrations/init_schema.sql`**.

---

## Diagrama de relaciones

```
users (1) ──────────< scout_reports (N)   scout_reports (N) >────────── (1) players
                                                                              │
                                                                              │ 1:1
                                                                              ▼
                                                                     player_attributes
```

- **users**: usuarios (ojeadores) que se autentican y pueden crear reportes.
- **players**: jugadores profesionales en la base de datos.
- **player_attributes**: atributos 1–10 por jugador (ritmo, tiro, pase, etc.), relación 1:1 con `players`.
- **scout_reports**: reportes de scouting asociados a un jugador y opcionalmente a un usuario (scout).

---

## Tablas

### 1. `users` (Autenticación)

Almacena los usuarios que pueden iniciar sesión y crear reportes.

| Columna        | Tipo                     | Restricciones | Descripción                    |
|----------------|--------------------------|---------------|--------------------------------|
| id             | SERIAL                   | PRIMARY KEY   | Identificador único            |
| email          | VARCHAR(255)             | UNIQUE, NOT NULL | Email de acceso            |
| password_hash  | TEXT                     | NOT NULL      | Contraseña hasheada (bcrypt)   |
| name           | VARCHAR(100)            | NOT NULL      | Nombre del usuario             |
| created_at     | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Fecha de registro              |

---

### 2. `players` (Jugadores)

Tabla central de jugadores profesionales.

| Columna         | Tipo                     | Restricciones | Descripción                    |
|-----------------|--------------------------|---------------|--------------------------------|
| id              | SERIAL                   | PRIMARY KEY   | Identificador único            |
| name            | VARCHAR(150)             | NOT NULL      | Nombre del jugador             |
| position        | VARCHAR(50)              | —             | Posición (Portero, Defensa, etc.) |
| age             | INTEGER                  | —             | Edad                           |
| team            | VARCHAR(100)             | —             | Equipo                         |
| nationality     | VARCHAR(100)             | —             | Nacionalidad                   |
| height          | DECIMAL(5,2)             | —             | Altura (cm)                    |
| weight          | DECIMAL(5,2)             | —             | Peso (kg)                      |
| goals           | INTEGER                  | DEFAULT 0     | Goles                          |
| assists         | INTEGER                  | DEFAULT 0     | Asistencias                    |
| appearances     | INTEGER                  | DEFAULT 0     | Partidos jugados               |
| contract_salary | DECIMAL(15,2)            | —             | Salario (€)                    |
| contract_end    | DATE                     | —             | Fin de contrato                |
| market_value    | DECIMAL(15,2)            | —             | Valor de mercado (€)          |
| created_at      | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Alta en sistema                |
| updated_at      | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Última actualización           |

**Índices:** `idx_players_name`, `idx_players_team`, `idx_players_position` (búsquedas y filtros).

---

### 3. `player_attributes` (Atributos por jugador)

Atributos en escala 1–10. Relación **1:1** con `players`; se elimina en cascada al borrar el jugador.

| Columna    | Tipo    | Restricciones                    | Descripción   |
|------------|---------|----------------------------------|---------------|
| player_id  | INTEGER | PRIMARY KEY, FK → players(id) ON DELETE CASCADE | Jugador |
| pace       | INTEGER | CHECK (1–10)                    | Ritmo         |
| shooting   | INTEGER | CHECK (1–10)                    | Tiro          |
| passing    | INTEGER | CHECK (1–10)                    | Pase          |
| defending  | INTEGER | CHECK (1–10)                    | Defensa       |
| dribbling  | INTEGER | CHECK (1–10)                    | Regate        |
| physicality | INTEGER | CHECK (1–10)                  | Físico        |

---

### 4. `scout_reports` (Reportes de scouting)

Reportes de evaluación por partido/jugador. Si se elimina un jugador, sus reportes se eliminan en cascada.

| Columna         | Tipo                     | Restricciones                    | Descripción                          |
|-----------------|--------------------------|----------------------------------|--------------------------------------|
| id              | SERIAL                   | PRIMARY KEY                      | Identificador único                   |
| player_id       | INTEGER                  | NOT NULL, FK → players(id) ON DELETE CASCADE | Jugador evaluado              |
| scout_id        | INTEGER                  | FK → users(id) ON DELETE SET NULL | Usuario que crea el reporte (opcional) |
| match_date      | DATE                     | —                                | Fecha del partido                    |
| overall_rating  | INTEGER                  | CHECK (1–10)                     | Valoración global 1–10               |
| strengths       | TEXT                     | —                                | Fortalezas observadas                |
| weaknesses      | TEXT                     | —                                | Debilidades                          |
| recommendation  | TEXT                     | —                                | Fichar / Monitorear / Pasar (+ notas) |
| created_at      | TIMESTAMP WITH TIME ZONE | DEFAULT now()                    | Fecha de creación                    |

**Índice:** `idx_scout_reports_player` en `player_id` para listados y filtros.

---

## Integridad referencial y cascadas

- **Eliminar jugador:** se eliminan sus filas en `player_attributes` y en `scout_reports` (ON DELETE CASCADE).
- **Eliminar usuario:** los `scout_reports` con ese `scout_id` pasan a `scout_id = NULL` (ON DELETE SET NULL).

---

## Cómo aplicar el esquema

Desde la raíz del backend:

```bash
npm run db:migrate
```

Utiliza el archivo `backend/migrations/init_schema.sql`. Los datos iniciales (jugadores y reportes de ejemplo) se cargan con:

```bash
npm run db:seed
```
