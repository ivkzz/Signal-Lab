FROM node:22-alpine AS base
RUN apk add --no-cache wget

# ── Build stage ────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app/apps/frontend

# Copy package files and install deps
COPY apps/frontend/package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source files
COPY apps/frontend/ ./

# Каталог для Next `envDir` (= монорепо root, см. next.config.ts). В образе .env с хоста нет (.dockerignore).
RUN mkdir -p /app

# Build Next.js (standalone output for production)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_GRAFANA_URL=http://localhost:3100
ENV NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090
ENV NEXT_PUBLIC_BACKEND_METRICS_URL=http://localhost:3001/metrics
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app/apps/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Каталог `envDir` из next.config (монорепо root); в рантайме `.env` из образа не копируем — переменные из compose.
RUN mkdir -p /app

# Copy built output and deps
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/package*.json ./
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/next.config.ts ./next.config.ts

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    sed -i 's/\r//' /entrypoint.sh

EXPOSE 3000

CMD ["/bin/sh", "/entrypoint.sh", "frontend"]
