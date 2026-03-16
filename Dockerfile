FROM node:20-alpine
WORKDIR /app

# Usamos la ruta completa desde la raíz del proyecto
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copiamos el contenido de backend y la carpeta data
COPY backend/ .
COPY data /app/data

EXPOSE 5000

CMD node scripts/wait-and-migrate.js && \
    (node seeds/seed_data.js 2>/dev/null || true) && \
    node src/index.js