import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readJsonRequest } from "@/lib/request-body";

export const runtime = "nodejs";

type RecordValue = Record<string, unknown>;
const roomTypes = ["Executive", "Deluxe", "Superior", "Standard"];
const depositStatuses = ["HELD", "REFUNDED", "DEDUCTED"];

function asRecord(value: unknown): RecordValue | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function errorResponse(status = 403) {
  return NextResponse.json({ error: "Akses admin diperlukan" }, { status });
}

function hasAdminRole(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? parsed : null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || !hasAdminRole(user.role)) return errorResponse();

  const tenants = await prisma.tenant.findMany({
    select: {
      legacyId: true,
      id: true,
      roomId: true,
      fullName: true,
      phone: true,
      idCardNumber: true,
      emergencyContact: true,
      startDate: true,
      endDate: true,
      depositAmount: true,
      depositStatus: true,
      status: true,
      room: { select: { roomNumber: true, type: true, priceMonthly: true, size: true, floor: true, facilities: true, images: true, status: true } },
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ tenants: tenants.map((tenant) => {
    const [emergencyContactName = "", emergencyContactPhone = ""] = (tenant.emergencyContact ?? "").split(" • ", 2);
    return {
      id: tenant.legacyId ?? tenant.id,
      roomId: tenant.roomId,
      roomNumber: tenant.room.roomNumber,
      room: tenant.room,
      fullName: tenant.fullName,
      phone: tenant.phone,
      idCardNumber: tenant.idCardNumber ?? "",
      emergencyContactName,
      emergencyContactPhone,
      startDate: tenant.startDate.toISOString().slice(0, 10),
      endDate: tenant.endDate?.toISOString().slice(0, 10),
      depositAmount: tenant.depositAmount,
      depositStatus: tenant.depositStatus,
      status: tenant.status,
    };
  }) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse();
  const user = await getSessionUser();
  if (!user || !hasAdminRole(user.role)) return errorResponse();

  let body: unknown;
  try {
    body = await readJsonRequest(request, 2 * 1024 * 1024);
  } catch {
    return NextResponse.json({ error: "Data tidak valid atau terlalu besar" }, { status: 400 });
  }

  const input = asRecord(body);
  const tenants = input?.tenants;
  const rooms = input?.rooms;
  if (!Array.isArray(tenants) || tenants.length < 1 || tenants.length > 500 || !Array.isArray(rooms) || rooms.length > 200) {
    return NextResponse.json({ error: "Data penghuni tidak valid" }, { status: 400 });
  }

  const roomByNumber = new Map<string, RecordValue>();
  for (const value of rooms) {
    const room = asRecord(value);
    if (room && typeof room.roomNumber === "string") roomByNumber.set(room.roomNumber.trim(), room);
  }

  const parsed = tenants.map((value) => {
    const tenant = asRecord(value);
    const fullName = typeof tenant?.fullName === "string" ? tenant.fullName.trim() : "";
    const phone = typeof tenant?.phone === "string" ? tenant.phone.trim() : "";
    const roomNumber = typeof tenant?.roomNumber === "string" ? tenant.roomNumber.trim() : "";
    const legacyId = typeof tenant?.id === "string" ? tenant.id.trim() : "";
    const startDateText = typeof tenant?.startDate === "string" ? tenant.startDate : "";
    const startDate = parseDateOnly(startDateText);
    const room = roomByNumber.get(roomNumber);
    const priceMonthly = Number(room?.priceMonthly);
    const floor = Number(room?.floor);
    const roomType = String(room?.type ?? "");
    const depositAmount = Number(tenant?.depositAmount);
    const depositStatus = String(tenant?.depositStatus ?? "HELD");
    const status = String(tenant?.status ?? "ACTIVE");

    if (!fullName || fullName.length > 160 || !phone || phone.length > 40 || !roomNumber || roomNumber.length > 40 ||
      legacyId.length > 120 || !startDate || !room || !roomTypes.includes(roomType) ||
      !Number.isFinite(priceMonthly) || priceMonthly < 0 || !Number.isInteger(floor) || floor < 1 || floor > 100 ||
      !Number.isFinite(depositAmount) || depositAmount < 0 || !depositStatuses.includes(depositStatus) || !["ACTIVE", "ENDED"].includes(status)) {
      return null;
    }

    const emergencyName = typeof tenant?.emergencyContactName === "string" ? tenant.emergencyContactName.trim().slice(0, 100) : "";
    const emergencyPhone = typeof tenant?.emergencyContactPhone === "string" ? tenant.emergencyContactPhone.trim().slice(0, 40) : "";
    const emergencyContact = [emergencyName, emergencyPhone].filter(Boolean).join(" • ").slice(0, 160) || null;
    const endDateText = typeof tenant?.endDate === "string" ? tenant.endDate : "";
    const endDate = endDateText ? parseDateOnly(endDateText) : null;
    if (endDateText && !endDate) return null;

    return {
      legacyId: legacyId || randomUUID(),
      room: {
        roomNumber,
        type: roomType,
        priceMonthly,
        floor,
        size: typeof room.size === "string" ? room.size.slice(0, 80) : null,
        facilities: Array.isArray(room.facilities)
          ? room.facilities.filter((item): item is string => typeof item === "string").slice(0, 40).map((item) => item.trim().slice(0, 80))
          : [],
      },
      profile: {
        fullName,
        phone,
        idCardNumber: typeof tenant?.idCardNumber === "string" ? tenant.idCardNumber.trim().slice(0, 32) || null : null,
        emergencyContact,
        startDate,
        endDate,
        depositAmount,
        depositStatus: depositStatus as "HELD" | "REFUNDED" | "DEDUCTED",
        status,
      },
    };
  });

  if (parsed.some((item) => item === null)) {
    return NextResponse.json({ error: "Periksa kembali nama, kamar, tanggal, dan data sewa penghuni" }, { status: 400 });
  }

  try {
    const saved = await prisma.$transaction(async (tx) => {
      const result: string[] = [];
      for (const item of parsed) {
        if (!item) continue;
        const existing = await tx.tenant.findUnique({
          where: { legacyId: item.legacyId },
          select: { id: true, idCardNumber: true, emergencyContact: true },
        });
        if (existing) {
          const privateFields: { idCardNumber?: string; emergencyContact?: string } = {};
          if (!existing.idCardNumber && item.profile.idCardNumber) privateFields.idCardNumber = item.profile.idCardNumber;
          if (!existing.emergencyContact && item.profile.emergencyContact) privateFields.emergencyContact = item.profile.emergencyContact;
          if (Object.keys(privateFields).length > 0) {
            await tx.tenant.update({ where: { id: existing.id }, data: privateFields });
          }
          result.push(item.legacyId);
          continue;
        }
        const room = await tx.room.upsert({
          where: { roomNumber: item.room.roomNumber },
          create: { ...item.room, status: item.profile.status === "ACTIVE" ? "OCCUPIED" : "AVAILABLE", images: [] },
          update: {},
          select: { id: true },
        });
        await tx.tenant.create({
          data: { legacyId: item.legacyId, roomId: room.id, ...item.profile },
          select: { id: true },
        });
        result.push(item.legacyId);
      }
      return result;
    });

    return NextResponse.json({ success: true, count: saved.length, legacyIds: saved });
  } catch {
    return NextResponse.json({ error: "Data penghuni belum dapat disimpan ke database" }, { status: 500 });
  }
}
