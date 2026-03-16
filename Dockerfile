FROM node:20-alpine
WORKDIR /app

# Como ya estamos en 'backend', el package.json está en la raíz actual (.)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiamos todo lo que hay en la carpeta actual
COPY . .

# Si la carpeta 'data' la moviste dentro de 'backend', déjala así:
# COPY data ./data 

EXPOSE 5000

CMD node scripts/wait-and-migrate.js && \
    (node seeds/seed_data.js 2>/dev/null || true) && \
    node src/index.js