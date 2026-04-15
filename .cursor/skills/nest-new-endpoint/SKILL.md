---
name: nest-new-endpoint
description: Новый HTTP endpoint в NestJS с DTO, Swagger и observability (метрики, логи, Sentry).
---

# nest-new-endpoint

## Когда использовать
- Добавляешь новый **REST** маршрут (controller + service), не обязательно scenario.
- Расширяешь существующий модуль новыми handler-ами.
- Нужно не сломать `/metrics`, Loki-логи и Sentry.

## Стек и расположение
- Модули Nest: `apps/backend/src/<domain>/` — `*.module.ts`, `*.controller.ts`, `*.service.ts`.
- Валидация: `class-validator` + DTO; Swagger: `@ApiProperty` / `@ApiPropertyOptional` на DTO и операции на методах контроллера.

## HTTP metrics (уже глобально)
- `HttpMetricsInterceptor` зарегистрирован в `main.ts` — новые маршруты автоматически попадают в **`http_requests_total{method,path,status_code}`** через `MetricsService.recordHttpRequest`.
- В `path` для label используется шаблон маршрута (не сырой user path) — **не подставляй** высококардинальные значения в кастомные метрики.

## Что добавить осознанно для «доменных» операций
1. **Structured logs** (JSON-friendly, стабильные keys): уровень info/warn/error по severity; без секретов и PII в сообщениях.
2. **Sentry**: для необработанных ошибок — существующая интеграция Nest; для ожидаемых domain-failures — breadcrumb/context без токенов и секретов.
3. **Дополнительные counters/histograms** — только если endpoint не укладывается в общий HTTP counter (например фоновая job-метрика). Имена и labels — см. `@.cursor/rules/03-observability-guardrails.mdc`.

## Чеклист перед merge
- `GET /metrics` отдаёт валидный Prometheus text после изменений.
- Swagger UI отражает новый endpoint (если модуль подключён к приложению).
- Ошибки клиента → стабильный HTTP status + тело, пригодное для фронта (`@.cursor/rules/05-error-handling.mdc`).

## Связанные skills
- Сценарии Signal Lab — **`scenario-creator`** + **`observability-scenario`**.
- Только метрики сценариев — **`observability-scenario`**.
