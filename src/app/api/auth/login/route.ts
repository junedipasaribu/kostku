import { NextResponse } from "next/server";
import { createSession, isSameOrigin, verifyPassword } from "@/lib/auth";
import { checkLoginRateLimit, clearLoginFailures, recordFailedLogin } from "@/lib/login-rate-limit";
import { prisma } from "@/lib/prisma";
import { readJsonRequest } from "@/lib/request-body";

export const runtime = "nodejs";
const DUMMY_PASSWORD_HASH = "scrypt$kostku-login-equalization-salt$865f021dd775468899b92252035e32bb56fd82ed391cb94deff72f0283cb6bc4b867a2f34364a7747cca384bb92edf3464760634daa95d397b3ea481c3547726";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  }

  const limit = checkLoginRateLimit(request);
  if (limit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi beberapa menit." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await readJsonRequest(request, 2048);
  } catch {
    recordFailedLogin(limit.key);
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024) {
    recordFailedLogin(limit.key);
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { tenantProfile: { select: { id: true, status: true } } },
  });
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid || !user.isActive || (user.role === "TENANT" && (!user.tenantProfile || user.tenantProfile.status !== "ACTIVE"))) {
    recordFailedLogin(limit.key);
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }

  clearLoginFailures(limit.key);
  await createSession(user.id);
  return NextResponse.json({ user: { name: user.name, role: user.role } });
}
