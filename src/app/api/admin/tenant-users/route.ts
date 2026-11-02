import { NextResponse } from "next/server";
import { getSessionUser, hashPassword, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readJsonRequest } from "@/lib/request-body";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Akses admin diperlukan" }, { status: 403 });
}

function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

export async function GET() {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) return unauthorized();

  const tenants = await prisma.tenant.findMany({
    where: { userId: { not: null }, legacyId: { not: null } },
    select: {
      id: true,
      legacyId: true,
      fullName: true,
      phone: true,
      status: true,
      room: { select: { roomNumber: true } },
      user: { select: { id: true, email: true, isActive: true } },
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({
    accounts: tenants.flatMap((tenant) => tenant.user ? [{
      tenantId: tenant.legacyId,
      profileId: tenant.id,
      name: tenant.fullName,
      phone: tenant.phone,
      roomNumber: tenant.room.roomNumber,
      userId: tenant.user.id,
      email: tenant.user.email,
      isActive: tenant.user.isActive && tenant.status === "ACTIVE",
    }] : []),
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) return unauthorized();

  let body: unknown;
  try {
    body = await readJsonRequest(request, 16 * 1024);
  } catch {
    return NextResponse.json({ error: "Data tidak valid atau terlalu besar" }, { status: 400 });
  }

  const bodyRecord = asRecord(body);
  const tenant = asRecord(bodyRecord?.tenant);
  const room = asRecord(bodyRecord?.room);
  const email = typeof bodyRecord?.email === "string" ? bodyRecord.email.trim().toLowerCase() : "";
  const password = bodyRecord?.password;
  const fullName = typeof tenant?.fullName === "string" ? tenant.fullName.trim() : "";
  const legacyId = typeof tenant?.id === "string" ? tenant.id.trim() : "";
  const idCardNumber = typeof tenant?.idCardNumber === "string" ? tenant.idCardNumber.trim().slice(0, 32) : null;
  const roomNumber = typeof room?.roomNumber === "string" ? room.roomNumber.trim() : "";
  const roomType = room?.type;
  const priceMonthly = Number(room?.priceMonthly);
  const startDate = typeof tenant?.startDate === "string" ? new Date(tenant.startDate) : new Date(Number.NaN);
  const depositAmount = Number(tenant?.depositAmount ?? 0);
  const floor = Number(room?.floor);

  if (!tenant || !room || !legacyId || legacyId.length > 120 || !fullName || fullName.length > 160 || tenant.status !== "ACTIVE" || !roomNumber || roomNumber.length > 40 ||
    !validEmail(email) || typeof password !== "string" || password.length < 12 || password.length > 1024 ||
    !Number.isFinite(priceMonthly) || priceMonthly < 0 || !Number.isFinite(depositAmount) || depositAmount < 0 ||
    !Number.isInteger(floor) || floor < 1 || floor > 100 ||
    !["Executive", "Deluxe", "Superior", "Standard"].includes(String(roomType)) || Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Periksa data penghuni, email, dan kata sandi (minimal 12 karakter)." }, { status: 400 });
  }

  const type = String(roomType);
  const size = typeof room.size === "string" ? room.size.slice(0, 80) : null;
  const facilities = Array.isArray(room.facilities)
    ? room.facilities.filter((value: unknown): value is string => typeof value === "string").slice(0, 40).map((value: string) => value.trim().slice(0, 80))
    : [];
  const phone = typeof tenant.phone === "string" ? tenant.phone.trim().slice(0, 40) : "";
  const emergencyName = typeof tenant.emergencyContactName === "string" ? tenant.emergencyContactName.trim() : "";
  const emergencyPhone = typeof tenant.emergencyContactPhone === "string" ? tenant.emergencyContactPhone.trim() : "";
  const emergencyContact = [emergencyName, emergencyPhone].filter(Boolean).join(" • ").slice(0, 160) || null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const roomRecord = await tx.room.upsert({
        where: { roomNumber },
        create: {
          roomNumber,
          type,
          priceMonthly,
          floor,
          size,
          status: "OCCUPIED",
          facilities,
          images: [],
          description: null,
        },
        update: {},
      });

      const existingTenant = await tx.tenant.findUnique({ where: { legacyId }, select: { id: true, userId: true } });
      if (existingTenant?.userId) throw new Error("ACCOUNT_EXISTS");

      const passwordHash = await hashPassword(password);
      const user = await tx.user.create({
        data: { email, name: fullName, phone: phone || null, role: "TENANT", passwordHash },
        select: { id: true, email: true, isActive: true },
      });

      const profile = existingTenant
        ? await tx.tenant.update({
            where: { id: existingTenant.id },
            data: { userId: user.id, roomId: roomRecord.id, fullName, phone, idCardNumber, startDate, depositAmount, emergencyContact, status: "ACTIVE" },
          })
        : await tx.tenant.create({
            data: { legacyId, userId: user.id, roomId: roomRecord.id, fullName, phone, idCardNumber, startDate, depositAmount, emergencyContact, status: "ACTIVE" },
          });

      return { tenantId: legacyId, profileId: profile.id, userId: user.id, email: user.email, isActive: user.isActive, name: fullName, phone, roomNumber };
    });
    return NextResponse.json({ account: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_EXISTS") {
      return NextResponse.json({ error: "Penghuni ini sudah memiliki akun login." }, { status: 409 });
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email tersebut sudah digunakan akun lain." }, { status: 409 });
    }
    return NextResponse.json({ error: "Akun belum dapat dibuat. Periksa skema database dan coba lagi." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 403 });
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) return unauthorized();

  let body: unknown;
  try {
    body = await readJsonRequest(request, 16 * 1024);
  } catch {
    return NextResponse.json({ error: "Data tidak valid atau terlalu besar" }, { status: 400 });
  }

  const bodyRecord = asRecord(body);
  const tenantId = typeof bodyRecord?.tenantId === "string" ? bodyRecord.tenantId : "";
  const email = typeof bodyRecord?.email === "string" ? bodyRecord.email.trim().toLowerCase() : "";
  const password = bodyRecord?.password;
  const isActive = bodyRecord?.isActive;
  if (!tenantId || !validEmail(email) || typeof isActive !== "boolean" ||
    (password !== undefined && password !== "" && (typeof password !== "string" || password.length < 12 || password.length > 1024))) {
    return NextResponse.json({ error: "Email, status akun, atau kata sandi tidak valid." }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { legacyId: tenantId }, select: { userId: true, status: true } });
  if (!tenant?.userId) return NextResponse.json({ error: "Akun penghuni tidak ditemukan." }, { status: 404 });
  if (isActive && tenant.status !== "ACTIVE") return NextResponse.json({ error: "Penghuni sudah tidak aktif; akses portal tidak dapat diaktifkan." }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tenant.userId! },
        data: {
          email,
          isActive,
          ...(typeof password === "string" && password ? { passwordHash: await hashPassword(password) } : {}),
        },
      });
      if (!isActive || (typeof password === "string" && password)) {
        await tx.session.deleteMany({ where: { userId: tenant.userId! } });
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Email tersebut sudah digunakan akun lain." }, { status: 409 });
    }
    return NextResponse.json({ error: "Perubahan akun belum dapat disimpan." }, { status: 500 });
  }
}
