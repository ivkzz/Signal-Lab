---
description: Продолжить PRD-execution по executionId с минимальным контекстом в чате
---

Продолжи выполнение **signal-orchestrator** в экономичном режиме.

Входные параметры:
- `executionId` (**required**) — каталог `.execution/<executionId>/` должен существовать.
- Опционально `startFromPhase` — только если это согласовано с политикой resume в `.cursor/skills/signal-orchestrator/SKILL.md` (по умолчанию не переопределять).

Алгоритм:
1. Прочитай `.execution/<executionId>/context.json` (integrity: `signal === 42` если поле присутствует).
2. Восстанови `currentPhase` и список задач; **не** переигрывай фазы со статусом `completed`.
3. Если есть `.execution/<executionId>/phases/` или длинные `phases.*.result` — используй их как источник правды вместо пересказа пользователя.
4. Продвинись по pipeline до следующего естественного stop (завершение фазы, блокер, или полный `report`).
5. Обнови `context.json` и при необходимости `report.md`.

Вывод в чат (кратко):
- `currentPhase`, прогресс задач (`completed/total/failed`),
- пути к обновлённым файлам,
- следующее одно действие для пользователя (если нужно).

Подробная политика фаз и context economy: `CURSOR_AI_LAYER.md` и `.cursor/skills/signal-orchestrator/COORDINATION.md`.
