#!/usr/bin/env bash
# preCompact: краткое напоминание при ужатии контекста. Вход: JSON stdin → stdout: JSON.
# https://cursor.com/docs/agent/hooks
set -uo pipefail

raw=$(cat) || true
if [[ -z "${raw// }" ]]; then
  printf '%s\n' '{}'
  exit 0
fi

echo '[signal-lab] preCompact: не разворачивай rules в чат — @.cursor/rules/ и CURSOR_AI_LAYER.md. Тяжёлый контекст — в .execution/ и skills (signal-orchestrator, scenario-creator, prisma-monorepo, nest-new-endpoint, next-server-client-data).' >&2
printf '%s\n' '{}'
exit 0
