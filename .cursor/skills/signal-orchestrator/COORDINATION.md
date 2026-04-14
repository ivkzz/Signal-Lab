# signal-orchestrator coordination

## Шаблон context (`context.json`)

```json
{
  "executionId": "2026-04-13-15-20",
  "prdPath": "prds/004_prd-orchestrator.md",
  "status": "in_progress",
  "currentPhase": "analysis",
  "signal": 42,
  "modelPolicy": {
    "fastTargetShare": 0.8,
    "defaultUseCases": [
      "architecture_planning",
      "cross_system_integration",
      "tradeoff_review"
    ]
  },
  "phases": {
    "analysis": { "status": "pending", "result": "" },
    "codebase": { "status": "pending", "result": "" },
    "planning": { "status": "pending", "result": "" },
    "decomposition": { "status": "pending", "result": "" },
    "implementation": { "status": "pending", "completedTasks": 0, "totalTasks": 0 },
    "review": { "status": "pending", "attempts": 0 },
    "report": { "status": "pending" }
  },
  "tasks": []
}
```

## Prompts по фазам (subagent style)

### 1) Analysis (`fast`)
- Извлеки requirements, constraints, acceptance criteria и non-goals.
- Верни краткий структурированный результат (output) для `context.phases.analysis.result`.

### 2) Codebase Scan (`fast`, readonly)
- Сделай map только релевантных files/modules.
- Выяви gaps относительно PRD.
- Верни actionable inventory.

### 3) Planning (`default`)
- Предложи implementation strategy по domains.
- Добавь notes по risks и dependencies.

### 4) Decomposition (`default`)
- Разбей работу на атомарные задачи (atomic tasks) с dependency graph.
- Пометь `complexity` и `model`.
- Добавь рекомендуемый skill для каждой задачи (task).

### 5) Implementation (mixed)
- Выполняй готовые задачи (ready tasks) в порядке dependency.
- Предпочитай модель `fast` для low/medium изолированных задач (tasks).
- Используй `default` только там, где требуется integration complexity.

### 6) Review (`fast`, readonly loop)
- Domain reviewer проверяет done criteria.
- При fail подготовь конкретный remediation list.
- Повторяй implementer до 3 rounds на каждый domain.

### 7) Report (`fast`)
- Суммируй outcomes, failures, retries и ручные next steps.
- Сохраняй report в `.execution/<id>/report.md`.

## Правила context economy
- Держи main chat сфокусированным на переходах между фазами (phase transitions) и решениях.
- Переноси тяжелые inspection/edits в subagents.
- Сохраняй результаты фаз (phase outputs) в files; избегай полного replay history в chat.
