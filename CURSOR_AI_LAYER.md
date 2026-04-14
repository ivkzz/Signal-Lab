# Cursor AI Layer — Signal Lab

Этот документ описывает AI-слой проекта: правила, навыки, команды и hooks, которые позволяют новому чату Cursor работать предсказуемо и с минимальным ручным онбордингом.

## Что делает AI layer

AI-слой фиксирует инженерные решения проекта в reusable-артефактах:

- `rules` блокируют отклонения от обязательного стека и паттернов.
- `skills` дают пошаговые проектные workflow (не абстрактные советы).
- `commands` ускоряют частые сценарии разработки.
- `hooks` снижают вероятность типовых ошибок после правок.
- `signal-orchestrator` позволяет исполнять PRD по фазам с resume.

Итог: новый чат получает контекст репозитория автоматически и меньше зависит от памяти разработчика.

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
  hooks.json
```

## Как использовать

### 1) Через orchestrator

Используйте `signal-orchestrator`, когда нужно провести PRD через полный pipeline:

1. Analysis (`fast`)
2. Codebase Scan (`fast`)
3. Planning (`default`)
4. Decomposition (`default`)
5. Implementation (`fast/default`)
6. Review (`fast`)
7. Report (`fast`)

Состояние сохраняется в `.execution/<executionId>/context.json`, поэтому после прерывания можно продолжить выполнение без потери прогресса.

### 2) Через commands

- `add-scenario-endpoint` — добавить новый scenario flow с observability.
- `check-observability` — быстро проверить готовность metrics/logs/grafana/sentry.
- `run-signal-orchestrator` — запуск PRD-исполнения с учётом phase/state модели.

### 3) Через domain skills

- `observability-scenario` — для backend instrumentation.
- `scenario-creator` — для добавления новых сценариев.
- `rhf-tanstack-form` — для форм на RHF + TanStack Query.

## Как AI layer помогает Cursor работать без разработчика

- Даёт жёсткие ограничения по стеку и архитектурным решениям.
- Снижает риск регрессий в observability (особенно после backend правок).
- Стандартизирует path "добавить сценарий" и "проверить сигналы".
- Экономит контекст в чате через фазовый orchestrator и файл состояния.
- Делает resume после сбоев воспроизводимым и прозрачным.

## Quick Start (5 минут)

1. Убедиться, что сервисы подняты:
   - `docker compose up -d --build`
2. В новом чате Cursor:
   - запустить `run-signal-orchestrator` с нужным `prdPath`,
   - либо вызвать `check-observability` для аудита сигналов.
3. При изменениях Prisma/Backend учитывать подсказки hooks (`hooks.json`).
4. Перед финализацией пройти `SUBMISSION_CHECKLIST.md`.

## Marketplace skills (рекомендуемый набор)

- `next-best-practices`
- `shadcn-ui`
- `tailwind-design-system`
- `nestjs-best-practices`
- `prisma-orm`
- `docker-expert`
- `postgresql-table-design`

Custom skills покрывают то, чего нет в marketplace: проектно-специфичную observability-модель Signal Lab и orchestrator-процесс с `context.json` + resume.
