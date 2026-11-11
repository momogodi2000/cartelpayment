# GeniusPay gateway probe

Run: 2026-11-11T05:40:26.925Z · environment: production · EUR amount unit: major

Each row created at most one unpaid €1.00 EUR session (expires after 24 h). No card was charged.

| Variant | HTTP | Echoed gateway / error | Checkout host | Currency | Amount | Usable for EUR card | Provider message |
| --- | --- | --- | --- | --- | --- | --- | --- |
| default routing (payment_method=card) | 400 | PAYMENT_INIT_FAILED | - | - | - | - | Failed to initialize transaction: {"status":false,"message":"\"amount\" must be an integer","meta":{"nextStep":"Ensure that you're passing your amount correctly |
| gateway=stripe | 422 | - | - | - | - | - | validation.in |
| payment_method=stripe | 400 | PAYMENT_INIT_FAILED | - | - | - | - | Failed to create checkout session: Your account cannot currently make live charges. |
| gateway=paystack | 422 | - | - | - | - | - | validation.in |
| payment_method=paystack | 400 | PAYMENT_INIT_FAILED | - | - | - | - | Failed to initialize transaction: {"status":false,"message":"\"amount\" must be an integer","meta":{"nextStep":"Ensure that you're passing your amount correctly |
| gateway=paiementpro | 422 | - | - | - | - | - | validation.in |
| payment_method=paiementpro | 201 | paiementpro | www.paiementpro.net | XOF | 610.7 | no |  |
| gateway=paiement_pro | 422 | - | - | - | - | - | validation.in |
| payment_method=paiement_pro | 422 | - | - | - | - | - | validation.in |
| gateway=cinetpay | 422 | - | - | - | - | - | validation.in |
| payment_method=cinetpay | 400 | PAYMENT_INIT_FAILED | - | - | - | - | cURL error 6: Could not resolve host: api-checkout.cinetpay.com (see https://curl.se/libcurl/c/libcurl-errors.html) for https://api-checkout.cinetpay.com/v2/pay |
