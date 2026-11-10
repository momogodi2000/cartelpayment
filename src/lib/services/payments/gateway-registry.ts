/**
 * src/lib/services/payments/gateway-registry.ts
 *
 * Authoritative gateway registry for Pawelium 2.0 card routing.
 * Strictly card-only. Mobile money gateways (Wave, PawaPay, PAL, MTN, Orange)
 * are permanently tagged 'mobile_money' and are NEVER eligible for card routing.
 */

import capabilities from "./gateway-capabilities.json";

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

export const BASE_GATEWAY_REGISTRY: GatewayConfig[] = [
  {
    id: "stripe",
    providerValue: "stripe",
    name: "Stripe European Card Clearing",
    methods: ["card"],
    currencies: ["EUR", "USD"],
    countries: ["FR", "DE", "IT", "ES", "BE", "CH", "GB", "NL", "LU", "AT"],
    priority: 1,
    enabled: false, // Disabled until Stripe activation is completed on GeniusPay merchant account
    verified: capabilities.verifiedGateways.find((g) => g.id === "stripe")?.accepted || false,
  },
  {
    id: "default",
    providerValue: null, // Default GeniusPay card routing (verified Paystack hosted card checkout)
    name: "Secure Card Processing (Paystack)",
    methods: ["card"],
    currencies: ["EUR", "USD", "XOF"],
    countries: ["FR", "DE", "IT", "ES", "BE", "CH", "GB", "NL", "LU", "AT", "CI"],
    priority: 2,
    enabled: true,
    verified: capabilities.verifiedGateways.find((g) => g.id === "default")?.accepted || true,
  },
  {
    id: "paystack",
    providerValue: "paystack",
    name: "Paystack Direct Card",
    methods: ["card"],
    currencies: ["EUR", "XOF"],
    countries: ["FR", "CI"],
    priority: 3,
    enabled: false,
    verified: capabilities.verifiedGateways.find((g) => g.id === "paystack")?.accepted || false,
  },
  {
    id: "cinetpay",
    providerValue: "cinetpay",
    name: "CinetPay Card Gateway",
    methods: ["card"],
    currencies: ["EUR", "XOF"],
    countries: ["FR", "CI"],
    priority: 4,
    enabled: false,
    verified: capabilities.verifiedGateways.find((g) => g.id === "cinetpay")?.accepted || false,
  },
  // Mobile money gateways explicitly blacklisted from card routing
  {
    id: "wave",
    providerValue: "wave",
    name: "Wave Mobile Money",
    methods: ["mobile_money"],
    currencies: ["XOF"],
    countries: ["CI", "SN"],
    priority: 99,
    enabled: false,
    verified: false,
  },
  {
    id: "pawapay",
    providerValue: "pawapay",
    name: "PawaPay Mobile Money",
    methods: ["mobile_money"],
    currencies: ["XOF"],
    countries: ["CI"],
    priority: 99,
    enabled: false,
    verified: false,
  },
];

/**
 * Returns ordered list of gateways eligible for card checkout.
 */
export function getEligibleCardGateways(currency: string = "EUR"): GatewayConfig[] {
  return BASE_GATEWAY_REGISTRY.filter(
    (g) =>
      g.enabled &&
      g.verified &&
      g.methods.includes("card") &&
      !g.methods.includes("mobile_money") &&
      g.currencies.includes(currency.toUpperCase())
  ).sort((a, b) => a.priority - b.priority);
}
