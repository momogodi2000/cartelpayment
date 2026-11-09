import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "../env";

const env = getEnv();

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Generates parameters for client-side direct upload to Cloudinary.
 */
export function generateSignedUploadParams(folder = "pawelium/animals"): SignedUploadParams {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET || "dummy_secret"
  );

  return {
    timestamp,
    signature,
    apiKey: env.CLOUDINARY_API_KEY || "",
    cloudName: env.CLOUDINARY_CLOUD_NAME || "",
    folder,
  };
}

/**
 * Validates uploaded file MIME types and size boundaries.
 */
export function validateUploadFile(
  mimeType: string,
  sizeBytes: number
): { valid: boolean; error?: string } {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";

  if (!isImage && !isVideo && !isPdf) {
    return { valid: false, error: "Unsupported file type. Only images, videos, and PDFs are permitted." };
  }

  // Size constraints: Images 10MB, Video 100MB, PDF 15MB
  if (isImage && sizeBytes > 10 * 1024 * 1024) {
    return { valid: false, error: "Image file exceeds 10MB limit." };
  }
  if (isVideo && sizeBytes > 100 * 1024 * 1024) {
    return { valid: false, error: "Video file exceeds 100MB limit." };
  }
  if (isPdf && sizeBytes > 15 * 1024 * 1024) {
    return { valid: false, error: "PDF file exceeds 15MB limit." };
  }

  return { valid: true };
}
