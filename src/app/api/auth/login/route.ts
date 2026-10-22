import { NextResponse } from "next/server";
import { createSession, isSameOrigin, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024) {
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid || user.role === "TENANT") {
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ user: { name: user.name, role: user.role } });
}
