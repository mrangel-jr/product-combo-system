# Multi-stage build para maior segurança e menor tamanho
FROM node:20-alpine3.20 AS builder

# Atualizar packages do Alpine
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine3.20 AS production

# Atualizar packages do Alpine
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

WORKDIR /app

# Copiar package.json para instalar apenas dependências de produção
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicação buildada do estágio anterior
COPY --from=builder /app/dist ./dist

# Alterar proprietário para usuário não-root
RUN chown -R backend:nodejs /app
USER backend

EXPOSE 3001

# Usar dumb-init para melhor handling de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
