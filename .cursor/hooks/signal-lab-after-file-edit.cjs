#!/usr/bin/env node
/**
 * afterFileEdit: напоминания по путям (Prisma schema, backend TS).
 * Вход: JSON с полем file_path (см. Cursor hooks docs).
 */
const fs = require("fs");

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

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

async function main() {
  let raw = "";
  try {
    raw = await readStdin();
  } catch {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    process.stdout.write("{}\n");
    process.exit(0);
    return;
  }

  const filePath = normalizePath(String(data.file_path || ""));

  if (
    filePath.endsWith("prisma/schema.prisma") ||
    filePath.includes("/prisma/schema.prisma")
  ) {
    console.error(
      "[signal-lab] Prisma schema изменена: выполни migration/generate и проверь сборку backend."
    );
  }

  if (filePath.includes("/apps/backend/src/") && filePath.endsWith(".ts")) {
    console.error(
      "[signal-lab] Backend TS изменён: проверь metrics / structured logs / Sentry и валидность `/metrics` + dashboard queries."
    );
  }

  process.stdout.write("{}\n");
  process.exit(0);
}

main().catch(() => {
  process.stdout.write("{}\n");
  process.exit(0);
});
