import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Akses admin diperlukan" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsedPage = Number(url.searchParams.get("page") ?? 1);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 100_000) : 1;
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const where = query ? {
    OR: [
      { actorName: { contains: query, mode: "insensitive" as const } },
      { action: { contains: query, mode: "insensitive" as const } },
      { entityType: { contains: query, mode: "insensitive" as const } },
      { summary: { contains: query, mode: "insensitive" as const } },
    ],
  } : undefined;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 50,
      take: 50,
      select: { id: true, actorName: true, actorRole: true, action: true, entityType: true, entityId: true, summary: true, createdAt: true },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pageSize: 50 }, { headers: { "Cache-Control": "private, no-store" } });
}
