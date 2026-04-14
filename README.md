# Signal Lab

Playground для observability: Next.js (App Router) + NestJS + PostgreSQL (Prisma). Запуск сценариев даёт метрики (Prometheus), логи (Loki), ошибки (Sentry) и дашборд в Grafana.

## Развернуть за ~1 минуту (команды)

**Нужно:** Docker Engine и плагин Compose; свободные порты из таблицы ниже.

```bash
cp .env.example .env - добавить свой SENTRY_DSN
docker compose up -d
```

**Остановка:** `docker compose down`

## Порты по умолчанию (из `.env.example`)

| Сервис         | Базовый URL (порты по умолчанию) | Переменная        |
|----------------|----------------------------------|-------------------|
| UI (Next.js)   | http://localhost:3000          | `FRONTEND_PORT`   |
| Backend (API)  | http://localhost:3001          | `PORT`            |
| PostgreSQL     | localhost:5432                 | `POSTGRES_PORT`   |
| Prometheus UI  | http://localhost:9090        | `PROMETHEUS_PORT` |
| Grafana        | http://localhost:3100        | `GRAFANA_PORT`    |
| Loki           | http://localhost:3101/ready    | `LOKI_HOST_PORT`  |

Grafana: логин `admin`, пароль `admin` в `.env` (в `.env.example` по умолчанию `admin`).

1. Открой UI → форма **Run Scenario** (типы: `success`, `validation_error`, `system_error`, `slow_request`, опционально **`teapot`** — HTTP 418, см. PRD 002).
2. Запусти **`system_error`** — в истории красный статус; при заданном **`SENTRY_DSN`** событие уходит в Sentry.
3. `http://localhost:3001/metrics` — счётчики вроде `scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total`.
4. Grafana → **Signal Lab Dashboard** (Prometheus datasource).
5. Grafana → Explore → Loki → запрос **`{app="signal-lab"}`**; в логах ключи `scenarioType`, `scenarioId`, `duration`, при ошибке — `error`.

Без `SENTRY_DSN` шаг с Sentry помечайте как N/A (см. `.env.example`).

## Переменные окружения

Корневой **`.env`** (шаблон — **`.env.example`**) читает **Docker Compose** и **Next.js** (`loadEnvConfig` в `apps/frontend/next.config.ts`). Порты и `NEXT_PUBLIC_*` должны совпадать с пробросом из compose. В образ фронта файл `.env` с хоста не копируется — для контейнеров значения задаёт compose из того же корневого `.env`.

## Hot reload (опционально)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

## Cursor AI и пакет PRD

- Полное описание rules / skills / commands / hooks / marketplace: **`CURSOR_AI_LAYER.md`**.
- Оркестратор PRD (фазы, `context.json`, resume): **`.cursor/skills/signal-orchestrator/SKILL.md`** (PRD 004).
- Требования по фичам и стеку: **`prds/`** (`001` — платформа, `002` — observability, `003` — AI-слой, `004` — orchestrator).
