import { NextResponse } from "next/server";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readJsonRequest } from "@/lib/request-body";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sesi login tidak ditemukan" }, { status: 401 });

  let body: unknown;
  try {
    body = await readJsonRequest(request, 2048);
  } catch {
    return NextResponse.json({ error: "Preferensi tidak valid" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Preferensi tidak valid" }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const update: { preferredTheme?: string; preferredBackground?: string | null } = {};

  if ("theme" in input) {
    if (input.theme !== "dark" && input.theme !== "light") return NextResponse.json({ error: "Tema tidak valid" }, { status: 400 });
    update.preferredTheme = input.theme;
  }
  if ("backgroundColor" in input) {
    if (input.backgroundColor !== null && (typeof input.backgroundColor !== "string" || !/^#[0-9a-f]{6}$/i.test(input.backgroundColor))) {
      return NextResponse.json({ error: "Warna latar tidak valid" }, { status: 400 });
    }
    update.preferredBackground = input.backgroundColor as string | null;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Tidak ada preferensi untuk disimpan" }, { status: 400 });

  const preferences = await prisma.user.update({
    where: { id: user.id },
    data: update,
    select: { preferredTheme: true, preferredBackground: true },
  });
  return NextResponse.json(preferences, { headers: { "Cache-Control": "private, no-store" } });
}
