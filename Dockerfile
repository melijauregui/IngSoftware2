# Usar Node.js 18 Alpine para una imagen más ligera
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY prisma ./prisma
COPY server ./server
COPY schemas ./schemas
COPY scripts ./scripts
COPY config*.ts ./
COPY tsconfig.json ./
COPY vitest.config.ts ./
COPY vitest.integration.config.ts ./

# Generar cliente de Prisma para Linux
RUN npm run db:generate

# Compilar TypeScript
RUN npm run build

# Copiar el directorio generated al directorio dist
RUN cp -r server/generated dist/server/


# Comando para ejecutar la aplicación
CMD ["npm", "start"]
