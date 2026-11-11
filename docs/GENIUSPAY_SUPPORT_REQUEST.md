# Message to GeniusPay support (draft — send it yourself, ticket TKT-AF45C8DA)

Subject: EUR card payments on the Pawelium merchant account — Stripe cannot make live charges; other card gateways convert to XOF

Hello,

We integrate the Merchant API (`POST /api/v1/merchant/payments`, live environment) to take **EUR credit/debit card payments** from European customers. Live tests on 2026-11-11 (unpaid €1.00 sessions only, no card charged) show:

1. `payment_method: "stripe"` (currency EUR) → HTTP 400 `PAYMENT_INIT_FAILED`:
   "Failed to create checkout session: **Your account cannot currently make live charges.**"
   → Please enable live charges on the Stripe account linked to our merchant, or tell us what is missing (this is the issue of ticket TKT-AF45C8DA).
2. The `gateway` parameter rejects `stripe`, `paystack`, `paiementpro`, `cinetpay` with HTTP 422 `validation.in`. Only `payment_method` accepts gateway names.
   → Please confirm the correct way to force a card gateway and the exact identifiers.
3. `payment_method: "paystack"` / default `card` routing / `paiementpro` create sessions in **XOF**, not EUR (€1 → 610.7 XOF, €10 → 6107 XOF, €123.45 → 75 390.92 XOF), and Paystack rejects non-integer converted amounts ("amount must be an integer").
   → We cannot accept a conversion to XOF for European customers. Is there a EUR-native card route other than Stripe?
4. `payment_method: "cinetpay"` → "Could not resolve host: api-checkout.cinetpay.com".
5. Is there a **card test mode** for Stripe (test cards such as 4242 4242 4242 4242) on `/sandbox/payments/initiate`? The sandbox documentation only lists mobile-money gateways.
6. Refunds: is there an API endpoint, or must they be issued from the dashboard (the webhook event `payment.refunded` is documented)?

Thank you,
Pawelium
