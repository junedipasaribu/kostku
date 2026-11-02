import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";

export const runtime = "nodejs";

const imageFiles = new Map([
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

function notFound() {
  return new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const match = /^room-[a-f0-9-]{36}\.(jpg|png|webp)$/.exec(filename);
  if (!match) return notFound();

  try {
    const filePath = path.join(process.cwd(), "public", "uploads", "rooms", filename);
    const image = await readFile(filePath);
    const mimeType = imageFiles.get(match[1]);
    if (!mimeType) return notFound();

    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(image.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
