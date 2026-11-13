# GeniusPay gateway probe

Run: 2026-11-13T11:19:34.992Z · environment: production · currency: XOF · amount unit: whole XOF

Each row created at most one unpaid 1,000 XOF session (expires after 24 h). No card was charged.

| Variant | HTTP | Echoed gateway / error | Checkout host | Currency | Amount | Usable for XOF card | Provider message |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default routing (payment_method=card) | 201 | paystack | checkout.paystack.com | XOF | 1000 | YES |  |
| gateway=stripe | 422 | - | - | - | - | - | validation.in |
| payment_method=stripe | 400 | PAYMENT_INIT_FAILED | - | - | - | - | Failed to create checkout session: Your account cannot currently make live charges. |
| gateway=paystack | 422 | - | - | - | - | - | validation.in |
| payment_method=paystack | 201 | paystack | checkout.paystack.com | XOF | 1000 | YES |  |
| gateway=paiementpro | 422 | - | - | - | - | - | validation.in |
| payment_method=paiementpro | 201 | paiementpro | www.paiementpro.net | XOF | 1000 | YES |  |
| gateway=paiement_pro | 422 | - | - | - | - | - | validation.in |
| payment_method=paiement_pro | 422 | - | - | - | - | - | validation.in |
| gateway=cinetpay | 422 | - | - | - | - | - | validation.in |
| payment_method=cinetpay | 400 | PAYMENT_INIT_FAILED | - | - | - | - | cURL error 6: Could not resolve host: api-checkout.cinetpay.com (see https://curl.se/libcurl/c/libcurl-errors.html) for https://api-checkout.cinetpay.com/v2/pay |
