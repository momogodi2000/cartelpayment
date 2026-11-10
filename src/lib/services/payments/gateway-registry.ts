/**
 * src/lib/services/payments/gateway-registry.ts
 *
 * Central registry of every gateway reachable through the GeniusPay orchestration layer.
 *
 * Rules (non-negotiable):
 *  - Card routing only ever uses gateways whose method is "card".
 *  - Mobile-money gateways (PAL, Wave, PawaPay) are registered for completeness but are
 *    NEVER eligible for a card transaction and are not offered to European customers.
 *  - A gateway is only routed to once its GeniusPay identifier and card/EUR capability
 *    have been verified (probe or a real accepted session). Verification state lives in
 *    the GatewayHealth table so it can change at runtime (serverless file systems are
 *    read-only); gateway-capabilities.json provides the initial evidence.
 *  - Priority / enabled flags can be overridden by the SUPER_ADMIN through the
 *    `payments.gateways` SiteSetting. Identifiers and methods cannot be changed there.
 */

import { prisma } from "../../db/client";
import capabilities from "./gateway-capabilities.json";
import type { GatewaySelectionParam } from "./geniuspay";

export type GatewayMethod = "card" | "mobile_money";

export interface GatewayConfig {
  id: string;
  label: string;
  method: GatewayMethod;
  /** How the gateway is requested from GeniusPay; null = GeniusPay default routing. */
  selection: GatewaySelectionParam;
  currencies: string[];
  minAmountCents: number;
  maxAmountCents: number;
  priority: number;
  enabled: boolean;
  /** Static note shown in the admin (provider status, ticket references…). */
  note?: string;
}

export interface ResolvedGateway extends GatewayConfig {
  verified: boolean;
  verifiedAt: Date | null;
}

/** Gateways allowed to actually process a CARD payment (checked against GeniusPay's echo). */
export const CARD_GATEWAY_IDS = ["stripe", "paystack", "paiementpro", "cinetpay"] as const;

/** Hosted-checkout hosts that are known card processors (used when no gateway is echoed). */
export const CARD_CHECKOUT_HOSTS = ["checkout.stripe.com", "checkout.paystack.com"];

export const DEFAULT_ROUTE_ID = "geniuspay_default_card";

export const SETTING_KEY_GATEWAYS = "payments.gateways";

const BASE_REGISTRY: GatewayConfig[] = [
  {
    id: "stripe",
    label: "Stripe",
    method: "card",
    selection: { field: "gateway", value: "stripe" },
    currencies: ["EUR"],
    minAmountCents: 100,
    maxAmountCents: 5_000_000,
    priority: 1,
    enabled: true,
    note: "Preferred card processor. GeniusPay ticket TKT-AF45C8DA reports a provider-side malfunction.",
  },
  {
    id: "paystack",
    label: "Paystack",
    method: "card",
    selection: { field: "gateway", value: "paystack" },
    currencies: ["EUR"],
    minAmountCents: 100,
    maxAmountCents: 5_000_000,
    priority: 2,
    enabled: true,
  },
  {
    id: "paiementpro",
    label: "PaiementPro",
    method: "card",
    selection: { field: "gateway", value: "paiementpro" },
    currencies: ["EUR"],
    minAmountCents: 100,
    maxAmountCents: 5_000_000,
    priority: 3,
    enabled: true,
  },
  {
    id: "cinetpay",
    label: "CinetPay",
    method: "card",
    selection: { field: "gateway", value: "cinetpay" },
    currencies: ["EUR"],
    minAmountCents: 100,
    maxAmountCents: 5_000_000,
    priority: 4,
    enabled: false,
    note: "Temporarily unavailable according to the GeniusPay dashboard.",
  },
  {
    // GeniusPay's own routing for payment_method=card (no explicit gateway).
    // The response is accepted only if the echoed gateway is a card processor.
    id: DEFAULT_ROUTE_ID,
    label: "GeniusPay card routing (default)",
    method: "card",
    selection: null,
    currencies: ["EUR"],
    minAmountCents: 100,
    maxAmountCents: 5_000_000,
    priority: 10,
    enabled: true,
    note: "Verified by probe: routed to Paystack card checkout for EUR.",
  },
  // Mobile money — registered, never card-eligible, not offered in the European checkout.
  { id: "pal", label: "PAL", method: "mobile_money", selection: { field: "gateway", value: "pal" }, currencies: [], minAmountCents: 0, maxAmountCents: 0, priority: 100, enabled: false },
  { id: "wave", label: "Wave", method: "mobile_money", selection: { field: "gateway", value: "wave" }, currencies: [], minAmountCents: 0, maxAmountCents: 0, priority: 100, enabled: false },
  { id: "pawapay", label: "PawaPay", method: "mobile_money", selection: { field: "gateway", value: "pawapay" }, currencies: [], minAmountCents: 0, maxAmountCents: 0, priority: 100, enabled: false },
];

