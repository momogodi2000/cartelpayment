import { z } from "zod";

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
    GENIUSPAY_GATEWAY: z.string().optional().default("stripe"),
    
    // Inventory Rules
    HOLD_MINUTES: z.coerce.number().int().positive().default(30),
    
    // Security & Administration
    ENCRYPTION_KEY: z
      .string()
      .min(32, "ENCRYPTION_KEY must be at least 32 characters for AES-256-GCM")
      .default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
    CRON_SECRET: z.string().default("sample_cron_secret_change_me_in_production"),
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
    // Safety guard: Reject live keys if environment is not production or if running in test
    const isLiveKey =
      data.GENIUSPAY_API_KEY.startsWith("pk_live_") ||
      data.GENIUSPAY_API_SECRET.startsWith("sk_live_");

    if (isLiveKey) {
      if (data.NODE_ENV === "test") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Live GeniusPay keys are strictly forbidden in test mode.",
          path: ["GENIUSPAY_API_KEY"],
        });
      }
      if (data.GENIUSPAY_ENVIRONMENT !== "production") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Live GeniusPay keys detected while GENIUSPAY_ENVIRONMENT is not 'production'.",
          path: ["GENIUSPAY_ENVIRONMENT"],
        });
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

export const env = typeof window === "undefined" ? getEnv() : ({} as Env);
