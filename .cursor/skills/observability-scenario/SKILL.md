---
name: observability-scenario
description: Инструментировать backend scenario flows через metrics, logs и Sentry.
---

# observability-scenario

## Когда использовать (When to Use)
- Ты добавляешь или изменяешь scenario endpoint в NestJS.
- В scenario path не хватает Prometheus metrics или structured logs.
- `system_error` и `validation_error` не дают ожидаемые observability signals.

## Ожидаемые входные данные (Inputs expected)
- Target endpoint/service paths.
- Затронутые scenario types.
- Желаемое success/error behavior.

## Шаги (Steps)
1. Найди scenario flow в controller + service.
2. Убедись, что каждый run записывает:
   - counter increment (`scenario_runs_total` with labels `type`, `status`);
   - duration histogram (`scenario_run_duration_seconds` with label `type`);
   - structured logs with `scenarioType`, `scenarioId`, `duration`, `error`.
3. Подтверди, что путь `system_error` захватывает exception в Sentry.
4. Подтверди, что путь `validation_error` пишет warn и сохраняет client-safe message.
5. Проверь telemetry walkthrough:
   - запусти scenario через UI/API;
   - проверь `/metrics`;
   - проверь Loki query по `scenarioType`;
   - проверь Grafana panel;
   - проверь Sentry issue.

## Формат результата (Output format)
- File-level change list.
- Запущенные verification commands.
- Remaining gaps (если есть) с точными next steps.
