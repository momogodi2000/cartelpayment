import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { UTApi, UTFile } from "uploadthing/server";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extensionByType[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Invalid type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 5 MB." }, { status: 400 });
  }

  const filename = `parrot_${Date.now()}_${randomUUID().slice(0, 8)}.${ext}`;

  if (process.env.UPLOADTHING_TOKEN) {
    const utapi = new UTApi();
    const uploadFile = new UTFile([file], filename, {
      type: file.type,
      customId: `${user.id}-parrot-${Date.now()}`,
    });
    const result = await utapi.uploadFiles(uploadFile, {
      contentDisposition: "inline",
    });

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error?.message || "UploadThing upload failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: result.data.ufsUrl || result.data.url,
      key: result.data.key,
      fileHash: result.data.fileHash,
      provider: "uploadthing",
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = join(process.cwd(), "public", "uploads", "parrots");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/parrots/${filename}`, provider: "local" });
}
