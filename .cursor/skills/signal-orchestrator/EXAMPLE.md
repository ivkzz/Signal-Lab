# Пример использования

## Новый запуск (execution)

Prompt:

`Run signal-orchestrator for prds/002_prd-observability-demo.md and create .execution context.`

Ожидаемое поведение:
- Создает `.execution/<timestamp>/context.json`.
- Запускает фазы (phases) 1-7.
- Формирует `.execution/<timestamp>/report.md`.

## Возобновление (resume execution)

Prompt:

`Resume signal-orchestrator with executionId 2026-04-13-15-20.`

Ожидаемое поведение:
- Загружает `.execution/2026-04-13-15-20/context.json`.
- Стартует с `currentPhase`.
- Пропускает завершенные фазы (completed phases).
- Обновляет финальный report.
