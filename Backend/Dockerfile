FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Primero las dependencias (se cachean mientras package*.json no cambie).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# El proceso no corre como root.
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 4000
CMD ["node", "src/server.js"]
