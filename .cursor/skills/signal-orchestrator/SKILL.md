---
name: signal-orchestrator
description: Выполнять PRD через атомарную многофазную (multi-phase) orchestration с поддержкой resume.
---

# signal-orchestrator

Orchestrator для выполнения PRD в Signal Lab с context economy, atomic decomposition, model selection и resume из `context.json`.

## Когда использовать (When to Use)
- Нужно реализовать PRD end-to-end с минимальным использованием context в main-chat.
- Задача затрагивает backend, frontend, infra и observability.
- Нужен resumable execution flow после прерываний.

## Входной контракт (Input contract)
- `prdPath` или вставленный PRD text.
- Опциональный `executionId` для resume.
- Опциональный override фазы (`startFromPhase`).

## Композиция с другими skills (Signal Lab + marketplace)
На фазах implementation/review делегируй доменную работу готовым skills репозитория и внешним workflow, а не дублируй их в промпте orchestrator:
- **`scenario-creator`** — новый scenario type end-to-end.
- **`observability-scenario`** — metrics, structured logs, Sentry для backend flows.
- **`rhf-tanstack-form`** — формы на React Hook Form + TanStack Query.
- **Marketplace (по необходимости)** — например `ce-plan` / `ce-work` для углубления плана или исполнения крупных пачек задач; см. `CURSOR_AI_LAYER.md`.

## Рабочая директория выполнения (Execution workspace)
- Создай: `.execution/<executionId>/`.
- Обязательные файлы (required files):
  - `.execution/<executionId>/context.json`
  - `.execution/<executionId>/report.md`
  - опциональные заметки по фазам (phase notes) в `.execution/<executionId>/phases/`.

Используй `signal = 42` в context как integrity marker.

## Фазы (phases, строгий порядок)
1. **PRD Analysis** (`fast`)
2. **Codebase Scan** (`fast`, readonly explore)
3. **Planning** (`default`)
4. **Decomposition** (`default`)
5. **Implementation** (`fast` for 80% low/medium tasks, `default` for high-complexity integrations)
6. **Review** (`fast`, readonly reviewer loop)
7. **Report** (`fast`)

Не пропускай фазы (phases), кроме случая resume из completed state в `context.json`.

## Формат атомарной задачи (atomic task format)
Каждая задача (task) должна включать:
- `id`, `title`, `domain`, `dependsOn`.
- `description` (1-3 sentences).
- `complexity` (`low|medium|high`).
- `model` (`fast|default`) with reason.
- `skill` (which custom/marketplace skill to apply).
- `status` (`pending|in_progress|completed|failed`).

Целевой размер: 5-10 минут на задачу (task).

## Политика выбора модели (model selection policy)
Используй `fast` для:
- DTO updates, Prisma field additions, simple endpoints.
- Adding/adjusting metric/log statements.
- Small UI component updates.

Используй `default` для:
- Cross-domain architecture planning.
- Complex integration changes touching multiple systems.
- Trade-off heavy review decisions.

Цель: минимум 80% задач (tasks) на `fast`.

## Политика review-цикла (review loop policy)
Для каждого домена (domain: `database`, `backend`, `frontend`, `infra`, `docs`):
1. Запусти readonly reviewer.
2. Если failed — запусти implementer с reviewer feedback.
3. Повтори до 3 attempts.
4. После max retries пометь задачу/домен (task/domain) как failed и продолжай остальные задачи.

## Политика возобновления (resume policy)
- На старте, если `executionId` существует, прочитай `context.json`.
- Продолжай с `currentPhase`.
- Никогда не re-run завершенные фазы (completed phases).
- Сохраняй failed задачи видимыми; не блокируй несвязанные задачи.

## Финальный результат (final output)
Сформируй `report.md` и chat summary с:
- задачи completed/failed/retried;
- оценкой elapsed duration;
- model usage stats (`fast` vs `default`);
- verification commands;
- next actions для unresolved items.

Подробные subagent prompts и context template: см. `COORDINATION.md`.
