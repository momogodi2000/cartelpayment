import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const baseSchemaPath = path.join(rootDir, "prisma", "schema.base.prisma");
const sqliteDir = path.join(rootDir, "prisma", "sqlite");
const postgresDir = path.join(rootDir, "prisma", "postgres");

if (!fs.existsSync(baseSchemaPath)) {
  console.error("Base schema file not found:", baseSchemaPath);
  process.exit(1);
}

const baseContent = fs.readFileSync(baseSchemaPath, "utf-8");

fs.mkdirSync(sqliteDir, { recursive: true });
fs.mkdirSync(postgresDir, { recursive: true });

// 1. SQLite Schema Header
const sqliteHeader = `// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
// Generated from prisma/schema.base.prisma via scripts/prisma-schemas.ts

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

// 2. PostgreSQL Schema Header
const postgresHeader = `// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
// Generated from prisma/schema.base.prisma via scripts/prisma-schemas.ts

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

fs.writeFileSync(path.join(sqliteDir, "schema.prisma"), sqliteHeader + baseContent, "utf-8");
fs.writeFileSync(path.join(postgresDir, "schema.prisma"), postgresHeader + baseContent, "utf-8");

console.log("✅ Successfully generated prisma/sqlite/schema.prisma and prisma/postgres/schema.prisma");
