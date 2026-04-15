---
name: prisma-monorepo
description: Prisma schema и миграции в корне монорепо — generate/migrate из apps/backend.
---

# prisma-monorepo

## Когда использовать
- Меняешь `prisma/schema.prisma` или файлы в `prisma/migrations/`.
- Нужно сгенерировать клиент или применить миграции локально/в CI.
- Агент предлагает запускать `prisma` из корня без `--schema` — это здесь ошибочно.

## Источник правды
- Схема и миграции: **`prisma/schema.prisma`**, каталог **`prisma/migrations/`** в корне репозитория.
- Prisma CLI в проекте установлен в **`apps/backend`**; путь к схеме всегда с префиксом **`../../prisma/schema.prisma`** от `apps/backend`.

## Команды (из каталога `apps/backend`)
- Сгенерировать клиент: `npm run prisma:generate` (обёртка над `prisma generate --schema ../../prisma/schema.prisma`).
- Локальные миграции в dev: `npm run prisma:migrate` (использует `../../.env` по скрипту в `package.json`).
- Только generate после правки схемы без новой миграции: тот же `prisma:generate`.

## Чеклист после изменения schema
1. Создать миграцию через `prisma migrate dev` с корректным `--schema` (или npm-скрипт выше).
2. Убедиться, что Nest собирается: `npm run build` в `apps/backend`.
3. Не использовать `prisma db push` для продакшен-пайплайна без явной задачи — см. guardrails в `@.cursor/rules/04-prisma-patterns.mdc`.

## Ограничения
- Raw SQL — только по явному запросу и parameterized (`@.cursor/rules/01-stack-enforcement.mdc`).
- Не дублируй модели в другом каталоге Prisma.
