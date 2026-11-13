/**
 * src/lib/services/payments/fx.ts
 *
 * EUR -> XOF conversion for the GeniusPay / Paystack checkout.
 *
 * The marketplace stays in EUR. Paystack (through GeniusPay) charges XOF and only accepts
 * whole-franc amounts, so Pawelium converts server-side and persists the quote.
 *
 * Rules:
 *  - Rate comes from FX_RATE_API_URL (default: ExchangeRate-API open endpoint; the ECB feed
 *    used by Frankfurter does not publish XOF). No hardcoded rate, no stale fallback: if the
 *    source is unavailable or returns something implausible, initialization is blocked.
 *  - No floating-point money math: the rate is parsed from its decimal text into a scaled
 *    BigInt (6 decimals) and every product/division is exact integer arithmetic.
 *  - Rounding policy: XOF has no minor unit; the charged amount is the exact product rounded
 *    HALF UP to a whole franc. An optional markup (FX_MARKUP_BPS, default 0) is applied to the
 *    rate before conversion and must be disclosed to the customer if non-zero.
 */

import { getEnv } from "../../env";

export const GATEWAY_FX_CURRENCY = "XOF";

const RATE_SCALE = BigInt(1000000); // 6 decimals
const MIN_PLAUSIBLE_RATE = 100; // XOF per EUR — outside this band the feed is considered broken
const MAX_PLAUSIBLE_RATE = 2000;

export class FxUnavailableError extends Error {
  constructor(public readonly detail: string) {
    super(`FX_UNAVAILABLE:${detail}`);
    this.name = "FxUnavailableError";
  }
}

export interface EurXofQuote {
  /** Original marketplace amount, EUR cents. */
  eurCents: number;
  /** Effective rate (after markup) as a decimal string, XOF per 1 EUR. */
  rate: string;
  source: string;
  /** When the rate was obtained from the source. */
  quotedAt: Date;
  markupBps: number;
  /** Amount to charge, whole XOF. */
  xofAmount: number;
}

/** Parses a plain decimal ("655.957") into a scaled BigInt. Rejects exponents, signs, garbage. */
export function parseRateToScaled(raw: string | number): bigint {
  const text = typeof raw === "number" ? (Number.isFinite(raw) ? raw.toString() : "") : String(raw).trim();
  const m = /^(\d{1,6})(?:\.(\d+))?$/.exec(text);
  if (!m) throw new FxUnavailableError("invalid_rate_format");
  const intPart = BigInt(m[1]);
  const frac = m[2] ?? "";
  const head = BigInt(frac.slice(0, 6).padEnd(6, "0"));
  let scaled = intPart * RATE_SCALE + head;
  // Round half up on digits beyond the 6th.
  if (frac.length > 6 && frac.charCodeAt(6) >= 53 /* '5' */) scaled += BigInt(1);
  if (scaled <= BigInt(0)) throw new FxUnavailableError("rate_not_positive");
  if (scaled < BigInt(MIN_PLAUSIBLE_RATE) * RATE_SCALE || scaled > BigInt(MAX_PLAUSIBLE_RATE) * RATE_SCALE) {
    throw new FxUnavailableError("rate_implausible");
  }
  return scaled;
}

function scaledToString(scaled: bigint): string {
  const int = scaled / RATE_SCALE;
  const frac = (scaled % RATE_SCALE).toString().padStart(6, "0").replace(/0+$/, "");
  return frac ? `${int}.${frac}` : `${int}`;
}

/** Pure conversion (exported for tests). eurCents * rate / 100, rounded half up to whole XOF. */
export function convertEurCentsToXof(eurCents: number, rate: string | number, markupBps = 0): { xofAmount: number; effectiveRate: string } {
  if (!Number.isInteger(eurCents) || eurCents <= 0) throw new FxUnavailableError("invalid_amount");
  let scaled = parseRateToScaled(rate);
  if (markupBps > 0) {
    const num = scaled * BigInt(10_000 + markupBps);
    scaled = (num + BigInt(5000)) / BigInt(10000); // half-up
  }
  const num = BigInt(eurCents) * scaled;
  const den = BigInt(100) * RATE_SCALE;
  const xof = (num + den / BigInt(2)) / den; // half-up
  if (xof <= BigInt(0) || xof > BigInt(Number.MAX_SAFE_INTEGER)) throw new FxUnavailableError("amount_out_of_range");
  return { xofAmount: Number(xof), effectiveRate: scaledToString(scaled) };
}

interface CachedRate {
  rate: string;
  source: string;
  fetchedAt: Date;
  fetchedMs: number;
}
let cache: CachedRate | null = null;

/** Test hook. */
export function resetFxCache() {
  cache = null;
}

async function fetchRate(url: string, timeoutMs = 8000): Promise<{ rate: string; source: string; fetchedAt: Date }> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  } catch (err: any) {
    throw new FxUnavailableError(`fetch_failed:${err?.name || "Error"}`);
  }
  if (!res.ok) throw new FxUnavailableError(`http_${res.status}`);
  const body: any = await res.json().catch(() => null);
  // Supported shapes: ExchangeRate-API {result:"success", rates:{XOF}} and Frankfurter-style {rates:{XOF}}.
  if (body?.result && body.result !== "success") throw new FxUnavailableError("source_reported_error");
  const raw = body?.rates?.[GATEWAY_FX_CURRENCY];
  if (raw === undefined || raw === null) throw new FxUnavailableError("xof_not_published");
  parseRateToScaled(raw); // validates format + plausibility
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "unknown";
    }
  })();
  return { rate: String(raw), source: host, fetchedAt: new Date() };
}

/** Obtains a fresh-enough rate (cache TTL) and builds the persisted quote. */
export async function getEurXofQuote(eurCents: number): Promise<EurXofQuote> {
  const env = getEnv();
  const now = Date.now();
  if (!cache || now - cache.fetchedMs > env.FX_RATE_TTL_SECONDS * 1000) {
    const fresh = await fetchRate(env.FX_RATE_API_URL);
    cache = { ...fresh, fetchedMs: now };
  }
  const { xofAmount, effectiveRate } = convertEurCentsToXof(eurCents, cache.rate, env.FX_MARKUP_BPS);
  return {
    eurCents,
    rate: effectiveRate,
    source: cache.source,
    quotedAt: cache.fetchedAt,
    markupBps: env.FX_MARKUP_BPS,
    xofAmount,
  };
}

/** True when a persisted quote is too old to be reused for a NEW payment session. */
export function isQuoteStale(quotedAt: Date | null | undefined, now = Date.now()): boolean {
  if (!quotedAt) return true;
  return now - quotedAt.getTime() > getEnv().FX_QUOTE_MAX_AGE_SECONDS * 1000;
}
