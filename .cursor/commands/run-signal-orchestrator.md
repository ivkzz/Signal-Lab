---
description: Выполнить PRD через skill signal-orchestrator
---

Используй `signal-orchestrator`, чтобы выполнить PRD с resumable context.

Входные параметры:
- `prdPath` (required)
- `executionId` (optional; set to resume)

Поток выполнения (flow):
1. Create or load `.execution/<executionId>/context.json`.
2. Выполни фазы (phases):
   analysis -> codebase -> planning -> decomposition -> implementation -> review -> report.
3. Используй `fast` для 80%+ атомарных задач (atomic tasks), `default` — только для сложных integration/planning задач.
4. Save final report to `.execution/<executionId>/report.md`.

Вывод:
- Phase status summary
- Task completion stats
- Model usage stats
- Recommended next actions
