/**
 * A local HTTP server implementing the documented GeniusPay endpoints used by Pawelium.
 * Exercises the real GeniusPay client over HTTP (no in-process mocking) so routing,
 * fallback classification and reconciliation are tested end-to-end.
 */
import http from "node:http";
import type { AddressInfo } from "node:net";

export interface FakeRequest {
  method: string;
  path: string;
  body: any;
}

export type CreateBehavior =
  | { kind: "success"; gateway: string | null; currency?: string; host?: string }
  | { kind: "http"; status: number; body?: any }
  | { kind: "hang" } // never answers -> client timeout (ambiguous), no session created
  | { kind: "hangAfterCreate"; gateway: string | null } // session IS created, response lost
  | { kind: "garbage" }; // 200 with an unusable body (ambiguous)

export class FakeGeniusPay {
  private server = http.createServer((req, res) => this.handle(req, res));
  public requests: FakeRequest[] = [];
  /** Behaviour per requested gateway (key "default" = no gateway field). */
  public createBehavior: Record<string, CreateBehavior> = {};
  /** Payments known to the fake provider, by reference. */
  public payments = new Map<string, { createdAt: string; status: string; amount: number; currency: string; metadata: any; phone: string; checkoutUrl: string; gateway: string | null }>();
  private seq = 0;
  /** When true, the documented search endpoint fails (provider unreachable during reconciliation). */
  public searchFails = false;

  async start(): Promise<string> {
    await new Promise<void>((resolve) => this.server.listen(0, "127.0.0.1", resolve));
    const { port } = this.server.address() as AddressInfo;
    return `http://127.0.0.1:${port}/api/v1/merchant`;
  }

  async stop() {
    this.server.closeAllConnections?.();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  createRequests() {
    return this.requests.filter((r) => r.method === "POST" && r.path === "/api/v1/merchant/payments");
  }

  private send(res: http.ServerResponse, status: number, body: any) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  }

  private handle(req: http.IncomingMessage, res: http.ServerResponse) {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const url = new URL(req.url || "/", "http://localhost");
      let body: any = null;
      try {
        body = raw ? JSON.parse(raw) : null;
      } catch {
        body = raw;
      }
      this.requests.push({ method: req.method || "GET", path: url.pathname, body });

      if (req.headers["x-api-key"] === undefined || req.headers["x-api-secret"] === undefined) {
        return this.send(res, 401, { success: false, error: { code: "MISSING_API_KEY", message: "missing" } });
      }

      if (req.method === "POST" && url.pathname === "/api/v1/merchant/payments") {
        const key = body?.gateway || (body?.payment_method && body.payment_method !== "card" ? body.payment_method : "default");
        const behavior = this.createBehavior[key] ?? { kind: "http", status: 422, body: { success: false, error: { code: "VALIDATION_ERROR", message: "Une erreur est survenue" } } };
        if (behavior.kind === "hang") return; // client aborts on timeout
        if (behavior.kind === "hangAfterCreate") {
          const reference = `MTX-HIDDEN${String(++this.seq).padStart(5, "0")}`;
          this.payments.set(reference, {
            createdAt: new Date().toISOString(),
            status: "pending",
            amount: body.amount,
            currency: body.currency,
            metadata: body.metadata,
            phone: body.customer?.phone,
            checkoutUrl: `https://checkout.paystack.com/c/${reference}`,
            gateway: behavior.gateway,
          });
          return; // the provider created the session but the response never arrives
        }
        if (behavior.kind === "garbage") return this.send(res, 200, "<html>oops</html>");
        if (behavior.kind === "http") return this.send(res, behavior.status, behavior.body ?? { success: false });

        const reference = `MTX-FAKE${String(++this.seq).padStart(6, "0")}`;
        const host = behavior.host ?? (behavior.gateway === "stripe" ? "checkout.stripe.com" : behavior.gateway === "paystack" ? "checkout.paystack.com" : "geniuspay.ci");
        const checkoutUrl = `https://${host}/c/${reference}`;
        const currency = behavior.currency ?? body.currency;
        this.payments.set(reference, {
          createdAt: new Date().toISOString(),
          status: "pending",
          amount: body.amount,
          currency,
          metadata: body.metadata,
          phone: body.customer?.phone,
          checkoutUrl,
          gateway: behavior.gateway,
        });
        return this.send(res, 201, {
          success: true,
          data: { id: this.seq, reference, amount: body.amount, currency, status: "pending", checkout_url: checkoutUrl, gateway: behavior.gateway, metadata: body.metadata, environment: "sandbox", expires_at: new Date(Date.now() + 24 * 3600e3).toISOString() },
        });
      }

      if (req.method === "GET" && url.pathname === "/api/v1/merchant/payments") {
        if (this.searchFails) return this.send(res, 503, { success: false });
        const search = url.searchParams.get("search") || "";
        const data = [...this.payments.entries()]
          .filter(([, p]) => p.phone === search)
          .map(([reference, p]) => ({ reference, amount: p.amount, currency: p.currency, status: p.status, created_at: p.createdAt }));
        return this.send(res, 200, { success: true, data, meta: { current_page: 1 } });
      }

      const m = url.pathname.match(/^\/api\/v1\/merchant\/payments\/([^/]+)$/);
      if (req.method === "GET" && m) {
        const p = this.payments.get(decodeURIComponent(m[1]));
        if (!p) return this.send(res, 404, { success: false, error: { code: "TRANSACTION_NOT_FOUND", message: "Transaction not found" } });
        return this.send(res, 200, {
          success: true,
          data: { reference: m[1], status: p.status, amount: p.amount, currency: p.currency, metadata: p.metadata, payment_url: p.checkoutUrl, gateway: p.gateway },
        });
      }

      this.send(res, 404, { success: false });
    });
  }

  /** Simulates a session that exists at the provider although the create call timed out. */
  addHiddenSession(reference: string, data: { amount: number; currency: string; phone: string; attemptRef: string; gateway: string | null }) {
    this.payments.set(reference, {
      createdAt: new Date().toISOString(),
      status: "pending",
      amount: data.amount,
      currency: data.currency,
      metadata: { attempt_ref: data.attemptRef },
      phone: data.phone,
      checkoutUrl: `https://checkout.paystack.com/c/${reference}`,
      gateway: data.gateway,
    });
  }
}
