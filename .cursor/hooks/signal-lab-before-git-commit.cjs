#!/usr/bin/env node
/**
 * beforeShellExecution (matcher: git commit): скан .env* в корне проекта на типичные секретные строки.
 * Не блокирует коммит: дублирует идею rg-проверки в лог хука (stderr).
 */
const fs = require("fs");
const path = require("path");

const SENSITIVE = /^(SENTRY_DSN|DATABASE_URL|API_KEY|SECRET)=.+/;

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    process.stdin.on("error", reject);
  });
}

function projectRoot(payload) {
  const fromEnv =
    process.env.CURSOR_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR;
  if (fromEnv) return fromEnv;
  const cwd = payload.cwd || process.cwd();
  return cwd;
}

function listEnvFiles(dir) {
  let names = [];
  try {
    names = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return names
    .filter((d) => d.isFile() && /^\.env/.test(d.name))
    .map((d) => path.join(dir, d.name));
}

async function main() {
  let raw = "";
  try {
    raw = await readStdin();
  } catch {
    process.stdout.write(
      JSON.stringify({ permission: "allow" }) + "\n"
    );
    process.exit(0);
    return;
  }

  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    process.stdout.write(
      JSON.stringify({ permission: "allow" }) + "\n"
    );
    process.exit(0);
    return;
  }

  const cmd = String(payload.command || "");
  const isGitCommit =
    /\bgit\b/i.test(cmd) && /\bcommit\b/i.test(cmd);
  if (!isGitCommit) {
    process.stdout.write(
      JSON.stringify({ permission: "allow" }) + "\n"
    );
    process.exit(0);
    return;
  }

  const root = projectRoot(payload);
  const files = listEnvFiles(root);
  const hits = [];

  for (const file of files) {
    let content = "";
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (SENSITIVE.test(line.trim())) {
        hits.push({ file, line: i + 1, preview: line.trim().slice(0, 80) });
      }
    });
  }

  if (hits.length > 0) {
    console.error(
      "[signal-lab] В .env* найдены строки, похожие на секреты (проверь, что они не попадают в git):"
    );
    for (const h of hits.slice(0, 20)) {
      console.error(`  ${h.file}:${h.line}: ${h.preview}`);
    }
    if (hits.length > 20) {
      console.error(`  ... и ещё ${hits.length - 20} совпадений`);
    }
  }

  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
});
