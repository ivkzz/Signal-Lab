#!/usr/bin/env bash
# afterFileEdit: напоминания по путям (Prisma, backend TS). Вход: JSON на stdin, ответ — JSON на stdout.
# https://cursor.com/docs/hooks
set -uo pipefail

raw=$(cat) || true

json_out() { printf '%s\n' "$1"; }

if [[ -z "${raw// }" ]]; then
  json_out '{}'
  exit 0
fi

# Разбор "file_path" из JSON без внешних зависимостей (компактный однострочный payload от Cursor).
file_path=""
if [[ "$raw" =~ \"file_path\"[[:space:]]*:[[:space:]]*\"([^\"]*)\" ]]; then
  file_path="${BASH_REMATCH[1]}"
  while [[ "$file_path" == *\\\\* ]]; do
    file_path="${file_path//\\\\/\\}"
  done
fi

npath="${file_path//\\//}"

if [[ "$npath" == */prisma/schema.prisma ]] || [[ "$npath" == *prisma/schema.prisma ]]; then
  echo "[signal-lab] Prisma schema изменена: выполни migration/generate и проверь сборку backend." >&2
fi

if [[ "$npath" == */apps/backend/src/* ]] && [[ "$npath" == *.ts ]]; then
  echo '[signal-lab] Backend TS изменён: проверь metrics / structured logs / Sentry и валидность `/metrics` + dashboard queries.' >&2
fi

json_out '{}'
exit 0
