---
name: next-server-client-data
description: Граница server vs client для данных Next.js App Router — fetch, axios, TanStack Query.
---

# next-server-client-data

## Когда использовать
- Решаешь, откуда звать Nest API: **RSC / layout / page (server)** vs **клиентский компонент**.
- Добавляешь prefetch начальных данных или мутацию с инвалидацией кэша.
- Избежать утечки `server-only` или секретов в клиентский бандл.

## Правила репозитория
| Слой | Файлы / API | Паттерн |
|------|-------------|---------|
| Сервер | `apps/frontend/lib/server-api.ts` и модули с `import 'server-only'` | `fetch` к `NEXT_PUBLIC_API_URL` / дефолт `http://localhost:3001/api`; явный **`cache: 'no-store'`** для живых данных |
| Клиент | `apps/frontend/lib/api.ts` (axios instance) | Используй в **`useQuery` / `useMutation`** и клиентских компонентах с `'use client'` |
| Типы ответов | `features/<feature>/types.ts` | Импорт и с сервера, и с клиента; **не** подключай из типового barrel клиентский entry с `server-only` |

## TanStack Query
- Ключи запросов — стабильные, по возможности вынесены рядом с фичей (например `features/home/...`).
- После мутации — **`invalidateQueries`** для затронутых списков/деталей.
- Формы пользовательского ввода — **React Hook Form**; мутации — через `useMutation` (см. `@.cursor/skills/rhf-tanstack-form/SKILL.md`).

## Кеш Next
- Для данных дашборда и сценариев в RSC используй **`no-store`**, если нет явного TTL и `revalidate`.
- Не смешивай в одном модуле импорты `server-only` и хуки React Query.

## Ограничения
- Бизнес-логика и Prisma остаются на **backend**; Route Handlers в Next — тонкий слой (`@.cursor/rules/02-frontend-conventions.mdc`).
- URL бэкенда — через env, не хардкод в разбросанных компонентах.
