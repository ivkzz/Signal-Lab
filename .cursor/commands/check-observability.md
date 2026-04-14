---
description: Проверить metrics, logs, dashboard и Sentry signals
---

Запусти быстрый observability readiness audit для Signal Lab.

Чеклист (checklist):
1. Подтверди, что backend `/metrics` отдает нужные metric names:
   - `scenario_runs_total`
   - `scenario_run_duration_seconds`
   - `http_requests_total`
2. Подтверди, что Loki path настроен и logs содержат `scenarioType`.
3. Подтверди, что Grafana dashboard содержит полезные panels для runs/latency/errors.
4. Подтверди, что сценарий `system_error` захватывает Sentry exception.
5. Дай точные reproduction steps для interviewer demo.

Верни (return):
- Pass/fail по каждому signal channel
- Missing items с file-level fix suggestions
