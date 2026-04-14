# Cursor AI Layer — Signal Lab

Этот документ описывает AI-слой проекта: правила, навыки, команды и hooks, которые позволяют новому чату Cursor работать предсказуемо и с минимальным ручным онбордингом. Документ также задаёт **режим разработки через оркестратор** и **политику экономии контекста/токенов** без снижения качества.

## Содержание

1. [Что делает AI layer](#что-делает-ai-layer)
2. [Структура артефактов](#структура)
3. [Режим «оркестратор в центре»](#режим-оркестратор-в-центре)
4. [Экономия контекста и токенов](#экономия-контекста-и-токенов)
5. [Маршрутизация: что запускать](#маршрутизация-что-запускать)
6. [Фазы orchestrator и ключи в `context.json`](#фазы-orchestrator-и-ключи-в-contextjson)
7. [Качество при экономии контекста](#качество-при-экономии-контекста)
8. [Как использовать](#как-использовать)
9. [Quick Start](#quick-start-5-минут)
10. [Marketplace skills](#marketplace-skills-рекомендуемый-набор)

## Что делает AI layer

AI-слой фиксирует инженерные решения проекта в reusable-артефактах:

- `rules` блокируют отклонения от обязательного стека и паттернов.
- `skills` дают пошаговые проектные workflow (не абстрактные советы).
- `commands` ускоряют частые сценарии разработки одной короткой инструкцией для агента.
- `hooks` снижают вероятность типовых ошибок после правок.
- `signal-orchestrator` позволяет исполнять PRD по фазам с resume и **вынесением тяжёлого контекста в файлы**, а не в историю чата.

Итог: новый чат получает контекст репозитория автоматически (rules/skills по ситуации) и меньше зависит от памяти разработчика.

## Структура

```text
.cursor/
  rules/
    01-stack-enforcement.mdc
    02-frontend-conventions.mdc
    03-observability-guardrails.mdc
    04-prisma-patterns.mdc
    05-error-handling.mdc
  skills/
    observability-scenario/SKILL.md
    scenario-creator/SKILL.md
    rhf-tanstack-form/SKILL.md
    signal-orchestrator/
      SKILL.md
      COORDINATION.md
      EXAMPLE.md
  commands/
    add-scenario-endpoint.md
    check-observability.md
    run-signal-orchestrator.md
    continue-signal-orchestrator.md
  hooks.json
prds/
  *.md                    # входные PRD для orchestrator
.execution/               # состояние запусков (в .gitignore)
  <executionId>/
    context.json
    report.md
    phases/               # опционально: сырые выводы фаз
```

## Режим «оркестратор в центре»

**Идея:** любая нетривиальная работа (новый PRD, крупный рефакторинг, фича через несколько доменов) ведётся как **один execution** с файловым состоянием, а чат используется для старта, resume и кратких статусов.

### Когда вести разработку только через orchestrator

- PRD лежит или будет лежать в `prds/` (или задан явный путь).
- Задача затрагивает **два и больше** из: backend, frontend, Prisma, observability, docker/infra.
- Нужна **воспроизводимая** история: что сделано, что провалилось, какие команды верификации.

### Когда orchestrator не обязателен (допустим тонкий чат)

- Однофайловый hotfix, опечатка, мелкая правка типов.
- Уже существует готовый атомарный сценарий: например только `check-observability` после точечной правки метрик.

В таких случаях всё равно соблюдай `rules` и при необходимости вызывай доменный skill (`observability-scenario` и т.д.).

### Поток между сессиями Cursor

1. Завершили сессию на фазе `implementation` — в чат **не** переносите полный PRD заново.
2. В новом чате: команда **`continue-signal-orchestrator`** с `executionId` (агент читает только `context.json` и при необходимости `phases/*` и `report.md`).
3. Источник правды по прогрессу — всегда `.execution/<executionId>/context.json`, а не пересказ в чате.

## Экономия контекста и токенов

Ниже правила, которые напрямую снижают размер промптов и дубликатов в истории.

### Делай так

- Указывай **`prdPath`** как путь к файлу в репозитории, а не вставляй весь PRD в чат.
- После первого запуска используй **`executionId`** + команду `continue-signal-orchestrator` вместо повторного описания задачи.
- Проси агента писать развёрнутые результаты фаз в **файлы** (например `.execution/<id>/phases/<phase>.md` или поля `phases.*.result` в `context.json`), а в чат выводить **краткое** резюме: текущая фаза, число задач, блокеры.
- На фазах **Codebase Scan** и **Review** держи режим readonly: меньше diff-шума в контексте, меньше лишних правок.
- Для реализации атомарных задач опирайся на **доменные skills** (`scenario-creator`, `observability-scenario`, `rhf-tanstack-form`) — не дублируй их чеклисты вручную в промпте.
- Для планов/крупных пачек внешних workflow используй marketplace **точечно** (см. раздел Marketplace), не подключая всё подряд в один запрос.

### Не делай так

- Не копируй большие фрагменты кода в чат «для контекста» — указывай пути и символы (`apps/backend/src/...`, `ComponentName`).
- Не повторяй уже записанное в `context.json` / `report.md` в каждом сообщении.
- Не смешивай в одном сообщении несвязанные задачи (лучше новый execution или новая декомпозиция).

### Где живёт «тяжёлый» контекст

| Данные | Где хранить |
|--------|-------------|
| Состояние фаз и задач | `.execution/<id>/context.json` |
| Итог для людей | `.execution/<id>/report.md` |
| Длинные выводы analysis/planning | `.execution/<id>/phases/*.md` или `phases.*.result` |
| Требования | `prds/...md` |

Директория `.execution/` в `.gitignore`: не рассчитывай на перенос состояния между машинами через git; при необходимости копируй `context.json` явно или зафиксируй `executionId` у себя в заметках.

## Маршрутизация: что запускать

| Цель | Первичный вход |
|------|------------------|
| Полный цикл по PRD + resume | `run-signal-orchestrator` / `continue-signal-orchestrator` + skill **`signal-orchestrator`** |
| Новый / изменённый сценарий (endpoint, Prisma, UI, телеметрия) | **`add-scenario-endpoint`** → skills `scenario-creator`, `observability-scenario`, при формах `rhf-tanstack-form` |
| Быстрый аудит метрик / Loki / Grafana / Sentry | **`check-observability`** |
| Только метрики/логи/Sentry вокруг существующего flow | **`observability-scenario`** |
| Только форма + mutation + invalidation | **`rhf-tanstack-form`** |

Детали skill `signal-orchestrator`: `.cursor/skills/signal-orchestrator/SKILL.md`, шаблон состояния и промпты фаз: **`COORDINATION.md`**, примеры: **`EXAMPLE.md`**.

## Фазы orchestrator и ключи в `context.json`

В `context.json` поле `currentPhase` и объекты в `phases` используют **короткие ключи** (нижний регистр). Соответствие человекочитаемым названиям из PRD:

| # | Название в PRD | Ключ `currentPhase` / `phases` |
|---|----------------|--------------------------------|
| 1 | PRD Analysis | `analysis` |
| 2 | Codebase Scan | `codebase` |
| 3 | Planning | `planning` |
| 4 | Decomposition | `decomposition` |
| 5 | Implementation | `implementation` |
| 6 | Review | `review` |
| 7 | Report | `report` |

Опциональный override **`startFromPhase`** (см. command `run-signal-orchestrator`): пропускать уже завершённые фазы нельзя; параметр нужен для особых случаев перезапуска согласованно с политикой resume в `SKILL.md`.

## Качество при экономии контекста

Экономия контекста не отменяет:

- **Правила стека** (`01-stack-enforcement.mdc` и остальные): агент обязан им следовать вне зависимости от фазы.
- **Observability guardrails** при изменении backend endpoints: metrics + structured logs + Sentry — см. `03-observability-guardrails.mdc` и skill `observability-scenario`.
- **Политику моделей** в orchestrator: ~80% атомарных задач на `fast`, `default` для межсистемной архитектуры и тяжёлых trade-off — см. `SKILL.md`.
- **Review loop** до 3 итераций на домен при провале критериев — см. `SKILL.md` и `COORDINATION.md`.
- **Финальную проверку** по `SUBMISSION_CHECKLIST.md` перед сдачей.

Hooks (`.cursor/hooks.json`) остаются страховкой после правок Prisma/backend, даже если основной поток шёл через оркестратор.

## Как использовать

### 1) Через orchestrator

Используйте `signal-orchestrator`, когда нужно провести PRD через полный pipeline:

1. Analysis (`fast`)
2. Codebase Scan (`fast`)
3. Planning (`default`)
4. Decomposition (`default`)
5. Implementation (`fast`/`default`)
6. Review (`fast`)
7. Report (`fast`)

Состояние сохраняется в `.execution/<executionId>/context.json`, поэтому после прерывания можно продолжить выполнение без потери прогресса. Для **нового чата** с минимальным промптом используйте команду **`continue-signal-orchestrator`**.

### 2) Через commands

- `add-scenario-endpoint` — добавить новый scenario flow с observability.
- `check-observability` — быстро проверить готовность metrics/logs/grafana/sentry.
- `run-signal-orchestrator` — запуск PRD-исполнения с учётом phase/state модели.
- `continue-signal-orchestrator` — продолжение по `executionId` без повторения PRD в чате.

### 3) Через domain skills

- `observability-scenario` — для backend instrumentation.
- `scenario-creator` — для добавления новых сценариев.
- `rhf-tanstack-form` — для форм на RHF + TanStack Query.

## Как AI layer помогает Cursor работать без разработчика

- Даёт жёсткие ограничения по стеку и архитектурным решениям.
- Снижает риск регрессий в observability (особенно после backend правок).
- Стандартизирует path «добавить сценарий» и «проверить сигналы».
- Экономит контекст в чате через фазовый orchestrator, файлы `.execution/` и короткие команды resume.
- Делает resume после сбоев воспроизводимым и прозрачным.

## Quick Start (5 минут)

1. Убедиться, что сервисы подняты:
   - `docker compose up -d --build`
2. В новом чате Cursor:
   - запустить `run-signal-orchestrator` с нужным `prdPath`,
   - при продолжении в другом чате — `continue-signal-orchestrator` с `executionId`,
   - либо вызвать `check-observability` для аудита сигналов.
3. При изменениях Prisma/Backend учитывать подсказки hooks (`hooks.json`).
4. Перед финализацией пройти `SUBMISSION_CHECKLIST.md`.

Примеры PRD в репозитории: `prds/001_prd-platform-foundation.md`, `002_prd-observability-demo.md`, `003_prd-cursor-ai-layer.md`, `004_prd-orchestrator.md`.

## Marketplace skills (рекомендуемый набор)

- `next-best-practices`
- `shadcn-ui`
- `tailwind-design-system`
- `frontend-design` (визуальное качество UI — см. `.cursor/rules/02-frontend-conventions.mdc`)
- `nestjs-best-practices`
- `prisma-orm`
- `docker-expert`
- `postgresql-table-design`

Имена навыков должны быть **подключены в Cursor** (Skills / marketplace / плагины): репозиторий задаёт рекомендуемый набор и когда что применять; без установки у пользователя агент не сможет вызвать конкретный skill по имени.

Дополнительно по ситуации (не обязательно тащить всё в каждый чат): **Compound Engineering** (`ce-plan`, `ce-work`, `ce-review`, …), **Exa** (`exa-web-search`, `exa-fetch`) — см. также `SUBMISSION_CHECKLIST.md` для развёрнутой таблицы.

Custom skills покрывают то, чего нет в marketplace: проектно-специфичную observability-модель Signal Lab и orchestrator-процесс с `context.json` + resume.
