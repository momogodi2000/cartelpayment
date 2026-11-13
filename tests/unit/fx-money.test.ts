/**
 * EUR -> XOF conversion (integer-only math, half-up rounding, strict rate validation) and the
 * currency-aware money helpers used for the GeniusPay/Paystack checkout.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  convertEurCentsToXof,
  parseRateToScaled,
  getEurXofQuote,
  isQuoteStale,
  resetFxCache,
  FxUnavailableError,
} from "@/lib/services/payments/fx";
import { resetEnvCacheForTests } from "@/lib/env";
import {
  formatMoney,
  formatAmountForGeniusPay,
  parseAmountFromGeniusPay,
  currencyDecimals,
} from "@/lib/domain/money";

describe("convertEurCentsToXof", () => {
  it("converts EUR 100.00 at 655.957 to whole XOF (half-up)", () => {
    // 100.00 * 655.957 = 65595.7 -> 65596
    expect(convertEurCentsToXof(10000, "655.957").xofAmount).toBe(65596);
  });

  it("converts the 1,037.45 EUR example without floating-point drift", () => {
    // 1037.45 * 655.957 = 680523.4... exactly (103745 * 655957000 / 1e8 = 680523.41...) -> 680523
    expect(convertEurCentsToXof(103745, "655.957").xofAmount).toBe(680523);
    expect(Number.isInteger(convertEurCentsToXof(103745, "655.957").xofAmount)).toBe(true);
  });

  it("rounds exactly half up (never banker's rounding, never truncation)", () => {
    // 0.01 EUR at rate 150 = 1.5 XOF -> 2 ; at rate 149.99 = 1.4999 -> 1
    expect(convertEurCentsToXof(1, "150").xofAmount).toBe(2);
    expect(convertEurCentsToXof(1, "149.99").xofAmount).toBe(1);
    // 0.03 EUR at 150 = 4.5 -> 5
    expect(convertEurCentsToXof(3, "150").xofAmount).toBe(5);
  });

  it("applies an explicit markup to the rate (disclosed via the returned effective rate)", () => {
    const base = convertEurCentsToXof(10000, "655.957", 0);
    const marked = convertEurCentsToXof(10000, "655.957", 100); // +1%
    expect(marked.xofAmount).toBeGreaterThan(base.xofAmount);
    expect(marked.effectiveRate).toBe("662.51657");
  });

  it("returns the rate as a plain decimal string", () => {
    expect(convertEurCentsToXof(10000, "655.957").effectiveRate).toBe("655.957");
    expect(convertEurCentsToXof(10000, 656).effectiveRate).toBe("656");
  });

  it("rejects non-positive or non-integer EUR amounts", () => {
    expect(() => convertEurCentsToXof(0, "655.957")).toThrow(FxUnavailableError);
    expect(() => convertEurCentsToXof(-5, "655.957")).toThrow(FxUnavailableError);
    expect(() => convertEurCentsToXof(10.5, "655.957")).toThrow(FxUnavailableError);
  });
});

describe("parseRateToScaled validation", () => {
  it("accepts plain decimals and rounds digits beyond 6 decimals half up", () => {
    expect(parseRateToScaled("655.957")).toBe(BigInt(655957000));
    expect(parseRateToScaled("655.9569995")).toBe(BigInt(655957000));
    expect(parseRateToScaled(655.957)).toBe(BigInt(655957000));
  });

  it.each(["", "abc", "-1", "1e3", "NaN", "0", "50", "5000", "655,957", " "])("rejects %j", (bad) => {
    expect(() => parseRateToScaled(bad)).toThrow(FxUnavailableError);
  });

  it("rejects non-finite numbers", () => {
    expect(() => parseRateToScaled(Number.NaN)).toThrow(FxUnavailableError);
    expect(() => parseRateToScaled(Number.POSITIVE_INFINITY)).toThrow(FxUnavailableError);
  });
});

describe("getEurXofQuote (rate source)", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    resetFxCache();
    process.env.FX_RATE_TTL_SECONDS = "0";
    process.env.FX_MARKUP_BPS = "0";
    process.env.FX_RATE_API_URL = "https://rates.example.test/latest";
    resetEnvCacheForTests();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
    resetFxCache();
  });

  function stub(body: unknown, status = 200) {
    const fn = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
    globalThis.fetch = fn as unknown as typeof fetch;
    return fn;
  }

  it("builds a quote carrying amount, rate, source and timestamp", async () => {
    stub({ result: "success", rates: { XOF: 655.957 } });
    const q = await getEurXofQuote(10000);
    expect(q).toMatchObject({ eurCents: 10000, xofAmount: 65596, rate: "655.957", source: "rates.example.test", markupBps: 0 });
    expect(q.quotedAt).toBeInstanceOf(Date);
  });

  it("fails closed when the source is down, errors, or does not publish XOF", async () => {
    stub({}, 503);
    await expect(getEurXofQuote(10000)).rejects.toBeInstanceOf(FxUnavailableError);
    stub({ result: "error" });
    await expect(getEurXofQuote(10000)).rejects.toBeInstanceOf(FxUnavailableError);
    stub({ result: "success", rates: { USD: 1.1 } });
    await expect(getEurXofQuote(10000)).rejects.toMatchObject({ detail: "xof_not_published" });
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    await expect(getEurXofQuote(10000)).rejects.toBeInstanceOf(FxUnavailableError);
  });

  it("fails closed on an invalid or implausible rate", async () => {
    stub({ result: "success", rates: { XOF: "oops" } });
    await expect(getEurXofQuote(10000)).rejects.toBeInstanceOf(FxUnavailableError);
    stub({ result: "success", rates: { XOF: 0 } });
    await expect(getEurXofQuote(10000)).rejects.toBeInstanceOf(FxUnavailableError);
    stub({ result: "success", rates: { XOF: 5 } });
    await expect(getEurXofQuote(10000)).rejects.toMatchObject({ detail: "rate_implausible" });
  });

  it("does not reuse a stale rate once the cache TTL expires", async () => {
    process.env.FX_RATE_TTL_SECONDS = "0";
    const fn = stub({ result: "success", rates: { XOF: 655.957 } });
    await getEurXofQuote(10000);
    await getEurXofQuote(10000);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("isQuoteStale", () => {
  it("treats missing and old quotes as stale", () => {
    expect(isQuoteStale(null)).toBe(true);
    expect(isQuoteStale(new Date(Date.now() - 24 * 3600e3))).toBe(true);
    expect(isQuoteStale(new Date())).toBe(false);
  });
});

describe("currency-aware money helpers", () => {
  it("XOF has no minor unit; EUR has two", () => {
    expect(currencyDecimals("XOF")).toBe(0);
    expect(currencyDecimals("xof")).toBe(0);
    expect(currencyDecimals("EUR")).toBe(2);
  });

  it("formats EUR from cents and XOF from whole francs", () => {
    expect(formatMoney(103745, "EUR", "en")).toContain("1,037.45");
    const xof = formatMoney(1000, "XOF", "en");
    expect(xof).toMatch(/1,000/);
    expect(xof).not.toMatch(/\.\d{2}\b/);
    expect(formatMoney(1000, "XOF", "fr").replace(/\s/g, "")).toContain("1000");
  });

  it("sends XOF to GeniusPay as an exact integer and refuses fractional values", () => {
    expect(formatAmountForGeniusPay(1000, "XOF")).toBe(1000);
    expect(formatAmountForGeniusPay(65596, "XOF")).toBe(65596);
    expect(() => formatAmountForGeniusPay(1000.5, "XOF")).toThrow();
  });

  it("keeps the EUR major-unit contract (cents / 100)", () => {
    expect(formatAmountForGeniusPay(103745, "EUR")).toBe(1037.45);
  });

  it("parses provider amounts back to the stored integer; fractional XOF can never match", () => {
    expect(parseAmountFromGeniusPay(1000, "XOF")).toBe(1000);
    expect(parseAmountFromGeniusPay(1037.45, "EUR")).toBe(103745);
    expect(Number.isNaN(parseAmountFromGeniusPay(1000.4, "XOF"))).toBe(true);
  });
});
