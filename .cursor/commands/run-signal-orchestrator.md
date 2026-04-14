---
description: Выполнить PRD через skill signal-orchestrator
---

Используй skill **`signal-orchestrator`** (`.cursor/skills/signal-orchestrator/SKILL.md`), чтобы выполнить PRD с resumable context.

Входные параметры:
- `prdPath` (**required** для нового execution) — путь к файлу в репо (предпочтительно), не вставляй полный текст PRD в чат.
- `executionId` (optional) — для resume существующего запуска; если не задан, создай новый каталог `.execution/<executionId>/`.
- `startFromPhase` (optional) — см. политику в `SKILL.md` (не используй для «перепрыгивания» уже завершённых фаз при обычном resume).

Поток выполнения (flow):
1. Create or load `.execution/<executionId>/context.json`.
2. Выполни фазы строго по порядку: `analysis` → `codebase` → `planning` → `decomposition` → `implementation` → `review` → `report` (ключи как в `COORDINATION.md`).
3. Тяжёлые выводы фаз сохраняй в файлы (`.execution/<executionId>/phases/` или поля `phases.*.result`); в чат — краткое резюме.
4. Используй `fast` для 80%+ атомарных задач, `default` — для сложных integration/planning задач.
5. Save final report to `.execution/<executionId>/report.md`.

Для продолжения в **новом чате** с одним `executionId` предпочитай command **`continue-signal-orchestrator`** — см. `CURSOR_AI_LAYER.md`.

Вывод:
- Phase status summary
- Task completion stats
- Model usage stats
- Recommended next actions
