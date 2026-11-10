import { z } from "zod";

// Development-only fallbacks. Production startup rejects them explicitly.
const DEV_ENCRYPTION_KEY = "dev-only-0123456789abcdef0123456789abcdef0123456789abcdef";
const DEV_CRON_SECRET = "dev-only-cron-secret-change-me";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    
    // Site Identity
    NEXT_PUBLIC_SITE_NAME: z.string().default("Pawelium"),
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default("contact@pawelium.fyi"),
    
    // WhatsApp Channels
    NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default("+33641325328"),
    NEXT_PUBLIC_PARTNER_WHATSAPP_NUMBER: z.string().optional().default("33641325328"),
    
    // Business Identity
    NEXT_PUBLIC_LEGAL_SIREN: z.string().optional().default(""),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional().default(""),
    
    // Database
    DATABASE_PROVIDER: z.enum(["sqlite", "postgresql"]).default("sqlite"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_DATABASE_URL: z.string().optional().default(""),
    
    // GeniusPay Merchant API
    GENIUSPAY_BASE_URL: z.string().url().default("https://geniuspay.ci/api/v1/merchant"),
    GENIUSPAY_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
    GENIUSPAY_API_KEY: z.string().min(1, "GENIUSPAY_API_KEY is required"),
    GENIUSPAY_API_SECRET: z.string().min(1, "GENIUSPAY_API_SECRET is required"),
    GENIUSPAY_WEBHOOK_SECRET: z.string().min(1, "GENIUSPAY_WEBHOOK_SECRET is required"),
    GENIUSPAY_AMOUNT_UNIT: z.enum(["major", "minor"]).default("major"),
    GENIUSPAY_PAYMENT_METHOD: z.string().default("card"),
    GENIUSPAY_TIMEOUT_MS: z.coerce.number().int().min(2000).max(30000).default(10000),
    
    // Inventory Rules
    HOLD_MINUTES: z.coerce.number().int().positive().default(30),
    
    // Security & Administration
    // Development-only fallbacks; production refuses them (see superRefine below).
    ENCRYPTION_KEY: z
      .string()
      .min(32, "ENCRYPTION_KEY must be at least 32 characters for AES-256-GCM")
      .default(DEV_ENCRYPTION_KEY),
    CRON_SECRET: z.string().min(16).default(DEV_CRON_SECRET),
    ADMIN_BOOTSTRAP_PASSWORD: z.string().optional(),
    
    // Transactional Email (Resend)
    RESEND_API_KEY: z.string().optional().default(""),
    EMAIL_FROM: z.string().default("Pawelium Concierge <contact@pawelium.fyi>"),
    
    // Media Storage (Cloudinary)
    CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
    CLOUDINARY_API_KEY: z.string().optional().default(""),
    CLOUDINARY_API_SECRET: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });

    const isLiveKey =
      data.GENIUSPAY_API_KEY.startsWith("pk_live_") || data.GENIUSPAY_API_SECRET.startsWith("sk_live_");
    const isSandboxKey = /^(pk_sandbox_|pk_test_|sbx_test_)/.test(data.GENIUSPAY_API_KEY) ||
      /^(sk_sandbox_|sk_test_|sbx_test_)/.test(data.GENIUSPAY_API_SECRET);

    // Live keys: never in tests, and only with an explicit production payment environment.
    if (isLiveKey && data.NODE_ENV === "test") {
      issue("GENIUSPAY_API_KEY", "Live GeniusPay keys are forbidden in test mode.");
    }
    if (isLiveKey && data.GENIUSPAY_ENVIRONMENT !== "production") {
      issue("GENIUSPAY_ENVIRONMENT", "Live GeniusPay keys require GENIUSPAY_ENVIRONMENT=production.");
    }
    // Sandbox keys must never be used for a production payment environment.
    if (isSandboxKey && data.GENIUSPAY_ENVIRONMENT === "production") {
      issue("GENIUSPAY_ENVIRONMENT", "Sandbox GeniusPay keys cannot be used with GENIUSPAY_ENVIRONMENT=production.");
    }

    // Production deployments must not run on development fallback secrets.
    if (data.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      if (data.ENCRYPTION_KEY === DEV_ENCRYPTION_KEY) {
        issue("ENCRYPTION_KEY", "ENCRYPTION_KEY must be set explicitly in production.");
      }
      if (data.CRON_SECRET === DEV_CRON_SECRET) {
        issue("CRON_SECRET", "CRON_SECRET must be set explicitly in production.");
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  // If running in browser, avoid throwing on server-only secrets
  if (typeof window !== "undefined") {
    return (parsedEnv || {
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
      NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "Pawelium",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@pawelium.fyi",
      NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+33641325328",
      NEXT_PUBLIC_PARTNER_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_PARTNER_WHATSAPP_NUMBER || "33641325328",
      NEXT_PUBLIC_LEGAL_SIREN: process.env.NEXT_PUBLIC_LEGAL_SIREN || "",
      NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
      DATABASE_PROVIDER: "sqlite",
      DATABASE_URL: "",
      DIRECT_DATABASE_URL: "",
      GENIUSPAY_BASE_URL: "https://geniuspay.ci/api/v1/merchant",
      GENIUSPAY_ENVIRONMENT: "sandbox",
      GENIUSPAY_API_KEY: "",
      GENIUSPAY_API_SECRET: "",
      GENIUSPAY_WEBHOOK_SECRET: "",
      GENIUSPAY_AMOUNT_UNIT: "major",
      GENIUSPAY_PAYMENT_METHOD: "card",
      GENIUSPAY_TIMEOUT_MS: 10000,
      HOLD_MINUTES: 30,
      ENCRYPTION_KEY: "",
      CRON_SECRET: "",
      ADMIN_BOOTSTRAP_PASSWORD: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "contact@pawelium.fyi",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
    }) as Env;
  }

  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment configuration. Check your .env setup.");
  }

  parsedEnv = result.data;
  return parsedEnv;
}

/** Test-only: forget the cached environment so a test can change process.env values. */
export function resetEnvCacheForTests(): void {
  if (process.env.NODE_ENV !== "test") throw new Error("resetEnvCacheForTests is test-only");
  parsedEnv = null;
}

export const env = typeof window === "undefined" ? getEnv() : ({} as Env);
