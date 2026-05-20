import { describe, it, expect } from "vitest";
import { getWhatsAppLink } from "../lib/whatsapp";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { loginSchema, contactMessageSchema, parrotSchema } from "../lib/schemas";
import { checkoutSchema, generateWhatsAppText } from "../lib/checkout";

function restoreEnv(name: string, value: string | undefined) {
  const env = process.env as unknown as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[name];
  } else {
    env[name] = value;
  }
}

describe("WhatsApp Utilities", () => {
  it("should generate a clean WhatsApp wa.me link with encoded text", () => {
    const phone = "+506 8888-8888";
    const text = "Hello Breeder!";
    const link = getWhatsAppLink(phone, text);
    
    expect(link).toBe("https://wa.me/50688888888?text=Hello%20Breeder!");
  });

  it("should handle extra characters and spaces correctly", () => {
    const phone = "  +1 (555) 123-4567  ";
    const text = "Baby Parrot";
    const link = getWhatsAppLink(phone, text);
    
    expect(link).toBe("https://wa.me/15551234567?text=Baby%20Parrot");
  });
});

describe("Auth Utilities", () => {
  it("should hash and verify passwords successfully", async () => {
    const password = "securepassword123";
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("wrongpassword", hash);
    expect(isInvalid).toBe(false);
  });

  it("should sign and verify JWT tokens successfully", async () => {
    const user = {
      id: "admin-1",
      email: "admin@arahaven.com",
      role: "ADMIN",
    };

    const token = await signToken(user);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const payload = await verifyToken(token);
    expect(payload).toBeDefined();
    expect(payload?.id).toBe(user.id);
    expect(payload?.email).toBe(user.email);
    expect(payload?.role).toBe(user.role);
  });

  it("should return null for invalid or tampered JWT tokens", async () => {
    const payload = await verifyToken("invalid-token-string");
    expect(payload).toBeNull();
  });

  it("should use configured secrets when provided", async () => {
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "configured-test-secret-that-is-long-enough";

    const token = await signToken({
      id: "admin-2",
      email: "configured@arahaven.com",
      role: "SUPERADMIN",
    });
    const payload = await verifyToken(token);

    expect(payload?.email).toBe("configured@arahaven.com");
    restoreEnv("JWT_SECRET", originalSecret);
  });

  it("should reject short production secrets", async () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const env = process.env as unknown as Record<string, string | undefined>;
    process.env.JWT_SECRET = "short";
    env.NODE_ENV = "production";

    await expect(
      signToken({ id: "admin-3", email: "short@arahaven.com", role: "ADMIN" })
    ).rejects.toThrow("at least 32 characters");

    restoreEnv("JWT_SECRET", originalSecret);
    restoreEnv("NODE_ENV", originalNodeEnv);
  });
});

describe("Zod Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should pass for valid admin credentials", () => {
      const result = loginSchema.safeParse({
        email: "admin@arahaven.com",
        password: "securepassword",
      });
      expect(result.success).toBe(true);
    });

    it("should fail for invalid emails or short passwords", () => {
      const resultEmail = loginSchema.safeParse({
        email: "not-an-email",
        password: "securepassword",
      });
      expect(resultEmail.success).toBe(false);

      const resultPass = loginSchema.safeParse({
        email: "admin@arahaven.com",
        password: "123",
      });
      expect(resultPass.success).toBe(false);
    });
  });

  describe("contactMessageSchema", () => {
    it("should pass for a valid message", () => {
      const result = contactMessageSchema.safeParse({
        name: "Alice",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "Hi there! I am interested in your parrots.",
      });
      expect(result.success).toBe(true);
    });

    it("should trigger honeypot trap if bot fills website or middle name", () => {
      const resultBot1 = contactMessageSchema.safeParse({
        name: "Alice",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "Hi there! I am interested in your parrots.",
        website: "http://bot-link.com",
      });
      expect(resultBot1.success).toBe(false);

      const resultBot2 = contactMessageSchema.safeParse({
        name: "Alice",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "Hi there! I am interested in your parrots.",
        middle_name: "SneakyBot",
      });
      expect(resultBot2.success).toBe(false);
    });

    it("should fail if message is too short", () => {
      const resultShort = contactMessageSchema.safeParse({
        name: "Alice",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "Short",
      });
      expect(resultShort.success).toBe(false);
    });
  });

  describe("parrotSchema", () => {
    it("should accept enriched premium parrot data", () => {
      const result = parrotSchema.safeParse({
        name: "Hyacinth Macaw",
        slug: "hyacinth-macaw-test",
        species: "Anodorhynchus hyacinthinus",
        originCountry: "Brazil",
        category: "macaws",
        temperament: "Gentle and intelligent",
        lifespan: "50-60 years",
        diet: "Palm nuts, pellets, vegetables, and tropical fruit",
        weight: "1.2-1.7 kg",
        talkingAbility: "Moderate",
        intelligenceLevel: "Exceptional",
        trainingDifficulty: "Intermediate",
        socialBehavior: "Deeply bonded with steady handlers",
        careLevel: "Expert",
        seoDescription: "Premium captive-bred Hyacinth Macaw profile.",
        tags: ["macaws", "rare"],
        careInstructions: "Provide daily enrichment and avian veterinary care.",
        description: "A premium, hand-raised Hyacinth Macaw profile with complete care data.",
        shortDescription: "Premium hand-raised Hyacinth Macaw.",
        age: "8 months",
        size: "LARGE",
        sex: "MALE",
        origin: "Brazil (Captive Bred)",
        rarity: "EXCEPTIONAL",
        price: 9500,
        status: "AVAILABLE",
        behavior: "Gentle and confident.",
        feeding: "High-fat macaw diet.",
        domestication: "Step-up trained.",
        healthNotes: "Vet checked.",
        featured: true,
        images: [{ url: "https://example.com/macaw.webp", alt: "Hyacinth Macaw", order: 0 }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("checkoutSchema", () => {
    it("should validate a complete inquiry checkout", () => {
      const result = checkoutSchema.safeParse({
        name: "Alice Buyer",
        email: "alice@example.com",
        phone: "+15551234567",
        country: "United States",
        preferredContact: "WHATSAPP",
        message: "Please send care records.",
        parrotIds: ["parrot-1"],
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("Checkout WhatsApp Message", () => {
  it("should generate a useful checkout summary for selected birds", () => {
    const message = generateWhatsAppText(
      {
        name: "Alice Buyer",
        email: "alice@example.com",
        phone: "+15551234567",
        country: "United States",
        preferredContact: "WHATSAPP",
        message: "Please send care records.",
        parrotIds: ["parrot-1", "parrot-2"],
      },
      [
        { name: "Hyacinth Macaw", species: "Anodorhynchus hyacinthinus" },
        { name: "African Grey", species: "Psittacus erithacus" },
      ]
    );

    expect(message).toContain("Alice Buyer");
    expect(message).toContain("Hyacinth Macaw");
    expect(message).toContain("African Grey");
    expect(message).toContain("Please send care records.");
  });

  it("should generate an email-preferred checkout summary without optional message", () => {
    const message = generateWhatsAppText(
      {
        name: "Marc Buyer",
        email: "marc@example.com",
        phone: "+33123456789",
        country: "France",
        preferredContact: "EMAIL",
        message: "",
        parrotIds: ["parrot-1"],
      },
      [{ name: "Sun Conure", species: "Aratinga solstitialis" }]
    );

    expect(message).toContain("Preferred Contact: EMAIL");
    expect(message).toContain("Sun Conure");
    expect(message).not.toContain("My message");
  });
});
