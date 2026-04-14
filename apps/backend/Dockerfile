FROM node:22-alpine AS base
RUN apk add --no-cache wget

# ── Build stage ────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

# Копируем package.json и устанавливаем ВСЕ зависимости (включая devDeps: tsc, nest-cli, prisma)
COPY apps/backend/package*.json ./apps/backend/
RUN cd apps/backend && npm ci --no-audit --no-fund

# Prisma 7 resolve: создаём симлинк /app/node_modules -> /app/apps/backend/node_modules
# Это позволяет Prisma найти @prisma/client при обходе вверх от /app/prisma/schema.prisma
RUN ln -s /app/apps/backend/node_modules /app/node_modules

# Копируем prisma схему из корня проекта
COPY prisma/ ./prisma/

# Копируем исходники и конфиги бэкенда
COPY apps/backend/prisma.config.ts ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/src/ ./apps/backend/src/

# Генерируем Prisma Client (Prisma 7: URL не нужен для generate)
WORKDIR /app/apps/backend
RUN npx prisma generate

# Собираем NestJS
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app

# Копируем артефакты сборки
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/package*.json ./apps/backend/

# Prisma config нужен для migrate deploy в рантайме
COPY --from=builder /app/apps/backend/prisma.config.ts ./apps/backend/

# Prisma схема и миграции нужны для migrate deploy
COPY prisma/ ./prisma/

# Симлинк для рантайма (migrate deploy также нуждается в node_modules через корень)
RUN ln -s /app/apps/backend/node_modules /app/node_modules

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    sed -i 's/\r//' /entrypoint.sh

WORKDIR /app/apps/backend

EXPOSE 3001

CMD ["/bin/sh", "/entrypoint.sh", "backend"]
