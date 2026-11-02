import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const [building, rooms] = await Promise.all([
    prisma.buildingConfig.findUnique({
      where: { id: "default" },
      select: { name: true, tagline: true, address: true, ownerPhone: true, qrisUrl: true, rules: true, sharedFacilities: true },
    }),
    prisma.room.findMany({
      where: { status: "AVAILABLE" },
      select: { id: true, roomNumber: true, type: true, priceMonthly: true, floor: true, size: true, facilities: true, images: true },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    }),
  ]);

  return NextResponse.json({
    building: building ? { ...building, ownerPhone: building.ownerPhone.replace(/\D/g, "") } : null,
    rooms: rooms.map((room) => ({ ...room, image: room.images[0] ?? "" })),
  }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
