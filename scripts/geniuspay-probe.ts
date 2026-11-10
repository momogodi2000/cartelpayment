/**
 * scripts/geniuspay-probe.ts
 *
 * Diagnostic gateway probe for GeniusPay merchant integration.
 * Safe, read-mostly probe script that runs ONLY with explicit --confirm.
 * Never prints secrets, passwords, or raw auth headers.
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const args = process.argv.slice(2);
const hasConfirm = args.includes("--confirm");

if (!hasConfirm) {
  console.log(`
========================================================================
🛡️  PAWELIUM 2.0 — GENIUSPAY GATEWAY CAPABILITY PROBE
========================================================================
Safety notice:
This script performs live merchant API calls to test candidate card gateways.
To execute the probe, re-run with explicit authorization:

  npx tsx scripts/geniuspay-probe.ts --confirm

========================================================================
`);
  process.exit(0);
}

const baseUrl = (process.env.GENIUSPAY_BASE_URL || "https://geniuspay.ci/api/v1/merchant").replace(/\/+$/, "");
const apiKey = process.env.GENIUSPAY_API_KEY || "";
const apiSecret = process.env.GENIUSPAY_API_SECRET || "";
const environment = process.env.GENIUSPAY_ENVIRONMENT || "sandbox";

if (!apiKey || !apiSecret) {
  console.error("❌ Error: GENIUSPAY_API_KEY or GENIUSPAY_API_SECRET is missing from environment.");
  process.exit(1);
}

console.log(`\n🔍 Probing GeniusPay Merchant API at: ${baseUrl}`);
console.log(`🌐 Configured Environment: ${environment}`);
console.log(`🔑 Key Prefix: ${apiKey.slice(0, 8)}... (redacted)`);

interface ProbeResult {
  gatewayId: string;
  accepted: boolean;
  httpStatus: number;
  errorCode?: string;
  errorMessage?: string;
  echoedGateway?: string;
  echoedPaymentMethod?: string;
  checkoutUrlHost?: string;
  isStripeTestCardCapable?: boolean;
  isLiveCheckout?: boolean;
  paymentReference?: string;
}

const CANDIDATES = ["default", "stripe", "paystack", "paiementpro", "cinetpay"];

async function runProbe() {
  const results: Record<string, ProbeResult> = {};
  const reportLines: string[] = [];

  reportLines.push(`# GeniusPay Gateway Probe Report`);
  reportLines.push(`**Executed at:** ${new Date().toISOString()}`);
  reportLines.push(`**Environment:** ${environment}`);
  reportLines.push(`**Endpoint:** ${baseUrl}\n`);
  reportLines.push(`| Candidate Gateway | Accepted | HTTP Status | Error Code / Details | Checkout Host | Mode |`);
  reportLines.push(`| :--- | :---: | :---: | :--- | :--- | :--- |`);

  // Probe candidates
  for (const candidate of CANDIDATES) {
    console.log(`\n⏳ Probing candidate: [${candidate}] with EUR card payment...`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-API-Key": apiKey,
          "X-API-Secret": apiSecret,
          "User-Agent": "Pawelium-Probe/2.0",
        },
        body: JSON.stringify({
          amount: 100, // 100 cents (1 EUR) as integer
          currency: "EUR",
          payment_method: "card",
          ...(candidate !== "default" ? { gateway: candidate } : {}),
          description: "PAWELIUM PROBE – do not pay",
          customer: {
            name: "Pawelium Diagnostic Probe",
            email: "probe@pawelium.fyi",
            phone: "+33600000000",
            country: "FR",
          },
          success_url: "https://pawelium.fyi/en/checkout/return",
          error_url: "https://pawelium.fyi/en/checkout/cancel",
          metadata: { probe: true, candidate },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const json: any = await res.json().catch(() => ({}));
      const checkoutUrl = json.data?.checkout_url || json.data?.payment_url || json.checkout_url || "";
      const accepted = res.ok && Boolean(checkoutUrl);
      const ref = json.data?.reference || json.reference || "";

      let host = "N/A";
      let isTest = false;
      let isLive = false;

      if (checkoutUrl) {
        try {
          const parsed = new URL(checkoutUrl);
          host = parsed.hostname;
          if (checkoutUrl.includes("cs_test_") || parsed.hostname.includes("sandbox")) {
            isTest = true;
          } else if (checkoutUrl.includes("cs_live_")) {
            isLive = true;
          }
        } catch {}
      }

      const result: ProbeResult = {
        gatewayId: candidate,
        accepted,
        httpStatus: res.status,
        errorCode: json.error_code || json.code,
        errorMessage: json.message || json.error,
        echoedGateway: json.data?.gateway || json.gateway,
        echoedPaymentMethod: json.data?.payment_method || json.payment_method,
        checkoutUrlHost: host,
        isStripeTestCardCapable: isTest,
        isLiveCheckout: isLive,
        paymentReference: ref,
      };

      results[candidate] = result;

      const statusBadge = accepted ? "✅ PASS" : "❌ REJECT";
      const modeBadge = isTest ? "🧪 TEST" : isLive ? "⚠️ LIVE" : "N/A";
      const details = accepted
        ? `Ref: ${ref}`
        : `${result.errorCode || ""}: ${result.errorMessage || "Unknown error"}`;

      reportLines.push(
        `| **${candidate}** | ${statusBadge} | ${res.status} | ${details.slice(0, 60)} | ${host} | ${modeBadge} |`
      );

      console.log(`   Status: ${res.status} | Accepted: ${accepted} | Host: ${host} | ${details}`);
    } catch (err: any) {
      console.error(`   Failed to connect: ${err.message}`);
      results[candidate] = {
        gatewayId: candidate,
        accepted: false,
        httpStatus: 0,
        errorMessage: err.message,
      };
      reportLines.push(`| **${candidate}** | ❌ ERROR | 0 | Network error: ${err.message} | N/A | N/A |`);
    }
  }

  // Capability mapping
  const capabilities = {
    updatedAt: new Date().toISOString(),
    environment,
    verifiedGateways: Object.values(results).map((r) => ({
      id: r.gatewayId,
      accepted: r.accepted,
      cardCapable: r.accepted,
      currencies: ["EUR"],
      isStripeTest: r.isStripeTestCardCapable || false,
      isLive: r.isLiveCheckout || false,
      lastStatus: r.httpStatus,
      lastError: r.errorMessage || null,
      echoedGateway: r.echoedGateway || null,
      unpaidProbeReference: r.paymentReference || null,
    })),
  };

  // Write capabilities JSON
  const capabilitiesPath = path.resolve(
    process.cwd(),
    "src/lib/services/payments/gateway-capabilities.json"
  );
  fs.writeFileSync(capabilitiesPath, JSON.stringify(capabilities, null, 2), "utf-8");
  console.log(`\n💾 Saved capabilities to: ${capabilitiesPath}`);

  // Write markdown report
  const reportPath = path.resolve(process.cwd(), "docs/GATEWAY_PROBE_REPORT.md");
  fs.writeFileSync(reportPath, reportLines.join("\n"), "utf-8");
  console.log(`📄 Saved probe markdown report to: ${reportPath}\n`);
}

runProbe().catch((err) => {
  console.error("Probe script crashed:", err);
  process.exit(1);
});