/** Initial verification evidence shipped with the build (probe output). */
function staticEvidence(id: string): boolean {
  const key = id === DEFAULT_ROUTE_ID ? "default" : id;
  const entry = (capabilities.verifiedGateways as Array<{ id: string; accepted: boolean; cardCapable: boolean }>).find(
    (g) => g.id === key
  );
  return Boolean(entry?.accepted && entry?.cardCapable);
}

export function getBaseRegistry(): GatewayConfig[] {
  return BASE_REGISTRY.map((g) => ({ ...g }));
}

export type GatewayOverrides = Record<string, { enabled?: boolean; priority?: number }>;

export async function loadGatewayOverrides(): Promise<GatewayOverrides> {
  const row = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY_GATEWAYS } }).catch(() => null);
  if (!row?.value) return {};
  try {
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === "object" ? (parsed as GatewayOverrides) : {};
  } catch {
    return {};
  }
}

/** Full registry with admin overrides and runtime verification state applied. */
export async function getResolvedRegistry(): Promise<ResolvedGateway[]> {
  const [overrides, health] = await Promise.all([
    loadGatewayOverrides(),
    prisma.gatewayHealth.findMany().catch(() => []),
  ]);
  const healthById = new Map(health.map((h) => [h.gatewayId, h]));

  return getBaseRegistry()
    .map((g) => {
      const o = overrides[g.id] || {};
      const h = healthById.get(g.id);
      const isCard = g.method === "card";
      return {
        ...g,
        // Mobile-money gateways can never be enabled for the card checkout.
        enabled: isCard ? (typeof o.enabled === "boolean" ? o.enabled : g.enabled) : false,
        priority: isCard && typeof o.priority === "number" ? o.priority : g.priority,
        verified: isCard && (Boolean(h?.verified) || staticEvidence(g.id)),
        verifiedAt: h?.verifiedAt ?? null,
      };
    })
    .sort((a, b) => a.priority - b.priority);
}

/** Ordered card gateways that are enabled, verified, and support the amount/currency. */
export async function getEligibleCardGateways(currency: string, amountCents: number): Promise<ResolvedGateway[]> {
  const cur = currency.toUpperCase();
  return (await getResolvedRegistry()).filter(
    (g) =>
      g.method === "card" &&
      g.enabled &&
      g.verified &&
      g.currencies.includes(cur) &&
      amountCents >= g.minAmountCents &&
      amountCents <= g.maxAmountCents
  );
}

/**
 * Decides whether a session returned by GeniusPay may be shown to a card customer.
 * The echoed gateway must be a card processor; without an echo, the hosted-checkout host
 * must be a known card processor. Anything else (e.g. a mobile-money picker) is rejected.
 */
export function isAcceptableCardSession(echoedGateway: string | null, checkoutUrl: string): boolean {
  if (echoedGateway) {
    return (CARD_GATEWAY_IDS as readonly string[]).includes(echoedGateway.toLowerCase());
  }
  try {
    const host = new URL(checkoutUrl).hostname.toLowerCase();
    return CARD_CHECKOUT_HOSTS.includes(host);
  } catch {
    return false;
  }
}
