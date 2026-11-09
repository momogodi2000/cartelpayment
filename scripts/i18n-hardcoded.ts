/**
 * scripts/i18n-hardcoded.ts
 *
 * Scans TSX / TS files in src/app and src/components for hardcoded French/English strings.
 * Uses the TypeScript compiler API AST traversal.
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

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
  // Non-alphabetic strings (punctuation, numbers, symbols, currency)
  if (!/[a-zA-Z]/.test(cleaned)) return true;
  // Single characters or common symbols
  if (cleaned.length <= 1) return true;
  // Matches URLs, paths, CSS classes or hex codes
  if (cleaned.startsWith("http") || cleaned.startsWith("/") || cleaned.startsWith("#") || cleaned.includes("px") || cleaned.includes("rem")) return true;
  // Lowercase match in allowlist
  if (ALLOWLIST_WORDS.has(cleaned.toLowerCase())) return true;
  return false;
}

function getAllFiles(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      // Exclude tests or mocks
      if (!entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
        files.push(full);
      }
    }
  }
  return files;
}

export function runHardcodedCheck(): boolean {
  console.log("🔍 [i18n-hardcoded] Scanning TSX/TS components for unextracted UI literals...");

  let totalFiles = 0;
  let findings = 0;

  for (const dir of TARGET_DIRS) {
    const files = getAllFiles(dir);
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
        // Flag JSX Text with long natural language words
        if (ts.isJsxText(node)) {
          const text = node.getText().trim();
          if (text && /[a-zA-Z]{3,}/.test(text) && !isAllowedLiteral(text)) {
            // Check if it's likely user-facing UI text (> 1 word)
            const words = text.split(/\s+/);
            if (words.length >= 2) {
              const relPath = path.relative(process.cwd(), file);
              const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
              console.warn(`  ⚠️ [HARDCODED JSX TEXT] ${relPath}:${line} -> "${text.slice(0, 40)}${text.length > 40 ? "..." : ""}"`);
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
