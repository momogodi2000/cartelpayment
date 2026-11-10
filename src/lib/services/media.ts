/**
 * src/lib/services/media.ts — Cloudinary media for animal listings.
 *
 * Uploads go directly from the SUPER_ADMIN's browser to Cloudinary with parameters signed
 * here (Netlify functions cannot receive large request bodies). After the upload the asset
 * is re-read through the Cloudinary Admin API and validated (folder, type, format, size)
 * before anything is attached to a listing — the browser's report is never trusted.
 *
 * Veterinary/pedigree documents are uploaded as `authenticated` assets (no public URL) and
 * served only through short-lived signed URLs after an admin session check.
 */
import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "../env";

export type MediaKind = "image" | "video" | "document";

const RULES: Record<MediaKind, { resourceType: "image" | "video" | "raw"; formats: string[]; maxBytes: number; type: "upload" | "authenticated"; folder: string }> = {
  image: { resourceType: "image", formats: ["jpg", "jpeg", "png", "webp", "avif"], maxBytes: 10 * 1024 * 1024, type: "upload", folder: "pawelium/animals/images" },
  video: { resourceType: "video", formats: ["mp4", "webm", "mov"], maxBytes: 100 * 1024 * 1024, type: "upload", folder: "pawelium/animals/videos" },
  // PDFs are stored as `image` resources so Cloudinary can validate the format; kept private.
  document: { resourceType: "image", formats: ["pdf", "jpg", "jpeg", "png"], maxBytes: 15 * 1024 * 1024, type: "authenticated", folder: "pawelium/animals/documents" },
};

export function isMediaConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function configure() {
  const env = getEnv();
  if (!isMediaConfigured()) throw new Error("MEDIA_NOT_CONFIGURED");
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  return env;
}

export interface SignedUpload {
  uploadUrl: string;
  fields: Record<string, string>;
  maxBytes: number;
  accept: string;
}

/** Signed parameters for one direct browser upload of the given kind into the animal's folder. */
export function createSignedUpload(kind: MediaKind, animalId: string): SignedUpload {
  const env = configure();
  const rule = RULES[kind];
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    timestamp,
    folder: `${rule.folder}/${animalId}`,
    type: rule.type,
    allowed_formats: rule.formats.join(","),
  };
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${rule.resourceType}/upload`,
    fields: { ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), signature, api_key: env.CLOUDINARY_API_KEY },
    maxBytes: rule.maxBytes,
    accept: rule.formats.map((f) => (f === "pdf" ? "application/pdf" : `${rule.resourceType === "video" ? "video" : "image"}/${f === "jpg" ? "jpeg" : f}`)).join(","),
  };
}

export interface VerifiedAsset {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
}

/** Re-reads an uploaded asset from Cloudinary and checks it matches what was authorised. */
export async function verifyUploadedAsset(kind: MediaKind, animalId: string, publicId: string): Promise<VerifiedAsset> {
  configure();
  const rule = RULES[kind];
  if (!publicId.startsWith(`${rule.folder}/${animalId}/`)) throw new Error("MEDIA_FOLDER_MISMATCH");
  const res = await cloudinary.api.resource(publicId, { resource_type: rule.resourceType, type: rule.type });
  const format = String(res.format || "").toLowerCase();
  if (!rule.formats.includes(format)) throw new Error("MEDIA_FORMAT_REJECTED");
  if (Number(res.bytes) > rule.maxBytes) throw new Error("MEDIA_TOO_LARGE");
  return { publicId, url: String(res.secure_url), format, bytes: Number(res.bytes) };
}

/** Short-lived signed URL for a private document (admin-only route checks the session first). */
export function signedDocumentUrl(publicId: string, format: string, expiresInSeconds = 300): string {
  configure();
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "image",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
}

export async function deleteAsset(kind: MediaKind, publicId: string): Promise<void> {
  if (!isMediaConfigured()) return;
  configure();
  const rule = RULES[kind];
  await cloudinary.uploader.destroy(publicId, { resource_type: rule.resourceType, type: rule.type }).catch(() => undefined);
}
