/**
 * Builds a migrated SQLite template database once per test run (from the real migration
 * history, never from dev.db). Each test file then works on its own fresh copy
 * (see tests/setup.ts), so tests never touch development data and never share state.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sqliteDir = path.join(root, "prisma", "sqlite");
export const TEMPLATE_DB = path.join(sqliteDir, "test-template.db");

function cleanup() {
  for (const f of fs.readdirSync(sqliteDir)) {
    if (/^test-.*\.db(-journal)?$/.test(f)) {
      try {
        fs.rmSync(path.join(sqliteDir, f), { force: true });
      } catch {
        /* file still locked on Windows: ignore */
      }
    }
  }
}

export default function setup() {
  if ((process.env.DATABASE_PROVIDER || "sqlite") !== "sqlite") return () => undefined;

  cleanup();
  const gen = spawnSync("npx", ["tsx", "scripts/prisma-schemas.ts"], { stdio: "inherit", shell: true, cwd: root });
  if (gen.status !== 0) throw new Error("Failed to generate provider schemas");

  const res = spawnSync("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/sqlite/schema.prisma"], {
    stdio: "pipe",
    shell: true,
    cwd: root,
    env: { ...process.env, DATABASE_URL: `file:${TEMPLATE_DB.replace(/\\/g, "/")}` },
  });
  if (res.status !== 0) {
    throw new Error(`Template migration failed:\n${res.stdout?.toString()}\n${res.stderr?.toString()}`);
  }
  return () => cleanup();
}
