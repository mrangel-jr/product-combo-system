FROM node:20-alpine3.20 AS builder

RUN apk update && apk upgrade

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências com --legacy-peer-deps para resolver conflitos
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build --legacy-peer-deps

# Estágio de produção
FROM node:20-alpine3.20 AS production

RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção com --legacy-peer-deps
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Copiar arquivos buildados
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

RUN chown -R frontend:nodejs /app
USER frontend

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
