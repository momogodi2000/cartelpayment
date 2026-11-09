import { PrismaClient } from "@prisma/client";
import readline from "node:readline";
import { hashPassword } from "../src/lib/security/password";

const prisma = new PrismaClient();

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return undefined;
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("🔐 Pawelium 2.0 — SUPER_ADMIN Bootstrap");

  let email = getArg("--email");
  if (!email) {
    email = await prompt("Enter Super Admin email: ");
  }
  if (!email || !email.includes("@")) {
    console.error("❌ Valid email required");
    process.exit(1);
  }

  let name = getArg("--name");
  if (!name) {
    name = (await prompt("Enter Super Admin name (default: Super Admin): ")) || "Super Admin";
  }

  let password = process.env.ADMIN_BOOTSTRAP_PASSWORD || getArg("--password");
  if (!password) {
    password = await prompt("Enter password (min 8 chars): ");
  }

  if (!password || password.length < 8) {
    console.error("❌ Password must be at least 8 characters long");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      failedLogins: 0,
      lockedUntil: null,
    },
    create: {
      email,
      name,
      passwordHash,
      totpEnabled: false,
    },
  });

  console.log(`✅ Super Admin created / updated successfully: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error("❌ Admin bootstrap failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
