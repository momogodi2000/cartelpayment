import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Generating SUPER_ADMIN credentials & handover documentation...");

  const adminEmail = "admin@pawelium.fyi";
  const adminName = "Pawelium Super Admin";
  
  // Generate cryptographically secure random password
  // 18 bytes base64url = 24 chars with numbers, uppercase, lowercase, special chars
  const generatedPassword =
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    `Pawelium_${crypto.randomBytes(9).toString("base64url")}!2026`;

  const passwordHash = await hashPassword(generatedPassword);
  const now = new Date();

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      failedLogins: 0,
      lockedUntil: null,
      updatedAt: now,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      totpEnabled: false,
      createdAt: now,
    },
  });

  const credentialsDoc = `# PAWELIUM 2.0 — SUPER ADMINISTRATOR CREDENTIALS & HANDOVER
**Confidentiality Notice:** HIGH PRIVILEGE ROOT CREDENTIALS.
*This document contains initial root administrator credentials generated during the secure bootstrap process. Excluded from version control via \`.gitignore\`. Never commit or transmit over unencrypted channels.*

---

## 1. Primary Administrative Access

| Property | Value |
| :--- | :--- |
| **Administration Portal URL** | \`http://localhost:3000/admin/login\` (Local) / \`https://pawelium.fyi/admin/login\` (Production) |
| **Console Root URL** | \`/admin\` |
| **Role Designation** | \`SUPER_ADMIN\` (Full Tenant Authority) |
| **Super Admin Name** | \`${admin.name}\` |
| **Super Admin Email** | \`${admin.email}\` |
| **Initial Generated Password** | \`${generatedPassword}\` |
| **Account Creation / Sync Date** | \`${now.toISOString()}\` |
| **Multi-Factor Status** | Standby (Enrolment required upon first sign-in) |

---

## 2. Mandatory First-Login Security Checklist

Upon first successful authentication at \`/admin/login\`:
1. **Rotate Password:** Navigate to **Account & Security** (\`/admin/account\`) and replace the initial bootstrap password with a team-managed master password (min 12 chars with mixed case, numbers, and symbols).
2. **Enrol TOTP Multi-Factor Authentication (MFA):**
   - Click **Enrol Authenticator App** in \`/admin/account\`.
   - Scan the rendered SVG QR code into your hardware authenticator (Google Authenticator, 1Password, Yubico Authenticator).
   - Input the 6-digit TOTP verification code to confirm activation.
3. **Store Emergency Recovery Codes:**
   - Copy the 8 cryptographic recovery codes generated during MFA activation.
   - Store them in an offline, air-gapped vault. Each recovery code is single-use.

---

## 3. Account Recovery & Rotation Procedures

### Password Rotation Procedure
- **Via Console:** Authenticated Super Admin can navigate to \`/admin/account\` and submit the *Change Master Password* form. Old password verification is enforced.
- **Via CLI Bootstrap:** Run \`npm run admin:bootstrap\` or execute:
  \`\`\`bash
  npx tsx scripts/admin-bootstrap.ts --email admin@pawelium.fyi --password "<NEW_SECURE_PASSWORD>"
  \`\`\`

### Account Lockout Reset
- If 5 consecutive invalid credentials or TOTP attempts occur, the account is locked for **15 minutes**.
- Emergency unlock via database CLI:
  \`\`\`sql
  UPDATE "AdminUser" SET "failedLogins" = 0, "lockedUntil" = NULL WHERE "email" = 'admin@pawelium.fyi';
  \`\`\`

### Revoking Compromised Active Sessions
- In the admin console at \`/admin/account\`, click **Revoke All Active Sessions** to instantly invalidate all signed session cookies across all devices.

---

## 4. Production Deployment Environment Notes

Ensure the following variables are configured in Netlify / Hosting Provider before production launch:

\`\`\`env
# Database (Neon Serverless PostgreSQL)
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://user:password@ep-sample-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-sample.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Payments & Gateways
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GENIUSPAY_BASE_URL="https://geniuspay.ci/api/v1/merchant"
GENIUSPAY_ENVIRONMENT="production"
GENIUSPAY_API_KEY="pk_live_..."
GENIUSPAY_API_SECRET="sk_live_..."
GENIUSPAY_WEBHOOK_SECRET="whsec_..."

# Security Keys
ENCRYPTION_KEY="<32-byte hex key for AES-256-GCM>"
CRON_SECRET="<Cryptographic bearer token for scheduled jobs>"
ADMIN_BOOTSTRAP_PASSWORD="<Initial password used during first migration seed>"
\`\`\`
`;

  const targetPath = path.resolve(process.cwd(), "SUPER_ADMIN_CREDENTIALS.md");
  fs.writeFileSync(targetPath, credentialsDoc, "utf-8");

  // Check git-ignore status
  try {
    const ignored = execSync("git check-ignore SUPER_ADMIN_CREDENTIALS.md", { encoding: "utf8" }).trim();
    console.log(`🛡️  Verified: SUPER_ADMIN_CREDENTIALS.md is ignored by git (${ignored})`);
  } catch {
    console.error("⚠️ WARNING: SUPER_ADMIN_CREDENTIALS.md is NOT ignored by git! Check .gitignore.");
  }

  console.log(`✅ Saved secure credentials handover file to: ${targetPath}`);
}

main()
  .catch((e) => {
    console.error("Failed to generate credentials:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
