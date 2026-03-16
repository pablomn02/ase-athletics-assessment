FROM node:20-alpine
WORKDIR /app

# 1. Copiamos los archivos desde la subcarpeta backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# 2. Copiamos el resto del backend a /app (incluye backend/data con los JSON del seed)
COPY backend/ .

EXPOSE 5000

# El comando de arranque
CMD node scripts/wait-and-migrate.js && \
    (node seeds/seed_data.js 2>/dev/null || true) && \
    node src/index.js