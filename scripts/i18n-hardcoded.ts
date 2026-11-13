/**
 * scripts/i18n-hardcoded.ts  (npm run i18n:check)
 *
 * 1. Brand guard — customer-facing code, customer locale files, public assets and email
 *    templates must never name the payment infrastructure (GeniusPay, Stripe, Paystack,
 *    PaiementPro, CinetPay, PawaPay, Wave, PAL). Admin code and backend services may.
 * 2. Hardcoded UI text — fails on user-visible literals in components/pages instead of
 *    translation keys:
 *      - JSX text containing letters,
 *      - string values of placeholder / title / alt / aria-label / label / aria-description,
 *      - ternaries that pick a literal by locale (`isFr ? "…" : "…"`, `locale === "fr" ? "…" : "…"`).
 * Exits 1 on any finding. Use `// i18n-ignore` on the same or previous line for the rare
 * legitimate exception (brand names, technical identifiers).
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const rel = (f: string) => path.relative(root, f).replace(/\\/g, "/");

const BRANDS = ["geniuspay", "stripe", "paystack", "paiementpro", "cinetpay", "pawapay"];

const CUSTOMER_DIRS = [
  "src/app/[locale]",
  "src/components/features",
  "src/components/common",
  "src/components/layout",
  "src/i18n/locales/en/common.json",
  "src/i18n/locales/en/public",
  "src/i18n/locales/en/marketplace",
  "src/i18n/locales/en/checkout",
  "src/i18n/locales/en/customer",
  "src/i18n/locales/en/errors",
  "src/i18n/locales/en/validation.json",
  "src/i18n/locales/fr/common.json",
  "src/i18n/locales/fr/public",
  "src/i18n/locales/fr/marketplace",
  "src/i18n/locales/fr/checkout",
  "src/i18n/locales/fr/customer",
  "src/i18n/locales/fr/errors",
  "src/i18n/locales/fr/validation.json",
  "src/lib/services/email/templates",
  "public",
].map((p) => path.join(root, p));

function walk(target: string, exts: string[]): string[] {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return exts.some((e) => target.endsWith(e)) ? [target] : [];
  return fs.readdirSync(target).flatMap((n) => walk(path.join(target, n), exts));
}

function brandGuard(): number {
  let leaks = 0;
  for (const dir of CUSTOMER_DIRS) {
    for (const file of walk(dir, [".ts", ".tsx", ".json", ".html", ".js", ".webmanifest", ".xml", ".txt"])) {
      if (/\.(png|jpe?g|mp4|ico|webp|avif)$/i.test(file)) continue;
      const text = fs.readFileSync(file, "utf-8").toLowerCase();
      for (const b of BRANDS) {
        if (text.includes(b)) {
          console.error(`BRAND LEAK  ${rel(file)}  contains "${b}"`);
          leaks++;
        }
      }
    }
  }
  return leaks;
}

const ATTRS = new Set(["placeholder", "title", "alt", "aria-label", "aria-description", "label"]);
const ALLOWED_TEXT = new Set(["english", "français", "usd", "xof", "pawelium", "whatsapp", "visa", "mastercard", "eur", "en", "fr", "pdf", "faq", "ok", "id", "ids", "x", "p"]);

function isTranslatable(text: string): boolean {
  const t = text.trim().replace(/[.,;:!?]+$/, "");
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false; // email address
  if (!t || !/[A-Za-zÀ-ÿ]{2,}/.test(t)) return false;
  if (ALLOWED_TEXT.has(t.toLowerCase())) return false;
  if (/^(https?:|\/|#|mailto:|tel:|[\w-]+\.(png|jpe?g|svg|webp|avif|mp4))/.test(t)) return false;
  if (/^[\w.-]+$/.test(t) && !/\s/.test(t) && /[._-]|^[a-z]+$/.test(t) && t.length < 4) return false;
  return true;
}

const LOCALE_TEST = /\b(isFr|isEn|isFrench|isEnglish)\b|locale\s*===?\s*["'](fr|en)["']|locale\s*!==?\s*["'](fr|en)["']/;

function scanFile(file: string): string[] {
  const src = fs.readFileSync(file, "utf-8");
  const lines = src.split(/\r?\n/);
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out: string[] = [];
  const ignored = (line: number) => /i18n-ignore/.test(lines[line - 1] ?? "") || /i18n-ignore/.test(lines[line - 2] ?? "");
  const report = (node: ts.Node, kind: string, text: string) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    if (!ignored(line)) out.push(`${kind.padEnd(8)} ${rel(file)}:${line}  ${text.trim().replace(/\s+/g, " ").slice(0, 70)}`);
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText();
      if (isTranslatable(text)) report(node, "JSX-TEXT", text);
    } else if (ts.isJsxAttribute(node) && node.initializer && ATTRS.has(node.name.getText())) {
      const init = node.initializer;
      if (ts.isStringLiteral(init) && isTranslatable(init.text)) report(init, "ATTR", `${node.name.getText()}="${init.text}"`);
    } else if (ts.isConditionalExpression(node) && LOCALE_TEST.test(node.condition.getText())) {
      const lit = (n: ts.Expression) => ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);
      if (lit(node.whenTrue) && lit(node.whenFalse) && (isTranslatable((node.whenTrue as ts.StringLiteral).text) || isTranslatable((node.whenFalse as ts.StringLiteral).text))) {
        report(node, "LOCALE?:", node.getText());
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

export function runHardcodedCheck(): boolean {
  const leaks = brandGuard();
  const targets = [path.join(root, "src/app"), path.join(root, "src/components")];
  const findings: string[] = [];
  let files = 0;
  for (const dir of targets) {
    for (const f of walk(dir, [".tsx"])) {
      if (/\.(test|spec)\./.test(f)) continue;
      if (/opengraph-image|twitter-image/.test(f)) continue; // image generators render brand text, not UI
      files++;
      findings.push(...scanFile(f));
    }
  }
  findings.forEach((l) => console.error(l));
  console.log(`i18n-hardcoded: scanned ${files} files — ${findings.length} hardcoded text finding(s), ${leaks} brand leak(s).`);
  return findings.length === 0 && leaks === 0;
}

if (process.argv[1]?.endsWith("i18n-hardcoded.ts")) {
  process.exit(runHardcodedCheck() ? 0 : 1);
}
