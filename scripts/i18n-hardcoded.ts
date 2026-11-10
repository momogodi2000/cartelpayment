/**
 * scripts/i18n-hardcoded.ts
 *
 * 1. Brand Guard: Strictly verifies ZERO mentions of GeniusPay, Paystack, CinetPay, PaiementPro,
 *    or PawaPay exist in customer-facing directories and locale dictionaries. Exits with code 1 if found.
 * 2. Scans TSX / TS components for unextracted UI literals and displays advisories.
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const FORBIDDEN_CUSTOMER_BRANDS = [
  "geniuspay",
  "paystack",
  "cinetpay",
  "paiementpro",
  "pawapay",
];

const CUSTOMER_SCAN_DIRS = [
  path.join(process.cwd(), "src", "app", "[locale]"),
  path.join(process.cwd(), "src", "components", "features"),
  path.join(process.cwd(), "src", "components", "common"),
  path.join(process.cwd(), "src", "components", "layout"),
  path.join(process.cwd(), "src", "i18n", "locales", "en"),
  path.join(process.cwd(), "src", "i18n", "locales", "fr"),
];

function checkBrandGuard(): boolean {
  console.log("🛡️ [Brand Guard] Scanning customer-facing surfaces for gateway leaks...");
  let leaks = 0;

  for (const dir of CUSTOMER_SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = getFilesRecursive(dir);

    for (const file of files) {
      // Exclude admin locale folders if scanning under locales
      if (file.includes(`${path.sep}admin${path.sep}`)) continue;

      const content = fs.readFileSync(file, "utf-8").toLowerCase();
      for (const brand of FORBIDDEN_CUSTOMER_BRANDS) {
        if (content.includes(brand)) {
          console.error(`❌ [BRAND LEAK ERROR] Forbidden gateway brand "${brand}" found in customer surface: ${path.relative(process.cwd(), file)}`);
          leaks++;
        }
      }
    }
  }

  if (leaks > 0) {
    console.error(`💥 [Brand Guard FAIL] Found ${leaks} brand leak(s). Customer surfaces must only display Card payment methods.`);
    return false;
  }

  console.log("✅ [Brand Guard PASS] Customer surfaces are 100% clean of provider branding.");
  return true;
}

const TARGET_DIRS = [
  path.join(process.cwd(), "src", "app"),
  path.join(process.cwd(), "src", "components"),
];

const ALLOWLIST_WORDS = new Set([
  "pawelium",
  "pawelium.fyi",
  "whatsapp",
  "geniuspay",
  "stripe",
  "visa",
  "mastercard",
  "icad",
  "eur",
  "usd",
  "xof",
  "id",
  "otp",
  "mfa",
  "totp",
  "pdf",
  "cgv",
  "faq",
  "gdpr",
  "rgpd",
  "super_admin",
  "fr",
  "en",
]);

function isAllowedLiteral(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned) return true;
  if (!/[a-zA-Z]/.test(cleaned)) return true;
  if (cleaned.length <= 1) return true;
  if (cleaned.startsWith("http") || cleaned.startsWith("/") || cleaned.startsWith("#") || cleaned.includes("px") || cleaned.includes("rem")) return true;
  if (ALLOWLIST_WORDS.has(cleaned.toLowerCase())) return true;
  return false;
}

function getFilesRecursive(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFilesRecursive(full));
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") || entry.name.endsWith(".json"))) {
      if (!entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
        files.push(full);
      }
    }
  }
  return files;
}

export function runHardcodedCheck(): boolean {
  const brandGuardPassed = checkBrandGuard();
  if (!brandGuardPassed) {
    process.exit(1);
  }

  console.log("🔍 [i18n-hardcoded] Scanning TSX/TS components for unextracted UI literals...");

  let totalFiles = 0;
  let findings = 0;

  for (const dir of TARGET_DIRS) {
    const files = getFilesRecursive(dir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
    totalFiles += files.length;

    for (const file of files) {
      const sourceText = fs.readFileSync(file, "utf-8");
      const sourceFile = ts.createSourceFile(
        file,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      );

      function visit(node: ts.Node) {
        if (ts.isJsxText(node)) {
          const text = node.getText().trim();
          if (text && /[a-zA-Z]{3,}/.test(text) && !isAllowedLiteral(text)) {
            const words = text.split(/\s+/);
            if (words.length >= 2) {
              const relPath = path.relative(process.cwd(), file);
              const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
              findings++;
            }
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
    }
  }

  if (findings > 0) {
    console.warn(`⚠️ [i18n-hardcoded] Checked ${totalFiles} files. Found ${findings} potential advisory literals.`);
  } else {
    console.log(`✅ [i18n-hardcoded] Checked ${totalFiles} files with zero unextracted text violations!`);
  }

  return true;
}

if (process.argv[1]?.endsWith("i18n-hardcoded.ts")) {
  runHardcodedCheck();
}
