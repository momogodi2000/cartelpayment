import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWhatsAppLink } from "../lib/whatsapp";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { loginSchema, contactMessageSchema, parrotSchema, blogPostSchema, faqSchema, galleryItemSchema } from "../lib/schemas";
import { checkoutSchema, generateWhatsAppText } from "../lib/checkout";

// Mock next/headers for serverTranslations tests
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

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

  it("should encode special characters and accented letters in text", () => {
    const phone = "50688888888";
    const text = "Bonjour ! Je suis intéressé(e) par le perroquet Ara Macao & son prix.";
    const link = getWhatsAppLink(phone, text);

    expect(link).toContain("https://wa.me/50688888888?text=");
    expect(link).toContain("Bonjour");
    expect(link).toContain("%26");
  });

  it("should produce a valid link even when phone has only digits", () => {
    const link = getWhatsAppLink("15551234567", "Test message");
    expect(link).toBe("https://wa.me/15551234567?text=Test%20message");
  });

  it("should strip all non-digit characters from phone number", () => {
    const link = getWhatsAppLink("+1-800.PARROTS", "Info");
    expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
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

  it("should throw error if secret is missing in production environment", async () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalAuthSecret = process.env.AUTH_SECRET;
    const originalSessionSecret = process.env.SESSION_SECRET;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalVitest = process.env.VITEST;

    const env = process.env as unknown as Record<string, string | undefined>;
    delete env.JWT_SECRET;
    delete env.AUTH_SECRET;
    delete env.SESSION_SECRET;
    delete env.VITEST;
    env.NODE_ENV = "production";

    await expect(
      signToken({ id: "admin-4", email: "missing@arahaven.com", role: "ADMIN" })
    ).rejects.toThrow("Missing JWT_SECRET, AUTH_SECRET, or SESSION_SECRET");

    restoreEnv("JWT_SECRET", originalSecret);
    restoreEnv("AUTH_SECRET", originalAuthSecret);
    restoreEnv("SESSION_SECRET", originalSessionSecret);
    restoreEnv("NODE_ENV", originalNodeEnv);
    restoreEnv("VITEST", originalVitest);
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

    it("should fail if name is too short", () => {
      const result = contactMessageSchema.safeParse({
        name: "A",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "This is a valid message length.",
      });
      expect(result.success).toBe(false);
    });

    it("should allow an optional parrotReference field", () => {
      const result = contactMessageSchema.safeParse({
        name: "Alice Buyer",
        email: "alice@example.com",
        phone: "+1234567890",
        message: "I am interested in the listed parrot.",
        parrotReference: "hyacinth-macaw",
      });
      expect(result.success).toBe(true);
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

    it("should reject an invalid slug with uppercase or spaces", () => {
      const result = parrotSchema.safeParse({
        name: "Macaw",
        slug: "Hyacinth Macaw 2025",
        species: "Ara",
        description: "A valid description that is long enough to pass.",
        shortDescription: "Short desc.",
        age: "1 year",
        origin: "Brazil",
        behavior: "Active",
        feeding: "Seeds",
        domestication: "Hand raised",
        healthNotes: "Healthy",
        price: 1000,
        images: [{ url: "https://example.com/img.jpg", alt: "Macaw", order: 0 }],
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero or negative price", () => {
      const base = {
        name: "Sun Conure",
        slug: "sun-conure",
        species: "Aratinga",
        description: "A vibrant and energetic sun conure from Costa Rica.",
        shortDescription: "Vibrant sun conure.",
        age: "6 months",
        origin: "Costa Rica",
        behavior: "Playful",
        feeding: "Pellets and fruits",
        domestication: "Tame",
        healthNotes: "Clean",
        price: -100,
        images: [{ url: "https://example.com/conure.jpg", alt: "Conure", order: 0 }],
      };
      expect(parrotSchema.safeParse(base).success).toBe(false);
      expect(parrotSchema.safeParse({ ...base, price: 0 }).success).toBe(false);
    });

    it("should reject when images array is empty", () => {
      const result = parrotSchema.safeParse({
        name: "African Grey",
        slug: "african-grey",
        species: "Psittacus erithacus",
        description: "Highly intelligent and long-lived African Grey parrot.",
        shortDescription: "Intelligent African Grey.",
        age: "2 years",
        origin: "DRC",
        behavior: "Curious",
        feeding: "Pellets",
        domestication: "Trained",
        healthNotes: "Vet checked",
        price: 2500,
        images: [],
      });
      expect(result.success).toBe(false);
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

    it("should fail when parrotIds is empty", () => {
      const result = checkoutSchema.safeParse({
        name: "Bob",
        email: "bob@example.com",
        phone: "+1234567",
        country: "Canada",
        preferredContact: "EMAIL",
        parrotIds: [],
      });
      expect(result.success).toBe(false);
    });

    it("should fail for an invalid preferredContact value", () => {
      const result = checkoutSchema.safeParse({
        name: "Alice",
        email: "alice@example.com",
        phone: "+15551234567",
        country: "France",
        preferredContact: "TELEGRAM",
        parrotIds: ["p1"],
      });
      expect(result.success).toBe(false);
    });

    it("should accept PHONE as a valid preferredContact", () => {
      const result = checkoutSchema.safeParse({
        name: "Marc",
        email: "marc@example.com",
        phone: "+33612345678",
        country: "France",
        preferredContact: "PHONE",
        parrotIds: ["parrot-42"],
      });
      expect(result.success).toBe(true);
    });

    it("should allow an empty optional message field", () => {
      const result = checkoutSchema.safeParse({
        name: "Jean",
        email: "jean@example.com",
        phone: "+33699887766",
        country: "France",
        preferredContact: "EMAIL",
        message: "",
        parrotIds: ["parrot-5"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("blogPostSchema", () => {
    const validPost = {
      title: "Top 5 Macaw Care Tips",
      slug: "top-5-macaw-care-tips",
      excerpt: "Essential care guidance for macaw owners new and experienced.",
      content: "This is the full article content with enough detail for the validator.",
      coverImage: "https://images.unsplash.com/photo-1234567890?w=800",
      category: "Care",
      tags: ["macaws", "care"],
      published: true,
      seoTitle: "Top 5 Macaw Care Tips | AraHaven",
      seoDescription: "Learn the top 5 tips for caring for your macaw from our expert breeders.",
    };

    it("should validate a complete blog post", () => {
      expect(blogPostSchema.safeParse(validPost).success).toBe(true);
    });

    it("should fail when title is too short", () => {
      const result = blogPostSchema.safeParse({ ...validPost, title: "Hi" });
      expect(result.success).toBe(false);
    });

    it("should fail when seoDescription exceeds 160 chars", () => {
      const result = blogPostSchema.safeParse({
        ...validPost,
        seoDescription: "A".repeat(161),
      });
      expect(result.success).toBe(false);
    });

    it("should fail when coverImage is not a valid URL", () => {
      const result = blogPostSchema.safeParse({ ...validPost, coverImage: "not-a-url" });
      expect(result.success).toBe(false);
    });
  });

  describe("faqSchema", () => {
    it("should validate a valid FAQ entry", () => {
      const result = faqSchema.safeParse({
        question: "How long do macaws live in captivity?",
        answer: "Macaws can live 50 to 80 years with proper care, diet, and veterinary attention.",
        order: 1,
      });
      expect(result.success).toBe(true);
    });

    it("should fail when question is too short", () => {
      const result = faqSchema.safeParse({
        question: "Why",
        answer: "Because they do.",
        order: 0,
      });
      expect(result.success).toBe(false);
    });

    it("should apply default order of 0", () => {
      const result = faqSchema.safeParse({
        question: "What do parrots eat daily?",
        answer: "A balanced diet of pellets, fruits, vegetables, and occasional seeds.",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe(0);
      }
    });
  });

  describe("galleryItemSchema", () => {
    it("should validate a complete gallery item", () => {
      const result = galleryItemSchema.safeParse({
        title: "Hyacinth Macaw Feeding",
        type: "IMAGE",
        url: "https://images.unsplash.com/photo-example",
        caption: "Our Hyacinth enjoying fresh palm nuts.",
        category: "Feeding",
        order: 3,
      });
      expect(result.success).toBe(true);
    });

    it("should fail when url is not a valid URL", () => {
      const result = galleryItemSchema.safeParse({
        title: "Gallery Item",
        type: "IMAGE",
        url: "invalid-url",
        caption: "A caption.",
        category: "Nature",
      });
      expect(result.success).toBe(false);
    });

    it("should accept VIDEO as a valid media type", () => {
      const result = galleryItemSchema.safeParse({
        title: "Baby Parrots",
        type: "VIDEO",
        url: "https://youtube.com/watch?v=abc123",
        caption: "Newborn African Greys at 2 weeks.",
        category: "Nursery",
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

  it("should include email and phone in the message body", () => {
    const message = generateWhatsAppText(
      {
        name: "Jean Dupont",
        email: "jean@dupont.fr",
        phone: "+33699887766",
        country: "France",
        preferredContact: "PHONE",
        message: "",
        parrotIds: ["p-3"],
      },
      [{ name: "Blue-throated Macaw", species: "Ara glaucogularis" }]
    );

    expect(message).toContain("Email: jean@dupont.fr");
    expect(message).toContain("Phone: +33699887766");
    expect(message).toContain("Blue-throated Macaw");
    expect(message).toContain("Preferred Contact: PHONE");
  });

  it("should format a single parrot inquiry correctly", () => {
    const message = generateWhatsAppText(
      {
        name: "Solo Buyer",
        email: "solo@example.com",
        phone: "+15550001111",
        country: "Canada",
        preferredContact: "WHATSAPP",
        message: "Only one bird for me!",
        parrotIds: ["solo-parrot"],
      },
      [{ name: "Cockatoo", species: "Cacatua alba" }]
    );

    expect(message).toContain("- Cockatoo (Cacatua alba)");
    expect(message).toContain("Only one bird for me!");
    expect(message).toContain("Solo Buyer");
  });
});

describe("Server Translations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 'en' locale when no locale cookie is present", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    const { getServerLocale } = await import("../lib/serverTranslations");
    const locale = await getServerLocale();
    expect(locale).toBe("en");
  });

  it("returns 'fr' locale when locale cookie is set to 'fr'", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ name: "locale", value: "fr" }),
    } as never);

    const { getServerLocale } = await import("../lib/serverTranslations");
    const locale = await getServerLocale();
    expect(locale).toBe("fr");
  });

  it("falls back to 'en' when cookies() throws an error", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockRejectedValue(new Error("Cannot access cookies outside request"));

    const { getServerLocale } = await import("../lib/serverTranslations");
    const locale = await getServerLocale();
    expect(locale).toBe("en");
  });

  it("getServerTranslation returns a t() function and the locale", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ name: "locale", value: "en" }),
    } as never);

    const { getServerTranslation } = await import("../lib/serverTranslations");
    const { t, locale } = await getServerTranslation();

    expect(locale).toBe("en");
    expect(typeof t).toBe("function");
    expect(t("nav.home")).toBe("Home");
  });

  it("getServerTranslation t() returns French strings when locale is 'fr'", async () => {
    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: () => ({ name: "locale", value: "fr" }),
    } as never);

    const { getServerTranslation } = await import("../lib/serverTranslations");
    const { t, locale } = await getServerTranslation();

    expect(locale).toBe("fr");
    expect(t("nav.home")).toBe("Accueil");
    expect(t("nav.catalog")).toBe("Annuaire des Oiseaux");
  });
});
