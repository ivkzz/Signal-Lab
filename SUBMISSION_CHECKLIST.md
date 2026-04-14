# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `remote origin не задан локально (git remote отсутствует)`
- **Ветка**: `main`
- **Время работы** (приблизительно): `8` часов

---

## Запуск

```bash
# Команда запуска:
docker compose up -d --build

# Команда проверки:
docker compose ps
curl http://localhost:3001/api/health
curl http://localhost:3001/metrics

# Команда остановки:
docker compose down
```

**Предусловия**: Docker Engine + Docker Compose plugin. Порты по умолчанию как в **`.env.example`**: **`FRONTEND_PORT=3000`**, **`PORT=3001`**, **`POSTGRES_PORT=5432`**, **`PROMETHEUS_PORT=9090`**, **`GRAFANA_PORT=3100`**, **`LOKI_HOST_PORT=3101`** (свободны на хосте одновременно).

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ✅ | `apps/frontend/app/layout.tsx`, `apps/frontend/app/page.tsx` |
| shadcn/ui | ✅ | `apps/frontend/components/ui/button.tsx`, `apps/frontend/components/ui/card.tsx`, `apps/frontend/components/ui/input.tsx`, `apps/frontend/components/ui/badge.tsx` |
| Tailwind CSS | ✅ | `apps/frontend/app/globals.css`, классы в `apps/frontend/app/page.tsx` |
| TanStack Query | ✅ | `apps/frontend/app/providers.tsx`, `apps/frontend/app/page.tsx` |
| React Hook Form | ✅ | `apps/frontend/app/page.tsx` (`useForm` + submit handling) |
| NestJS | ✅ | `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts` |
| PostgreSQL | ✅ | `docker-compose.yml` service `postgres` |
| Prisma | ✅ | `prisma/schema.prisma`, `apps/backend/src/prisma/*` |
| Sentry | ✅ | `apps/backend/src/main.ts` (`Sentry.init`) |
| Prometheus | ✅ | `docker-compose.yml`, `docker/prometheus/prometheus.yml` |
| Grafana | ✅ | `docker-compose.yml`, `docker/grafana/provisioning/*` |
| Loki | ✅ | `docker-compose.yml`, `docker/loki/loki-config.yml`, `docker/promtail/promtail-config.yml` |

---

## Observability Verification

URL ниже — порты по умолчанию из `.env.example` (`3001` / `9090` / `3100` / `3101`). Другие порты — в корневом `.env`.

| Сигнал | Как проверить | Где смотреть |
|--------|---------------|--------------|
| Метрики | Запустить `success`, `validation_error`, `system_error` (UI или `POST /api/scenarios/run`) | `http://localhost:3001/metrics` — `scenario_runs_total`, `scenario_run_duration_seconds`, `http_requests_total` и labels `type`, `status`, `method`, `path`, `status_code`. UI Prometheus: `http://localhost:9090` |
| Grafana | Несколько запусков сценариев, открыть дашборд | `http://localhost:3100` → Signal Lab Dashboard |
| Loki | Grafana → Explore → Loki | Запрос `{app="signal-lab"}`; в теле логов — `scenarioType`, `scenarioId`, `duration`, при ошибке — `error`. С хоста: `http://localhost:3101/ready` |
| Sentry | Сценарий `system_error` | Событие в Sentry при заданном `SENTRY_DSN`; без DSN — N/A |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `observability-scenario` | Добавляет/проверяет метрики, structured logs, Sentry для scenario flow |
| 2 | `scenario-creator` | Создание нового типа сценария end-to-end (backend + frontend + observability) |
| 3 | `rhf-tanstack-form` | Шаблон production-формы на RHF + TanStack Query |
| 4 | `signal-orchestrator` | Выполнение PRD по фазам с atomic tasks, model split и resume |

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `add-scenario-endpoint` | Добавляет/расширяет endpoint сценария с observability |
| 2 | `check-observability` | Аудит метрик, логов, Grafana и Sentry |
| 3 | `run-signal-orchestrator` | Запускает orchestrator по PRD с сохранением context |
| 4 | `continue-signal-orchestrator` | Resume по `executionId` с минимальным промптом в новом чате |

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `prisma-schema-guard` | После изменений schema напоминает про миграции и regenerate типов |
| 2 | `backend-observability-reminder` | После правок backend не даёт забыть metrics/logs/Sentry |
| 3 | `pre-commit-secrets-check` | Перед коммитом ловит риск утечки секретов в `.env*` |

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `01-stack-enforcement.mdc` | Жёсткие ограничения по стеку и запретам |
| 2 | `02-frontend-conventions.mdc` | RHF/TanStack/shadcn/Tailwind паттерны frontend |
| 3 | `03-observability-guardrails.mdc` | Naming и guardrails для metrics/logs/Sentry |
| 4 | `04-prisma-patterns.mdc` | Паттерны schema/migration/query для Prisma |
| 5 | `05-error-handling.mdc` | Стандарты обработки ошибок backend/frontend |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | `next-best-practices` | App Router, границы SSR/CSR, production-паттерны Next.js |
| 2 | `shadcn-ui` | Сборка и доработка UI на общих примитивах shadcn |
| 3 | `tailwind-design-system` | Utility-паттерны, токены и консистентная стилизация |
| 4 | `nestjs-best-practices` | Модули, DI, обработка ошибок и структура NestJS |
| 5 | `prisma-orm` | Миграции, типобезопасные запросы, соглашения по schema |
| 6 | `docker-expert` | Compose, локальное окружение и отладка контейнеров |
| 7 | `postgresql-table-design` | Моделирование таблиц, индексы и качество схемы БД |
| 8 | **Compound Engineering** (`ce-plan`, `ce-work`, `ce-review`, `document-review`, `frontend-design`, `feature-video`, `agent-browser`, …) | Планирование/ревью документов, качественный UI, демо-видео, браузерная автоматизация |
| 9 | **Exa** (`exa-web-search`, `exa-fetch`, …) | Актуальные ответы из веба и вытягивание контента по URL |

**Что закрыли custom skills, чего нет в marketplace:** проектно-специфичная observability-схема Signal Lab, сценарный workflow (`scenario-creator`) и PRD-orchestrator с `context.json`/resume политикой.

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/signal-orchestrator/SKILL.md`
- **Путь к context file** (пример): `.execution/<executionId>/context.json`
- **Сколько фаз**: `7`
- **Какие задачи для fast model**: Prisma/DTO/простые endpoint-изменения, метрики/логи, небольшие UI правки (целевой охват 80%+ задач)
- **Поддерживает resume**: да

---

## Скриншоты / видео

- [✅] UI приложения
- [✅] Grafana dashboard с данными
- [✅] Loki logs
- [✅] Sentry error

(Приложи файлы или ссылки ниже)

- `loki-logs.mp4`
- `ui-demo.mp4`
- `sentry-error.png`
- `grafana.png`

---

## Что не успел и что сделал бы первым при +4 часах

- Подумал бы над дополнительными **hooks** (где они реально экономят ошибки) и чуть сильнее оформил бы **оркестратор** под resume — без заранее зафиксированного списка файлов или сценариев. Свои скилы и правила.

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил, а какие заменил custom — и почему?
4. Какие hooks реально снижают ошибки в повседневной работе?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?
