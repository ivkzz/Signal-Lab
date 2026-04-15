#!/usr/bin/env bash
# beforeShellExecution (matcher: git commit): скан .env* в корне на типичные секретные строки. Коммит не блокируется.
# Вход: JSON на stdin, ответ — JSON на stdout.
# https://cursor.com/docs/hooks
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
cwd=$(extract_string cwd)

while [[ "$cmd" == *\\\\* ]]; do cmd="${cmd//\\\\/\\}"; done
while [[ "$cwd" == *\\\\* ]]; do cwd="${cwd//\\\\/\\}"; done

cmd_lc=$(printf '%s' "$cmd" | tr '[:upper:]' '[:lower:]')
if [[ "$cmd_lc" != *git* ]] || [[ "$cmd_lc" != *commit* ]]; then
  json_out "$allow"
  exit 0
fi

root="${CURSOR_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-}}"
if [[ -z "$root" ]]; then
  root="$cwd"
fi
if [[ -z "$root" ]]; then
  root=$(pwd)
fi

hits=0
shopt -s nullglob
for f in "$root"/.env*; do
  [[ -f "$f" ]] || continue
  line_num=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line_num=$((line_num + 1))
    t=$(printf '%s' "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    [[ "$t" =~ ^(SENTRY_DSN|DATABASE_URL|API_KEY|SECRET)=.+ ]] || continue
    if [[ "$hits" -eq 0 ]]; then
      echo "[signal-lab] В .env* найдены строки, похожие на секреты (проверь, что они не попадают в git):" >&2
    fi
    hits=$((hits + 1))
    if [[ "$hits" -le 20 ]]; then
      prev="${t:0:80}"
      echo "  $f:$line_num: $prev" >&2
    fi
  done <"$f"
done
shopt -u nullglob

if [[ "$hits" -gt 20 ]]; then
  echo "  ... и ещё $((hits - 20)) совпадений" >&2
fi

json_out "$allow"
exit 0
