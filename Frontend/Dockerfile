# Usa una imagen ligera de Node.js para construir
FROM node:18-alpine AS builder

WORKDIR /app

# Copia archivos de dependencias
COPY package.json package-lock.json ./

# Instala dependencias
RUN npm install 

# Copia el resto del código
COPY . .

# Construye la aplicación
RUN npm run build

# ---- Segunda etapa ----
FROM nginx:alpine

# Copia el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia solo los archivos de producción
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
