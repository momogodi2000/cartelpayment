/**
 * scripts/validate-translations.ts
 *
 * Automated QA validator for Pawelium 2.0 modular translations.
 * Recursively scans src/i18n/locales/en and src/i18n/locales/fr:
 *  - Verifies exact file tree symmetry
 *  - Verifies 100% key parity between English and French
 *  - Flags empty strings or missing namespaces
 *  - Exits with 0 on success, 1 on failure
 */

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const enBase = path.join(rootDir, "src", "i18n", "locales", "en");
const frBase = path.join(rootDir, "src", "i18n", "locales", "fr");

function getRelativeFiles(dir: string, base: string = dir): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getRelativeFiles(fullPath, base));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(path.relative(base, fullPath));
    }
  }
  return results.sort();
}

function deepCompare(
  objEn: any,
  objFr: any,
  currentPath: string,
  errors: string[],
  fileRel: string
) {
  if (typeof objEn !== typeof objFr) {
    errors.push(`[TYPE MISMATCH] ${fileRel} -> ${currentPath}: EN is ${typeof objEn}, FR is ${typeof objFr}`);
    return;
  }

  if (typeof objEn === "string") {
    if (!objEn.trim()) {
      errors.push(`[EMPTY STRING EN] ${fileRel} -> ${currentPath}`);
    }
    if (!objFr.trim()) {
      errors.push(`[EMPTY STRING FR] ${fileRel} -> ${currentPath}`);
    }
    return;
  }

  if (Array.isArray(objEn)) {
    if (!Array.isArray(objFr)) {
      errors.push(`[ARRAY MISMATCH] ${fileRel} -> ${currentPath}`);
      return;
    }
    if (objEn.length !== objFr.length) {
      errors.push(`[ARRAY LENGTH MISMATCH] ${fileRel} -> ${currentPath}: EN(${objEn.length}) vs FR(${objFr.length})`);
    }
    for (let i = 0; i < Math.min(objEn.length, objFr.length); i++) {
      deepCompare(objEn[i], objFr[i], `${currentPath}[${i}]`, errors, fileRel);
    }
    return;
  }

  if (typeof objEn === "object" && objEn !== null && objFr !== null) {
    const keysEn = new Set(Object.keys(objEn));
    const keysFr = new Set(Object.keys(objFr));

    for (const k of keysEn) {
      if (!keysFr.has(k)) {
        errors.push(`[MISSING IN FR] ${fileRel} -> ${currentPath ? currentPath + "." : ""}${k}`);
      } else {
        deepCompare(objEn[k], objFr[k], `${currentPath ? currentPath + "." : ""}${k}`, errors, fileRel);
      }
    }

    for (const k of keysFr) {
      if (!keysEn.has(k)) {
        errors.push(`[MISSING IN EN] ${fileRel} -> ${currentPath ? currentPath + "." : ""}${k}`);
      }
    }
  }
}

export function validateTranslations(): boolean {
  console.log("🔍 Running Pawelium 2.0 Modular Translation Validation...");

  const enFiles = getRelativeFiles(enBase);
  const frFiles = getRelativeFiles(frBase);

  const errors: string[] = [];

  // 1. File parity check
  const enSet = new Set(enFiles);
  const frSet = new Set(frFiles);

  for (const f of enSet) {
    if (!frSet.has(f)) {
      errors.push(`[FILE MISSING IN FR] ${f}`);
    }
  }
  for (const f of frSet) {
    if (!enSet.has(f)) {
      errors.push(`[FILE MISSING IN EN] ${f}`);
    }
  }

  // 2. Content & key parity check
  for (const file of enFiles) {
    if (frSet.has(file)) {
      const contentEn = JSON.parse(fs.readFileSync(path.join(enBase, file), "utf-8"));
      const contentFr = JSON.parse(fs.readFileSync(path.join(frBase, file), "utf-8"));

      deepCompare(contentEn, contentFr, "", errors, file);
    }
  }

  if (errors.length > 0) {
    console.error(`❌ Translation validation failed with ${errors.length} errors:`);
    for (const err of errors.slice(0, 50)) {
      console.error(`   ${err}`);
    }
    if (errors.length > 50) {
      console.error(`   ... and ${errors.length - 50} more errors.`);
    }
    return false;
  }

  console.log(`✅ All ${enFiles.length} modular translation files verified with 100% key parity and zero empty strings!`);
  return true;
}

if (require.main === module) {
  const ok = validateTranslations();
  process.exit(ok ? 0 : 1);
}
