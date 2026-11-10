/**
 * Prepares the isolated E2E database (prisma/sqlite/e2e.db): real migrations, the
 * production-safe seed and a TEST-ONLY SUPER_ADMIN whose credentials come from the E2E
 * environment. Never touches dev.db or any remote database.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/lib/security/password";

const root = process.cwd();
const dbFile = path.join(root, "prisma", "sqlite", "e2e.db");
const env = { ...process.env, DATABASE_PROVIDER: "sqlite", DATABASE_URL: `file:${dbFile.replace(/\\/g, "/")}` };

function run(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, cwd: root, env });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

async function main() {
  for (const f of [dbFile, `${dbFile}-journal`]) fs.rmSync(f, { force: true });
  run("npx", ["tsx", "scripts/prisma-schemas.ts"]);
  run("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/sqlite/schema.prisma"]);
  run("npx", ["tsx", "prisma/seed.ts"]);

  const prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  await prisma.adminUser.create({
    data: {
      email: process.env.E2E_ADMIN_EMAIL || "e2e-admin@example.com",
      name: "E2E Administrator",
      passwordHash: await hashPassword(process.env.E2E_ADMIN_PASSWORD || "e2e-only-password-0123"),
      mustChangePassword: false,
    },
  });
  await prisma.$disconnect();
  console.log("[e2e] database ready:", path.relative(root, dbFile));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
