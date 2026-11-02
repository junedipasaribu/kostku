import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser, isSameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readJsonRequest } from "@/lib/request-body";

export const runtime = "nodejs";

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const roomTypes = ["Executive", "Deluxe", "Superior", "Standard"];
const roomStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const;
const expenseCategories = ["Listrik", "Air/PDAM", "WiFi", "Kebersihan & Sampah", "Maintenance & Perbaikan"];
const invoiceStatuses = ["UNPAID", "PENDING_VERIFICATION", "PAID", "OVERDUE"] as const;
const complaintStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as JsonRecord : null;
}

function dateOnly(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const result = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(result.getTime()) && result.toISOString().slice(0, 10) === value ? result : null;
}

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function positiveAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000_000 ? amount : null;
}

function forbidden() {
  return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
}

function invalid(message = "Data tidak valid") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return forbidden();
  if (user.role === "TENANT") {
    if (!user.tenantId) return forbidden();
    const complaints = await prisma.complaint.findMany({
      where: { tenantId: user.tenantId },
      select: { id: true, title: true, description: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ complaints: complaints.map((complaint) => ({
      ...complaint,
      date: complaint.createdAt.toISOString().slice(0, 10),
    })) }, { headers: { "Cache-Control": "private, no-store" } });
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") return forbidden();

  const [rooms, invoices, expenses, complaints, building] = await Promise.all([
    prisma.room.findMany({
      include: {
        tenants: { where: { status: "ACTIVE" }, select: { fullName: true }, take: 1 },
        maintenanceLogs: { orderBy: { date: "desc" } },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    }),
    prisma.invoice.findMany({ include: { tenant: true, room: true }, orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }] }),
    prisma.expense.findMany({ orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }] }),
    prisma.complaint.findMany({ include: { tenant: true, room: true }, orderBy: { createdAt: "desc" } }),
    prisma.buildingConfig.findUnique({ where: { id: "default" } }),
  ]);

  return NextResponse.json({
    rooms: rooms.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      priceMonthly: room.priceMonthly,
      floor: room.floor,
      size: room.size ?? "",
      status: room.status,
      facilities: room.facilities,
      tenantName: room.tenants[0]?.fullName,
      image: room.images[0] ?? "",
      maintenanceLog: room.maintenanceLogs.map((log) => ({
        id: log.id,
        date: log.date.toISOString().slice(0, 10),
        description: log.description,
        cost: log.cost ?? undefined,
        technician: log.technician ?? undefined,
      })),
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      tenantId: invoice.tenant.legacyId ?? invoice.tenant.id,
      tenantName: invoice.tenant.fullName,
      tenantPhone: invoice.tenant.phone,
      roomNumber: invoice.room.roomNumber,
      periodMonth: monthNames[invoice.periodMonth - 1] ?? String(invoice.periodMonth),
      periodYear: invoice.periodYear,
      amount: invoice.amount,
      dueDate: invoice.dueDate.toISOString().slice(0, 10),
      status: invoice.status,
      paymentProof: invoice.paymentProof ?? undefined,
      paymentMethod: invoice.paymentMethod ?? undefined,
      paidAt: invoice.paidAt?.toISOString() ?? undefined,
    })),
    expenses: expenses.map((expense) => ({
      id: expense.id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.expenseDate.toISOString().slice(0, 10),
    })),
    complaints: complaints.map((complaint) => ({
      id: complaint.id,
      tenantId: complaint.tenant.legacyId ?? complaint.tenant.id,
      tenantName: complaint.tenant.fullName,
      roomNumber: complaint.room.roomNumber,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      date: complaint.createdAt.toISOString().slice(0, 10),
    })),
    building: building ? {
      name: building.name,
      tagline: building.tagline,
      address: building.address,
      ownerName: building.ownerName,
      ownerPhone: building.ownerPhone,
      bankName: building.bankName,
      bankAccount: building.bankAccount,
      bankHolder: building.bankHolder,
      qrisUrl: building.qrisUrl ?? "",
      rules: building.rules,
      sharedFacilities: building.sharedFacilities,
    } : null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden();
  const user = await getSessionUser();
  if (!user) return forbidden();

  let body: unknown;
  try {
    body = await readJsonRequest(request, 32 * 1024);
  } catch {
    return invalid("Data tidak valid atau terlalu besar");
  }
  const input = record(body);
  const action = text(input?.action, 40);
  const data = record(input?.data);
  if (!data) return invalid();

  if (action === "complaint.create") {
    if (user.role !== "TENANT" || !user.tenantId) return forbidden();
    const title = text(data.title, 120);
    const description = text(data.description, 2000);
    if (!title || !description) return invalid("Judul dan keterangan komplain wajib diisi");
    const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { id: true, roomId: true, status: true } });
    if (!tenant || tenant.status !== "ACTIVE") return forbidden();
    const complaint = await prisma.complaint.create({ data: { tenantId: tenant.id, roomId: tenant.roomId, title, description } });
    return NextResponse.json({ success: true, id: complaint.id }, { status: 201 });
  }

  if (user.role !== "OWNER" && user.role !== "ADMIN") return forbidden();

  try {
    switch (action) {
      case "room.create": {
        const roomNumber = text(data.roomNumber, 40);
        const type = text(data.type, 40);
        const priceMonthly = positiveAmount(data.priceMonthly);
        const floor = Number(data.floor);
        const facilities = Array.isArray(data.facilities) ? data.facilities.filter((item): item is string => typeof item === "string").slice(0, 40).map((item) => item.trim().slice(0, 80)) : [];
        const image = text(data.image, 1000);
        const status = roomStatuses.includes(data.status as typeof roomStatuses[number]) ? data.status as typeof roomStatuses[number] : "AVAILABLE";
        if (!roomNumber || !roomTypes.includes(type) || priceMonthly === null || priceMonthly <= 0 || !Number.isInteger(floor) || floor < 1 || floor > 100) return invalid("Data kamar tidak valid");
        const room = await prisma.room.create({
          data: { roomNumber, type, priceMonthly, floor, size: text(data.size, 80) || null, status, facilities, images: image ? [image] : [] },
        });
        return NextResponse.json({ success: true, id: room.id }, { status: 201 });
      }
      case "room.update": {
        const id = text(data.id, 80);
        const roomNumber = text(data.roomNumber, 40);
        const type = text(data.type, 40);
        const priceMonthly = positiveAmount(data.priceMonthly);
        const floor = Number(data.floor);
        const status = data.status;
        const facilities = Array.isArray(data.facilities) ? data.facilities.filter((item): item is string => typeof item === "string").slice(0, 40).map((item) => item.trim().slice(0, 80)) : [];
        const image = text(data.image, 1000);
        if (!id || !roomNumber || !roomTypes.includes(type) || priceMonthly === null || priceMonthly <= 0 || !Number.isInteger(floor) || floor < 1 || floor > 100 || !roomStatuses.includes(status as typeof roomStatuses[number])) return invalid("Data kamar tidak valid");
        await prisma.room.update({ where: { id }, data: { roomNumber, type, priceMonthly, floor, size: text(data.size, 80) || null, status: status as typeof roomStatuses[number], facilities, images: image ? [image] : [] } });
        return NextResponse.json({ success: true });
      }
      case "room.status": {
        const id = text(data.id, 80);
        const status = data.status;
        if (!id || !roomStatuses.includes(status as typeof roomStatuses[number])) return invalid("Status kamar tidak valid");
        await prisma.room.update({ where: { id }, data: { status: status as typeof roomStatuses[number] } });
        return NextResponse.json({ success: true });
      }
      case "room.delete": {
        const id = text(data.id, 80);
        if (!id) return invalid();
        const [tenants, invoices, complaints] = await Promise.all([
          prisma.tenant.count({ where: { roomId: id } }),
          prisma.invoice.count({ where: { roomId: id } }),
          prisma.complaint.count({ where: { roomId: id } }),
        ]);
        if (tenants || invoices || complaints) return NextResponse.json({ error: "Kamar memiliki riwayat penghuni/transaksi dan tidak dapat dihapus." }, { status: 409 });
        await prisma.room.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }
      case "maintenance.create": {
        const roomId = text(data.roomId, 80);
        const description = text(data.description, 1000);
        const date = dateOnly(data.date);
        const cost = data.cost === undefined || data.cost === null ? null : positiveAmount(data.cost);
        if (!roomId || !description || !date || (data.cost !== undefined && data.cost !== null && cost === null)) return invalid("Catatan perbaikan tidak valid");
        const log = await prisma.roomMaintenanceLog.create({ data: { roomId, description, date, cost, technician: text(data.technician, 120) || null } });
        return NextResponse.json({ success: true, id: log.id }, { status: 201 });
      }
      case "expense.create": {
        const category = text(data.category, 80);
        const description = text(data.description, 500);
        const amount = positiveAmount(data.amount);
        const expenseDate = dateOnly(data.date);
        if (!expenseCategories.includes(category) || !description || amount === null || !expenseDate) return invalid("Data pengeluaran tidak valid");
        const expense = await prisma.expense.create({ data: { category, description, amount, expenseDate } });
        return NextResponse.json({ success: true, id: expense.id }, { status: 201 });
      }
      case "invoice.create": {
        const tenantKey = text(data.tenantId, 120);
        const periodMonth = Number(data.periodMonth);
        const periodYear = Number(data.periodYear);
        const dueDate = dateOnly(data.dueDate);
        if (!tenantKey || !Number.isInteger(periodMonth) || periodMonth < 1 || periodMonth > 12 || !Number.isInteger(periodYear) || periodYear < 2020 || periodYear > 2100 || !dueDate) return invalid("Periode tagihan tidak valid");
        const tenant = await prisma.tenant.findFirst({ where: { OR: [{ id: tenantKey }, { legacyId: tenantKey }], status: "ACTIVE" }, include: { room: true } });
        if (!tenant) return invalid("Penghuni aktif tidak ditemukan");
        const previous = await prisma.invoice.findFirst({ where: { tenantId: tenant.id, periodMonth, periodYear }, select: { id: true } });
        if (previous) return NextResponse.json({ error: "Tagihan untuk periode tersebut sudah ada" }, { status: 409 });
        const invoiceNumber = `INV-${periodYear}${String(periodMonth).padStart(2, "0")}-${randomUUID().slice(0, 8).toUpperCase()}`;
        const invoice = await prisma.invoice.create({ data: { invoiceNumber, tenantId: tenant.id, roomId: tenant.roomId, periodMonth, periodYear, amount: tenant.room.priceMonthly, dueDate } });
        return NextResponse.json({ success: true, id: invoice.id }, { status: 201 });
      }
      case "invoice.status": {
        const id = text(data.id, 80);
        const status = data.status;
        if (!id || !invoiceStatuses.includes(status as typeof invoiceStatuses[number])) return invalid("Status tagihan tidak valid");
        await prisma.invoice.update({ where: { id }, data: { status: status as typeof invoiceStatuses[number], paidAt: status === "PAID" ? new Date() : null } });
        return NextResponse.json({ success: true });
      }
      case "complaint.status": {
        const id = text(data.id, 80);
        const status = data.status;
        if (!id || !complaintStatuses.includes(status as typeof complaintStatuses[number])) return invalid("Status komplain tidak valid");
        await prisma.complaint.update({ where: { id }, data: { status: status as typeof complaintStatuses[number], resolvedAt: status === "RESOLVED" ? new Date() : null } });
        return NextResponse.json({ success: true });
      }
      case "building.update": {
        const values = {
          name: text(data.name, 120),
          tagline: text(data.tagline, 180),
          address: text(data.address, 300),
          ownerName: text(data.ownerName, 120),
          ownerPhone: text(data.ownerPhone, 32),
          bankName: text(data.bankName, 80),
          bankAccount: text(data.bankAccount, 64),
          bankHolder: text(data.bankHolder, 120),
          qrisUrl: text(data.qrisUrl, 1000) || null,
          rules: Array.isArray(data.rules) ? data.rules.filter((item): item is string => typeof item === "string").slice(0, 30).map((item) => item.trim().slice(0, 300)) : [],
          sharedFacilities: Array.isArray(data.sharedFacilities) ? data.sharedFacilities.filter((item): item is string => typeof item === "string").slice(0, 30).map((item) => item.trim().slice(0, 160)) : [],
        };
        if (!values.name || !values.ownerName) return invalid("Nama kost dan pengelola wajib diisi");
        await prisma.buildingConfig.upsert({ where: { id: "default" }, create: { id: "default", ...values }, update: values });
        return NextResponse.json({ success: true });
      }
      default:
        return invalid("Aksi tidak dikenali");
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: action === "invoice.create" ? "Tagihan untuk periode tersebut sudah ada" : "Nomor kamar atau data unik sudah digunakan" }, { status: 409 });
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ error: "Perubahan belum dapat disimpan" }, { status: 500 });
  }
}
