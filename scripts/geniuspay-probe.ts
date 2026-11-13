/**
 * scripts/geniuspay-probe.ts  (npm run probe:gateways -- --confirm)
 *
 * Verifies, against the real GeniusPay API, which request shape produces a usable EUR
 * CARD session. Every probe creates ONE unpaid €1.00 session that is never shown to anyone
 * and expires at the provider after 24 h. NO card is charged. Secrets are never printed.
 *
 * Variants tried per card gateway: gateway only / payment_method only / both with "card".
 * Output: docs/GATEWAY_PROBE_REPORT.md (+ gateway verification state in the local DB).
 */
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

import { geniusPay, GeniusPayError } from "../src/lib/services/payments/geniuspay";
import { isAcceptableCardSession } from "../src/lib/services/payments/gateway-registry";
import { getEnv } from "../src/lib/env";

if (!process.argv.includes("--confirm")) {
  console.error("Refusing to run without --confirm (creates unpaid sessions at the real provider).");
  process.exit(1);
}

// --xof: probe the Paystack whole-franc XOF flow (1000 XOF, unpaid) instead of the EUR matrix.
const XOF_MODE = process.argv.includes("--xof");
const PROBE_CURRENCY = XOF_MODE ? "XOF" : "EUR";
const PROBE_AMOUNT = XOF_MODE ? 1000 : 100; // XOF: whole francs; EUR: cents

type Variant = { label: string; selection: { field: "gateway" | "payment_method"; value: string } | null };
const GATEWAYS = ["stripe", "paystack", "paiementpro", "paiement_pro", "cinetpay"];
// --xof sends exactly ONE unpaid session: payment_method=paystack. The full matrix is EUR-mode only.
const variants: Variant[] = XOF_MODE
  ? [{ label: "payment_method=paystack (XOF)", selection: { field: "payment_method", value: "paystack" } }]
  : [{ label: "default routing (payment_method=card)", selection: null }];
if (!XOF_MODE) {
  for (const g of GATEWAYS) {
    variants.push({ label: `gateway=${g}`, selection: { field: "gateway", value: g } });
    variants.push({ label: `payment_method=${g}`, selection: { field: "payment_method", value: g } });
  }
}

async function main() {
  const env = getEnv();
  console.log(`Environment: ${env.GENIUSPAY_ENVIRONMENT} | base: ${env.GENIUSPAY_BASE_URL} | unit: ${env.GENIUSPAY_AMOUNT_UNIT}`);
  const rows: string[] = [];
  const results: Array<Record<string, unknown>> = [];

  for (const v of variants) {
    const ref = `PROBE-${Date.now().toString(36).toUpperCase()}`;
    const r: Record<string, unknown> = { variant: v.label };
    try {
      const s = await geniusPay.createPayment({
        orderId: ref, orderRef: ref, paymentId: ref, attemptRef: ref,
        amountCents: PROBE_AMOUNT, currency: PROBE_CURRENCY, selection: v.selection,
        customer: { name: "Pawelium Probe", email: "probe@pawelium.fyi", phone: "+33600000000", country: "FR" },
        successUrl: `${env.NEXT_PUBLIC_SITE_URL}/en`, errorUrl: `${env.NEXT_PUBLIC_SITE_URL}/en`,
        description: "Pawelium gateway verification - do not pay",
      });
      let host = "";
      try { host = new URL(s.checkoutUrl).hostname; } catch { /* ignore */ }
      Object.assign(r, { http: 201, gateway: s.gateway, currency: s.currency, amount: s.amount, host, reference: s.reference, usable: isAcceptableCardSession(s.gateway, s.checkoutUrl) && (!s.currency || s.currency === PROBE_CURRENCY) && (s.amount === null || s.amount === (XOF_MODE ? PROBE_AMOUNT : s.amount)) });
    } catch (e) {
      const err = e as GeniusPayError;
      Object.assign(r, { http: err.httpStatus ?? null, phase: err.phase ?? "error", code: err.errorCode ?? null, message: String(err.message).slice(0, 160) });
    }
    results.push(r);
    console.log(JSON.stringify(r));
    rows.push(`| ${v.label} | ${r.http ?? "-"} | ${r.gateway ?? r.code ?? "-"} | ${r.host ?? "-"} | ${r.currency ?? "-"} | ${r.amount ?? "-"} | ${r.usable === true ? "YES" : r.http === 201 ? "no" : "-"} | ${r.message ?? ""} |`);
  }

  const md = [
    "# GeniusPay gateway probe",
    "",
    `Run: ${new Date().toISOString()} · environment: ${env.GENIUSPAY_ENVIRONMENT} · currency: ${PROBE_CURRENCY} · amount unit: ${XOF_MODE ? "whole XOF" : env.GENIUSPAY_AMOUNT_UNIT}`,
    "",
    `Each row created at most one unpaid ${XOF_MODE ? "1,000 XOF" : "€1.00 EUR"} session (expires after 24 h). No card was charged.`,
    "",
    `| Variant | HTTP | Echoed gateway / error | Checkout host | Currency | Amount | Usable for ${PROBE_CURRENCY} card | Provider message |`,
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  fs.writeFileSync(path.resolve(process.cwd(), "docs", XOF_MODE ? "GATEWAY_PROBE_XOF_REPORT.md" : "GATEWAY_PROBE_REPORT.md"), md, "utf-8");
  fs.writeFileSync(path.resolve(process.cwd(), XOF_MODE ? "src/lib/services/payments/gateway-probe-xof-results.json" : "src/lib/services/payments/gateway-probe-results.json"), JSON.stringify({ at: new Date().toISOString(), environment: env.GENIUSPAY_ENVIRONMENT, results }, null, 2));
  console.log("Report written to docs/" + (XOF_MODE ? "GATEWAY_PROBE_XOF_REPORT.md" : "GATEWAY_PROBE_REPORT.md"));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
