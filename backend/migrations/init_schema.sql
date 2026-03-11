-- Habilitar extensión para UUID si prefieres IDs no secuenciales (opcional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios (Autenticación) [1, 3]
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla Central de Jugadores [1]
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    position VARCHAR(50),
    age INTEGER,
    team VARCHAR(100),
    nationality VARCHAR(100),
    height DECIMAL(5,2), -- en cm o m
    weight DECIMAL(5,2), -- en kg
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    appearances INTEGER DEFAULT 0,
    contract_salary DECIMAL(15,2),
    contract_end DATE,
    market_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Atributos (Relación 1:1 o 1:N opcional) [1, 4]
-- Se usa la escala estandarizada de 1-10 requerida [4]
CREATE TABLE player_attributes (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    pace INTEGER CHECK (pace BETWEEN 1 AND 10),
    shooting INTEGER CHECK (shooting BETWEEN 1 AND 10),
    passing INTEGER CHECK (passing BETWEEN 1 AND 10),
    defending INTEGER CHECK (defending BETWEEN 1 AND 10),
    dribbling INTEGER CHECK (dribbling BETWEEN 1 AND 10),
    physicality INTEGER CHECK (physicality BETWEEN 1 AND 10)
);

-- 4. Tabla de Reportes de Scouting [1, 5]
CREATE TABLE scout_reports (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    scout_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    match_date DATE,
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
    strengths TEXT,
    weaknesses TEXT,
    recommendation TEXT, -- Fichar, monitorear, pasar [5]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexación básica para rendimiento de búsqueda [2, 6]
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_scout_reports_player ON scout_reports(player_id);