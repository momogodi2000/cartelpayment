/**
 * scripts/i18n-check.ts
 *
 * Verifies Pawelium 2.0 modular translations:
 *   - Namespace file existence in both en and fr
 *   - Key parity and non-empty values
 *   - ICU placeholder parity ({varName})
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

function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
  return matches.map((m) => m.slice(1, -1)).sort();
}

function compareObjects(
  objEn: any,
  objFr: any,
  currentPath: string,
  fileRel: string,
  errors: string[]
) {
  if (typeof objEn !== typeof objFr) {
    errors.push(`[TYPE MISMATCH] ${fileRel} -> ${currentPath}: EN(${typeof objEn}) vs FR(${typeof objFr})`);
    return;
  }

  if (typeof objEn === "string") {
    if (!objEn.trim()) {
      errors.push(`[EMPTY VALUE EN] ${fileRel} -> ${currentPath}`);
    }
    if (!objFr.trim()) {
      errors.push(`[EMPTY VALUE FR] ${fileRel} -> ${currentPath}`);
    }

    // ICU placeholder parity
    const enVars = extractPlaceholders(objEn);
    const frVars = extractPlaceholders(objFr);
    const missingInFr = enVars.filter((v) => !frVars.includes(v));
    const missingInEn = frVars.filter((v) => !enVars.includes(v));
    if (missingInFr.length > 0) {
      errors.push(`[ICU PLACEHOLDER MISMATCH] ${fileRel} -> ${currentPath}: Missing in FR: {${missingInFr.join(", ")}}`);
    }
    if (missingInEn.length > 0) {
      errors.push(`[ICU PLACEHOLDER MISMATCH] ${fileRel} -> ${currentPath}: Missing in EN: {${missingInEn.join(", ")}}`);
    }
    return;
  }

  if (Array.isArray(objEn)) {
    if (!Array.isArray(objFr)) {
      errors.push(`[ARRAY MISMATCH] ${fileRel} -> ${currentPath}`);
      return;
    }
    for (let i = 0; i < Math.max(objEn.length, objFr.length); i++) {
      if (i >= objEn.length) {
        errors.push(`[ARRAY ELEMENT MISSING IN EN] ${fileRel} -> ${currentPath}[${i}]`);
      } else if (i >= objFr.length) {
        errors.push(`[ARRAY ELEMENT MISSING IN FR] ${fileRel} -> ${currentPath}[${i}]`);
      } else {
        compareObjects(objEn[i], objFr[i], `${currentPath}[${i}]`, fileRel, errors);
      }
    }
    return;
  }

  if (typeof objEn === "object" && objEn !== null && objFr !== null) {
    const keysEn = new Set(Object.keys(objEn));
    const keysFr = new Set(Object.keys(objFr));

    for (const key of keysEn) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      if (!keysFr.has(key)) {
        errors.push(`[MISSING IN FR] ${fileRel} -> ${nextPath}`);
      } else {
        compareObjects(objEn[key], objFr[key], nextPath, fileRel, errors);
      }
    }

    for (const key of keysFr) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      if (!keysEn.has(key)) {
        errors.push(`[MISSING IN EN] ${fileRel} -> ${nextPath}`);
      }
    }
  }
}

export function runI18nCheck(): boolean {
  console.log("🔍 [i18n-check] Verifying modular translation catalogs...");

  const enFiles = getRelativeFiles(enBase);
  const frFiles = getRelativeFiles(frBase);

  const errors: string[] = [];

  const enSet = new Set(enFiles);
  const frSet = new Set(frFiles);

  for (const f of enFiles) {
    if (!frSet.has(f)) {
      errors.push(`[MISSING FILE IN FR] File ${f} exists in EN but not in FR`);
    }
  }

  for (const f of frFiles) {
    if (!enSet.has(f)) {
      errors.push(`[MISSING FILE IN EN] File ${f} exists in FR but not in EN`);
    }
  }

  for (const relFile of enFiles) {
    if (!frSet.has(relFile)) continue;

    const pathEn = path.join(enBase, relFile);
    const pathFr = path.join(frBase, relFile);

    try {
      const contentEn = JSON.parse(fs.readFileSync(pathEn, "utf-8"));
      const contentFr = JSON.parse(fs.readFileSync(pathFr, "utf-8"));
      compareObjects(contentEn, contentFr, "", relFile, errors);
    } catch (err: any) {
      errors.push(`[JSON PARSE ERROR] ${relFile}: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    console.error(`❌ [i18n-check] Found ${errors.length} translation issues:`);
    errors.forEach((err) => console.error(`  - ${err}`));
    return false;
  }

  console.log(`✅ [i18n-check] All ${enFiles.length} modular translation files verified with 100% key and ICU parity!`);
  return true;
}

if (process.argv[1]?.endsWith("i18n-check.ts")) {
  const success = runI18nCheck();
  process.exit(success ? 0 : 1);
}
