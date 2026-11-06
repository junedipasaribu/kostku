import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity-log";
import { destroySession, getSessionUser, isSameOrigin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  const user = await getSessionUser();
  await destroySession();
  if (user) await recordActivity(user, { action: "auth.logout", entityType: "session", summary: "Pengguna keluar." });
  return NextResponse.json({ success: true });
}
