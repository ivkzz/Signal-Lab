---
description: Добавить новый scenario endpoint path с observability
---

Добавь или расширь Signal Lab scenario flow end-to-end.

Требования (requirements):
1. Обнови backend controller/service/DTO.
2. Сохраняй run state в Prisma (`ScenarioRun`).
3. Добавь instrumentation для metrics + structured logs + Sentry behavior.
4. Обнови frontend scenario runner, если изменился contract.
5. Проверь соответствие `.cursor/rules/*` и релевантным skills.

Используй навыки (skills):
- `scenario-creator`
- `observability-scenario`
- `rhf-tanstack-form` (if frontend form changes)

Верни:
- Changed files
- Verification steps
- Remaining risks
