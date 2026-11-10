/**
 * scripts/generate-super-admin-credentials.ts  (npm run admin:credentials)
 *
 * Secure bootstrap of the single SUPER_ADMIN account and local credentials handover.
 *
 *   npm run admin:credentials -- --email owner@example.com [--name "Owner Name"]
 *       Creates the SUPER_ADMIN if none exists. Refuses if one already exists.
 *   npm run admin:credentials -- --rotate --email owner@example.com [--yes]
 *       Replaces the password of that existing account (interactive confirmation unless
 *       --yes), disables TOTP, revokes every session and forces a password change.
 *
 * The generated password is written ONLY to SUPER_ADMIN_CREDENTIALS.md (git-ignored,
 * file mode 0600 where supported). It is never printed or logged. Delete the file once the
 * password is stored in a password manager and changed at first sign-in.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";
import { execFileSync } from "node:child_process";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security/password";

dotenv.config();
const prisma = new PrismaClient();
const FILE = path.resolve(process.cwd(), "SUPER_ADMIN_CREDENTIALS.md");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 && i + 1 < process.argv.length && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : undefined;
}
const has = (flag: string) => process.argv.includes(flag);
const mask = (email: string) => email.replace(/^(.).*(@.*)$/, "$1***$2");

function confirm(question: string): Promise<boolean> {
  if (has("--yes")) return Promise.resolve(true);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(`${question} [y/N] `, (a) => (rl.close(), resolve(/^y(es)?$/i.test(a.trim())))));
}

function assertGitIgnored() {
  try {
    execFileSync("git", ["check-ignore", "-q", "SUPER_ADMIN_CREDENTIALS.md"], { stdio: "ignore" });
  } catch {
    throw new Error("SUPER_ADMIN_CREDENTIALS.md is NOT git-ignored. Add it to .gitignore before generating credentials.");
  }
}

function generatePassword(): string {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (fromEnv) {
    if (fromEnv.length < 16) throw new Error("ADMIN_BOOTSTRAP_PASSWORD must contain at least 16 characters.");
    return fromEnv;
  }
  return crypto.randomBytes(24).toString("base64url"); // 32 characters, 192 bits of entropy
}

function document(email: string, name: string, password: string, mode: "created" | "rotated") {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://pawelium.fyi").replace(/\/+$/, "");
  return `# Pawelium — SUPER_ADMIN credentials (confidential)

> Generated locally on ${new Date().toISOString()} (${mode}). This file is git-ignored.
> Store the password in a password manager, then **delete this file**.

| Item | Value |
| --- | --- |
| Sign-in page | ${site}/admin/login |
| Role | SUPER_ADMIN (the only administrative role) |
| Name | ${name} |
| Email | ${email} |
| Initial password | \`${password}\` |

## First sign-in (enforced)

1. Sign in at \`/admin/login\`. You are redirected to **Account & security**.
2. Replace the initial password (minimum 12 characters). Other sessions are signed out.
3. Enable two-factor authentication (TOTP) and store the recovery codes offline.

## Recovery

- Forgotten password: \`/admin/forgot-password\` (single-use link, valid 30 minutes).
- Lost access to the account entirely: \`npm run admin:credentials -- --rotate --email ${email}\`
  (disables TOTP, revokes all sessions, forces a new password).
`;
}

async function main() {
  const rotate = has("--rotate");
  const email = (arg("--email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = arg("--name") || "Pawelium Administrator";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Provide the administrator email with --email <address>.");

  if ((process.env.DATABASE_PROVIDER || "sqlite") === "postgresql" && !(await confirm("Target is a PostgreSQL database. Continue?"))) {
    throw new Error("Aborted.");
  }
  assertGitIgnored();

  const admins = await prisma.adminUser.findMany({ select: { id: true, email: true } });
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  if (!rotate) {
    if (admins.length > 0) {
      throw new Error(
        `A SUPER_ADMIN already exists (${admins.map((a) => mask(a.email)).join(", ")}). ` +
          "Nothing changed. Use --rotate --email <address> to replace its password."
      );
    }
    await prisma.adminUser.create({ data: { email, name, passwordHash, mustChangePassword: true, passwordChangedAt: null } });
    await prisma.auditLog.create({ data: { actorType: "SYSTEM", action: "SUPER_ADMIN_BOOTSTRAPPED", entity: "AdminUser", entityId: email } });
  } else {
    const target = admins.find((a) => a.email === email);
    if (!target) throw new Error(`No SUPER_ADMIN with email ${mask(email)}. Nothing changed.`);
    if (!(await confirm(`Rotate the password of ${mask(email)}? This disables TOTP and signs out every session.`))) {
      throw new Error("Aborted.");
    }
    const now = new Date();
    await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: target.id },
        data: {
          passwordHash,
          mustChangePassword: true,
          failedLogins: 0,
          lockedUntil: null,
          totpEnabled: false,
          totpSecretEnc: null,
          recoveryCodesHash: null,
          lastTotpStep: null,
        },
      }),
      prisma.adminSession.updateMany({ where: { adminId: target.id, revokedAt: null }, data: { revokedAt: now } }),
      prisma.adminPasswordReset.updateMany({ where: { adminId: target.id, usedAt: null }, data: { usedAt: now } }),
      prisma.auditLog.create({ data: { actorType: "SYSTEM", adminId: target.id, action: "SUPER_ADMIN_CREDENTIALS_ROTATED", entity: "AdminUser", entityId: target.id } }),
    ]);
  }

  fs.writeFileSync(FILE, document(email, name, password, rotate ? "rotated" : "created"), { encoding: "utf-8", mode: 0o600 });
  try {
    fs.chmodSync(FILE, 0o600);
  } catch {
    /* not supported on this file system */
  }
  console.log(`SUPER_ADMIN ${rotate ? "password rotated" : "created"} for ${mask(email)}.`);
  console.log(`Credentials written to ${path.basename(FILE)} (git-ignored). The password is not printed.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
