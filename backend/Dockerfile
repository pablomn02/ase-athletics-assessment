# Construir desde la raíz del repo: docker-compose usa context: . y dockerfile: backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ .
# El seed (seeds/seed_data.js) busca ../../data → en el contenedor /data
COPY data /data

EXPOSE 5000

# Esperar a Postgres, ejecutar migración, arrancar API
CMD node scripts/wait-and-migrate.js && \
    (node seeds/seed_data.js 2>/dev/null || true) && \
    node src/index.js
