import { z } from "zod";

// Admin Authentication Schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Contact Message Schema (including Honeypot checks)
export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 characters").max(20),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  parrotReference: z.string().optional().nullable(),
  // Honeypot fields to filter out spam bots
  website: z.string().max(0, "Spam detected").optional(),
  middle_name: z.string().max(0, "Spam detected").optional(),
});

// Enum mappings for Zod validation (matching Prisma enums)
export const SizeEnum = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export const SexEnum = z.enum(["MALE", "FEMALE", "UNKNOWN"]);
export const RarityEnum = z.enum(["COMMON", "RARE", "EXCEPTIONAL"]);
export const ParrotStatusEnum = z.enum(["AVAILABLE", "RESERVED", "SOLD"]);
export const MediaTypeEnum = z.enum(["IMAGE", "VIDEO"]);

// Parrot Image Schema
export const parrotImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().min(1, "Alt text is required"),
  order: z.number().int().default(0),
});

// Parrot CRUD Schema
export const parrotSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  species: z.string().min(2, "Species must be at least 2 characters"),
  originCountry: z.string().optional().default(""),
  category: z.string().optional().default(""),
  temperament: z.string().optional().default(""),
  lifespan: z.string().optional().default(""),
  diet: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  talkingAbility: z.string().optional().default(""),
  intelligenceLevel: z.string().optional().default(""),
  trainingDifficulty: z.string().optional().default(""),
  socialBehavior: z.string().optional().default(""),
  careLevel: z.string().optional().default(""),
  seoDescription: z.string().max(180).optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  careInstructions: z.string().optional().default(""),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(5, "Short description must be at least 5 characters").max(255),
  age: z.string().min(1, "Age is required"),
  size: SizeEnum.default("MEDIUM"),
  sex: SexEnum.default("UNKNOWN"),
  origin: z.string().min(2, "Origin is required"),
  rarity: RarityEnum.default("COMMON"),
  price: z.number().positive("Price must be a positive number"),
  status: ParrotStatusEnum.default("AVAILABLE"),
  behavior: z.string().min(2, "Behavior description is required"),
  feeding: z.string().min(2, "Feeding description is required"),
  domestication: z.string().min(2, "Domestication description is required"),
  healthNotes: z.string().min(2, "Health notes are required"),
  featured: z.boolean().default(false),
  images: z.array(parrotImageSchema).min(1, "At least one image is required"),
});

// Blog Post CRUD Schema
export const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(300),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url("Invalid cover image URL"),
  category: z.string().min(2, "Category is required"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  seoTitle: z.string().min(5, "SEO Title is required").max(100),
  seoDescription: z.string().min(10, "SEO Description is required").max(160),
});

// Gallery Item CRUD Schema
export const galleryItemSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  type: MediaTypeEnum.default("IMAGE"),
  url: z.string().url("Invalid media URL"),
  caption: z.string().min(2, "Caption is required").max(255),
  category: z.string().min(2, "Category is required"),
  order: z.number().int().default(0),
});

// FAQ CRUD Schema
export const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters").max(255),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  order: z.number().int().default(0),
});
