# GeniusPay Gateway Probe Report
**Executed at:** 2026-11-10T00:19:41.547Z
**Environment:** production
**Endpoint:** https://geniuspay.ci/api/v1/merchant

| Candidate Gateway | Accepted | HTTP Status | Error Code / Details | Checkout Host | Mode |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **default** | ✅ PASS | 201 | Ref: MTX-UAF0OUUBYY | checkout.paystack.com | N/A |
| **stripe** | ❌ REJECT | 422 | : Une erreur est survenue | N/A | N/A |
| **paystack** | ❌ REJECT | 422 | : Une erreur est survenue | N/A | N/A |
| **paiementpro** | ❌ REJECT | 422 | : Une erreur est survenue | N/A | N/A |
| **cinetpay** | ❌ REJECT | 422 | : Une erreur est survenue | N/A | N/A |