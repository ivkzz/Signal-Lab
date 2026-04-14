---
name: rhf-tanstack-form
description: Собирать production-ready формы на React Hook Form и TanStack Query.
---

# rhf-tanstack-form

## Когда использовать (When to Use)
- Ты создаешь или рефакторишь frontend form, которая вызывает backend APIs.
- В текущей форме используется manual state handling вместо RHF.
- Mutation lifecycle требует лучшего UX и cache invalidation.

## Чеклист сборки (Build checklist)
1. Определи form schema и defaults в одном месте.
2. Используй `useForm` для field registration и validation.
3. Используй `useMutation` для submit action.
4. Отключай submit во время pending и показывай понятный status feedback.
5. Invalidate затронутые queries после успешной mutation.
6. Показывай errors в user-friendly формате.

## Требования к UI (UI requirements)
- Используй shadcn/ui inputs/select/buttons.
- Держи Tailwind classes читаемыми и консистентными.
- Сохраняй accessibility: labels, focus states, `aria-invalid` для errors.

## Критерии готовности (Done criteria)
- Нет uncontrolled input warnings.
- Нет duplicate submissions во время pending mutation.
- Query cache обновляется без ручного page reload.
