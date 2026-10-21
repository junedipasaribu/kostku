import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "node:path";
import fs from "fs/promises";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;
const imageTypes = [
  {
    contentType: "image/jpeg",
    extension: ".jpg",
    matches: (bytes: Buffer) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    contentType: "image/png",
    extension: ".png",
    matches: (bytes: Buffer) => bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    contentType: "image/webp",
    extension: ".webp",
    matches: (bytes: Buffer) => bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
  },
];

export async function POST(req: NextRequest) {
  // This prototype has no server-side authentication yet. Never expose a writable upload route in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Upload dinonaktifkan sampai autentikasi server tersedia" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Ukuran unggahan maksimal 5MB" }, { status: 413 });
  }

  try {
    const formData = await req.formData();
    const entry = formData.get("file");

    if (!(entry instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    const file = entry;

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const detectedType = imageTypes.find((type) => type.matches(bytes));
    if (!detectedType || file.type !== detectedType.contentType) {
      return NextResponse.json({ error: "File harus berupa gambar (JPG, PNG, WEBP)" }, { status: 400 });
    }

    // Target directory: public/uploads/rooms
    const uploadDir = path.join(process.cwd(), "public", "uploads", "rooms");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `room-${randomUUID()}${detectedType.extension}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, bytes, { flag: "wx", mode: 0o644 });

    const publicUrl = `/uploads/rooms/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error("Upload error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Gagal menyimpan file gambar" }, { status: 500 });
  }
}
