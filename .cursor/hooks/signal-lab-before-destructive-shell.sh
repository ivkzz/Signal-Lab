#!/usr/bin/env bash
# beforeShellExecution: предупреждения для деструктивных Prisma/Docker (команду не блокирует).
# Matchers в hooks.json ограничивают вызовы. Вход: JSON stdin → stdout: permission JSON.
# https://cursor.com/docs/agent/hooks
set -uo pipefail

raw=$(cat) || true
allow='{"permission":"allow"}'

json_out() { printf '%s\n' "$1"; }

if [[ -z "${raw// }" ]]; then
  json_out "$allow"
  exit 0
fi

extract_string() {
  local key="$1"
  if [[ "$raw" =~ \"$key\"[[:space:]]*:[[:space:]]*\"([^\"]*)\" ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
  fi
}

cmd=$(extract_string command)
while [[ "$cmd" == *\\\\* ]]; do cmd="${cmd//\\\\/\\}"; done

cmd_lc=$(printf '%s' "$cmd" | tr '[:upper:]' '[:lower:]')

if [[ "$cmd_lc" == *prisma* ]]; then
  if [[ "$cmd_lc" == *migrate*reset* ]]; then
    echo '[signal-lab] prisma migrate reset: полный сброс БД и данных. Убедись в окружении (.env) и бэкапе.' >&2
  elif [[ "$cmd_lc" == *db*push* ]]; then
    echo '[signal-lab] prisma db push: схема без миграций; в shared/prod окружениях рискованно. Предпочитай migrate dev/deploy.' >&2
  elif [[ "$cmd_lc" == *db*execute* ]]; then
    echo '[signal-lab] prisma db execute: произвольный SQL — проверь источник и окружение перед запуском.' >&2
  fi
fi

if [[ "$cmd_lc" == *compose* ]] && [[ "$cmd_lc" == *down* ]]; then
  if [[ "$cmd_lc" == *"--volumes"* ]] || [[ "$cmd_lc" == *" -v"* ]] || [[ "$cmd_lc" == *" -v "* ]]; then
    echo '[signal-lab] docker compose down с -v/--volumes: удалятся named volumes — данные сервисов могут быть потеряны.' >&2
  fi
fi

json_out "$allow"
exit 0
