/**
 * src/lib/services/payments/gateway-registry.ts
 *
 * Authoritative gateway registry for Pawelium 2.0 card routing.
 * Strictly card-only. Mobile money gateways (Wave, PawaPay, PAL, MTN, Orange)
 * are permanently tagged 'mobile_money' and are NEVER eligible for card routing.
 */

import capabilities from "./gateway-capabilities.json";
import { isStripeDirectConfigured } from "./stripe";

export interface GatewayConfig {
  id: string;
  providerValue: string | null; // null means default GeniusPay card routing
  name: string;
  methods: ("card" | "mobile_money")[];
  currencies: string[];
  countries: string[];
  priority: number;
  enabled: boolean;
  verified: boolean;
}

export function getBaseGatewayRegistry(): GatewayConfig[] {
  const stripeDirectActive = isStripeDirectConfigured();

  return [
    {
      id: "stripe_direct",
      providerValue: "stripe_direct",
      name: "Stripe European Card Clearing (Official Direct)",
      methods: ["card"],
      currencies: ["EUR", "USD"],
      countries: ["FR", "DE", "IT", "ES", "BE", "CH", "GB", "NL", "LU", "AT"],
      priority: 1,
      enabled: stripeDirectActive,
      verified: stripeDirectActive,
    },
    {
      id: "stripe",
      providerValue: "stripe",
      name: "Stripe European Gateway via GeniusPay",
      methods: ["card"],
      currencies: ["EUR", "USD"],
      countries: ["FR", "DE", "IT", "ES", "BE", "CH", "GB", "NL", "LU", "AT"],
      priority: 2,
      enabled: !stripeDirectActive, // Priority 2 fallback when direct Stripe secret is omitted
      verified: capabilities.verifiedGateways.find((g) => g.id === "stripe")?.accepted || false,
    },
    {
      id: "paystack",
      providerValue: "paystack",
      name: "Paystack Direct Card (Disabled for European Market)",
      methods: ["card"],
      currencies: [],
      countries: ["CI"],
      priority: 90,
      enabled: false,
      verified: false,
    },
    {
      id: "cinetpay",
      providerValue: "cinetpay",
      name: "CinetPay Card Gateway (Disabled)",
      methods: ["card"],
      currencies: [],
      countries: ["CI"],
      priority: 91,
      enabled: false,
      verified: false,
    },
    // Mobile money gateways explicitly blacklisted from card routing
    {
      id: "wave",
      providerValue: "wave",
      name: "Wave Mobile Money (Blacklisted)",
      methods: ["mobile_money"],
      currencies: [],
      countries: ["CI", "SN"],
      priority: 99,
      enabled: false,
      verified: false,
    },
    {
      id: "pawapay",
      providerValue: "pawapay",
      name: "PawaPay Mobile Money (Blacklisted)",
      methods: ["mobile_money"],
      currencies: [],
      countries: ["CI"],
      priority: 99,
      enabled: false,
      verified: false,
    },
  ];
}

export const BASE_GATEWAY_REGISTRY: GatewayConfig[] = getBaseGatewayRegistry();

/**
 * Returns ordered list of gateways eligible for card checkout.
 */
export function getEligibleCardGateways(currency: string = "EUR"): GatewayConfig[] {
  return getBaseGatewayRegistry().filter(
    (g) =>
      g.enabled &&
      g.methods.includes("card") &&
      !g.methods.includes("mobile_money") &&
      g.currencies.includes(currency.toUpperCase())
  ).sort((a, b) => a.priority - b.priority);
}
