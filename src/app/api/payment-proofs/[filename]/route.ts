import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const types: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 401 });
  const { filename } = await params;
  const match = /^payment-[0-9a-f-]+\.(jpg|png|webp)$/i.exec(filename);
  if (!match) return new NextResponse(null, { status: 404 });
  const proofUrl = `/api/payment-proofs/${filename}`;
  const invoice = await prisma.invoice.findFirst({ where: { paymentProof: proofUrl }, select: { tenantId: true } });
  if (!invoice || (user.role === "TENANT" ? user.tenantId !== invoice.tenantId : user.role !== "OWNER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
  }
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), "public", "uploads", "payments", filename));
    return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": types[match[1].toLowerCase()], "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
