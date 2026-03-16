FROM node:20-alpine
WORKDIR /app

# 1. Copiamos los archivos desde la subcarpeta backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# 2. Copiamos el resto del backend a /app (incluye backend/data con los JSON del seed)
COPY backend/ .

EXPOSE 5000

# Un solo proceso: migración → seed → API (evita que el contenedor pare entre pasos)
CMD ["node", "scripts/entrypoint.js"]