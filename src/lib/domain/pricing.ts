export interface PricingQuote {
  animalPriceCents: number;
  transportCents: number;
  taxCents: number;
  feesCents: number;
  totalCents: number;
  currency: string;
}

export interface PricingOptions {
  deliveryCountry?: string;
  deliveryMethod?: "standard" | "express" | "vip";
  customSettings?: Record<string, unknown>;
}

export function calculatePricing(
  animalPriceCents: number,
  options: PricingOptions = {}
): PricingQuote {
  const { deliveryCountry = "France", deliveryMethod = "standard" } = options;

  // 1. Transport calculation
  let transportCents = 15000; // 150 EUR base for France
  const countryNormalized = deliveryCountry.toLowerCase().trim();

  if (countryNormalized && countryNormalized !== "france" && countryNormalized !== "fr") {
    transportCents = 25000; // 250 EUR for other European countries
  }

  if (deliveryMethod === "express") {
    transportCents += 10000;
  } else if (deliveryMethod === "vip") {
    transportCents += 25000;
  }

  // 2. Disclosed platform / concierge fee
  const feesCents = 4900; // 49 EUR concierge & health dossier verification fee

  // 3. Tax calculation (animal price includes VAT under margin scheme; VAT 20% on service fees and transport)
  const taxableServiceBase = transportCents + feesCents;
  const taxCents = Math.round(taxableServiceBase * 0.2); // 20% VAT on transport & concierge fees

  const totalCents = animalPriceCents + transportCents + taxCents + feesCents;

  return {
    animalPriceCents,
    transportCents,
    taxCents,
    feesCents,
    totalCents,
    currency: "EUR",
  };
}
