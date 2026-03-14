# Construir desde la raíz del repo: docker-compose usa context: . y dockerfile: frontend/Dockerfile
# Fase 1: build de la app React
FROM node:20-alpine AS builder

WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Fase 2: servir con nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
