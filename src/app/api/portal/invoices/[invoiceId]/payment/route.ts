import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity-log";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;
const formats = [
  { mime: "image/jpeg", ext: "jpg", check: (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", check: (b: Buffer) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  { mime: "image/webp", ext: "webp", check: (b: Buffer) => b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
];

export async function POST(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  const user = await getSessionUser();
  if (!user?.tenantId || user.role !== "TENANT") return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
  const { invoiceId } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, tenantId: user.tenantId }, select: { id: true, status: true, invoiceNumber: true } });
  if (!invoice) return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
  if (invoice.status !== "UNPAID" && invoice.status !== "OVERDUE") return NextResponse.json({ error: "Tagihan ini sedang menunggu verifikasi atau sudah lunas" }, { status: 409 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 64 * 1024) return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 413 });

  let filePath: string | undefined;
  try {
    const form = await request.formData();
    const file = form.get("proof");
    const method = form.get("method");
    if (!(file instanceof File) || file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: "Pilih bukti pembayaran gambar maksimal 5MB" }, { status: 400 });
    if (typeof method !== "string" || !["Transfer Bank", "QRIS", "Tunai"].includes(method)) return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const format = formats.find((item) => item.mime === file.type && item.check(bytes));
    if (!format) return NextResponse.json({ error: "Bukti harus berupa JPG, PNG, atau WEBP" }, { status: 400 });

    const dir = path.join(process.cwd(), "public", "uploads", "payments");
    await fs.mkdir(dir, { recursive: true });
    const filename = `payment-${randomUUID()}.${format.ext}`;
    filePath = path.join(dir, filename);
    await fs.writeFile(filePath, bytes, { flag: "wx", mode: 0o644 });
    const proofUrl = `/api/payment-proofs/${filename}`;
    const updated = await prisma.invoice.updateMany({
      where: { id: invoice.id, tenantId: user.tenantId, status: { in: ["UNPAID", "OVERDUE"] } },
      data: { paymentProof: proofUrl, paymentMethod: method, status: "PENDING_VERIFICATION", paidAt: null, notes: null },
    });
    if (!updated.count) {
      await fs.rm(filePath, { force: true });
      return NextResponse.json({ error: "Status tagihan sudah berubah. Muat ulang halaman." }, { status: 409 });
    }
    await recordActivity(user, { action: "invoice.payment_submitted", entityType: "invoice", entityId: invoice.id, summary: `Bukti pembayaran ${invoice.invoiceNumber} dikirim untuk verifikasi.` });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (filePath) await fs.rm(filePath, { force: true }).catch(() => undefined);
    console.error("Payment proof upload failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Bukti pembayaran belum dapat dikirim" }, { status: 500 });
  }
}
