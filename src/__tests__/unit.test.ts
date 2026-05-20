import { describe, it, expect } from "vitest";
import { getWhatsAppLink } from "../lib/whatsapp";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth";
import { loginSchema, contactMessageSchema } from "../lib/schemas";

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
});
