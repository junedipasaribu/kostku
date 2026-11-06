import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      preferredTheme: user.preferredTheme,
      preferredBackground: user.preferredBackground,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
