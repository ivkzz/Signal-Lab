---
name: scenario-creator
description: Безопасно добавить новый Signal Lab scenario type end-to-end.
---

# scenario-creator

## Когда использовать (When to Use)
- Нужно добавить новый scenario type в Signal Lab.
- Текущим scenarios нужны новые persistence fields или другой response shape.
- Нужно согласованно обновить backend + frontend + observability.

## Обязательные результаты (Required outputs)
- Backend scenario execution path (DTO/controller/service).
- Persisted fields `ScenarioRun` в Prisma (если требуется).
- Frontend form option + mutation handling + support для history view.
- Observability parity (metrics/logs/Sentry behavior).

## Процедура (Procedure)
1. Добавь scenario enum/value contract на API boundary.
2. Реализуй service branch с явной обработкой status и duration.
3. Сохрани run result в Prisma с безопасной metadata.
4. Обнови frontend runner options и success/error messaging.
5. Убедись, что history rendering поддерживает новый status/type.
6. Добавь или обнови docs/checklist для reproducible verification.

## Ограничения (Guardrails)
- Без breaking changes для существующих scenario types.
- Держи response payload предсказуемым для frontend consumption.
- Не добавляй high-cardinality metric labels.
