# Card checkout: GeniusPay + Paystack (XOF), marketplace in EUR

## How it works

| Layer | Currency | Where |
| --- | --- | --- |
| Marketplace, order summary, emails, revenue reports | EUR | `Order.totalCents` / `Order.currency` (never mutated) |
| Card charge through GeniusPay → Paystack | XOF, whole francs | `Payment.amountCents` / `Payment.currency` |
| Original amount + conversion record | EUR + rate | `Payment.originalAmountCents`, `originalCurrency`, `fxRate`, `fxSource`, `fxQuotedAt` |

1. The checkout page shows the EUR price, then the **amount actually charged in XOF**, the rate, and a required consent checkbox.
2. `startCheckout` re-computes the quote on the server and refuses (`QUOTE_CHANGED`) if it differs from what the customer authorized.
3. `initializeCardPayment` sends `POST /payments` with `currency=XOF`, an **integer** `amount`, and `payment_method=paystack`. The `gateway` field only accepts mobile-money values (HTTP 422).
4. The customer is redirected to the checkout URL returned by GeniusPay (`checkout.paystack.com`), unmodified.
5. Order and reservation change state only from the authoritative provider status (webhook → `GET /payments/{ref}` → `settlePaymentAuthoritative`), which checks reference, amount (whole XOF) and currency.

## FX policy (`src/lib/services/payments/fx.ts`)

- Source: `FX_RATE_API_URL` (default ExchangeRate-API open endpoint; the ECB/Frankfurter feed does **not** publish XOF). Attribution is required by that service's terms.
- Integer-only math (scaled `BigInt`, 6 decimals), rounding **half up to a whole franc**, optional `FX_MARKUP_BPS` (default 0) folded into the disclosed rate.
- Implausible rates (outside 100–2000 XOF/EUR), missing XOF, HTTP errors or timeouts → `FX_UNAVAILABLE`; card payment is blocked. There is no hardcoded or stale fallback.
- A retry of the same order reuses the original quote for up to `FX_QUOTE_MAX_AGE_SECONDS`; after that a changed amount must be re-authorized (`QUOTE_CHANGED`).

## Routing (`gateway-registry.ts`, admin override: `payments.gateways` setting)

| Gateway | State | Currency |
| --- | --- | --- |
| Paystack | enabled, active | XOF |
| Stripe | retained, **disabled** (GeniusPay: "Your account cannot currently make live charges") | EUR |
| PaiementPro, CinetPay, default route | disabled | – |
| Wave, PawaPay, PAL | mobile money, never card-eligible | – |

A gateway is only tried after a **safe** failure of the previous one; ambiguous initializations are reconciled against the provider first and never retried elsewhere. A fallback gateway of another currency re-prices the `Payment` row only because earlier attempts produced no payable session.

## Reactivating Stripe

1. Run `npm run probe:gateways -- --confirm` and confirm `payment_method=stripe` returns 201 on a Stripe checkout host in EUR.
2. In `/admin/payments` (or the `payments.gateways` setting) set `stripe.enabled = true`. Stripe (priority 1, EUR) is then tried first; Paystack stays the XOF fallback. The checkout hides the XOF disclosure automatically when the primary gateway charges EUR.
3. Note: if Stripe fails and Paystack takes over, the XOF fallback requires the customer's prior XOF authorization; without it the XOF gateway is skipped (no silent charge in another currency).

## Controlled 1,000 XOF live test

`/admin/test-payment` (SUPER_ADMIN): creates an `isTest` order on the internal €1.00 test dog and a Payment of exactly **1,000 XOF** (`fxSource = TEST_FIXED_XOF`). It never alters a real animal's price. The charge is made by the person paying on the provider page with their own card/wallet. After paying, use "Refresh" on the test order, or wait for the webhook, then check the history table.

Webhooks need a public `NEXT_PUBLIC_SITE_URL` (`/api/payments/geniuspay/webhook` configured in the GeniusPay dashboard); on localhost use the Refresh action, which queries the authoritative status.

## Deploy checklist

- Apply migrations `0005_payment_fx_quote` (Postgres) / `20261113090000_payment_fx_quote` (SQLite) with `npm run db:migrate:deploy`.
- Set the `FX_*` variables (see `.env.example`).
- Re-run `npm run probe:gateways -- --xof --confirm` after any credential change.
