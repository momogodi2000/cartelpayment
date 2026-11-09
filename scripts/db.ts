import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// Load environment variables if not loaded
import dotenv from "dotenv";
dotenv.config();

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error("Usage: tsx scripts/db.ts <command> [...args]");
  console.error("Commands: generate, migrate:dev, migrate:deploy, seed, reset, studio");
  process.exit(1);
}

// 1. Ensure schemas are generated from schema.base.prisma
const generatorScript = path.join(process.cwd(), "scripts", "prisma-schemas.ts");
const genResult = spawnSync("npx", ["tsx", `"${generatorScript}"`], {
  stdio: "inherit",
  shell: true,
});

if (genResult.status !== 0) {
  console.error("Failed to generate provider schemas.");
  process.exit(genResult.status || 1);
}

const provider = (process.env.DATABASE_PROVIDER || "sqlite").toLowerCase();
const schemaPath =
  provider === "postgresql"
    ? path.join("prisma", "postgres", "schema.prisma")
    : path.join("prisma", "sqlite", "schema.prisma");

// If provider is sqlite and DATABASE_URL is not set or set to default dev.db, ensure valid relative path
if (provider === "sqlite") {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("pawelium_db") || process.env.DATABASE_URL.includes("neon")) {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}

console.log(`[db.ts] Provider: ${provider}`);
console.log(`[db.ts] Schema: ${schemaPath}`);
console.log(`[db.ts] DATABASE_URL: ${process.env.DATABASE_URL?.split("@")[1] || process.env.DATABASE_URL}`);

let prismaCmd: string[] = [];

switch (command) {
  case "generate":
    prismaCmd = ["prisma", "generate", "--schema", schemaPath];
    break;

  case "migrate:dev":
    prismaCmd = ["prisma", "migrate", "dev", "--schema", schemaPath, ...args];
    break;

  case "migrate:deploy":
    prismaCmd = ["prisma", "migrate", "deploy", "--schema", schemaPath];
    break;

  case "reset":
    if (provider === "sqlite") {
      const sqliteDbPath = path.join(process.cwd(), "prisma", "sqlite", "dev.db");
      if (fs.existsSync(sqliteDbPath)) {
        try {
          fs.unlinkSync(sqliteDbPath);
          console.log("Removed existing SQLite dev.db");
        } catch (e) {
          console.warn("Could not delete SQLite dev.db:", e);
        }
      }
    }
    prismaCmd = ["prisma", "migrate", "reset", "--force", "--schema", schemaPath];
    break;

  case "seed":
    prismaCmd = ["tsx", "prisma/seed.ts"];
    break;

  case "studio":
    prismaCmd = ["prisma", "studio", "--schema", schemaPath];
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

const safeArgs = prismaCmd.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg));
const result = spawnSync("npx", safeArgs, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status || 0);
