import { CalendarDays, Home, Shield } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initialBuildingInfo } from "@/lib/data";

function getJakartaToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value);
  return new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
}

function getNextMonthlyDueDate(startDate: Date, today: Date) {
  const startUtc = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (startUtc > todayUtc) return null;

  const startYear = startDate.getUTCFullYear();
  const startMonth = startDate.getUTCMonth();
  const startDay = startDate.getUTCDate();
  const todayYear = today.getUTCFullYear();
  const todayMonth = today.getUTCMonth();
  let monthsAhead = Math.max(1, (todayYear - startYear) * 12 + todayMonth - startMonth);

  const dueDateForMonth = (offset: number) => {
    const monthDate = new Date(Date.UTC(startYear, startMonth + offset, 1));
    const lastDayOfMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
    return Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), Math.min(startDay, lastDayOfMonth));
  };

  let dueDate = dueDateForMonth(monthsAhead);
  if (dueDate < todayUtc) {
    monthsAhead += 1;
    dueDate = dueDateForMonth(monthsAhead);
  }
  return new Date(dueDate);
}

export default async function TenantHomePage() {
  const sessionUser = await getSessionUser();
  const tenant = sessionUser?.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: sessionUser.tenantId },
        select: { fullName: true, startDate: true, depositAmount: true, depositStatus: true, room: { select: { roomNumber: true, type: true, size: true, priceMonthly: true, facilities: true } } },
      })
    : null;
  if (!tenant) return null;

  const today = getJakartaToday();
  const dueDate = getNextMonthlyDueDate(tenant.startDate, today);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const daysUntilDue = dueDate ? Math.round((dueDate.getTime() - todayUtc) / 86_400_000) : null;
  const showRentReminder = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;
  const formattedDueDate = dueDate?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-white tracking-tight">Selamat datang, {tenant.fullName}</h1>
        <p className="text-xs text-zinc-400 mt-1">Informasi penghuni dan kamar Anda di {initialBuildingInfo.name}.</p>
      </div>
      {showRentReminder && dueDate && daysUntilDue !== null && (
        <div role="status" className="flex gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-200">
          <CalendarDays className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pengingat pembayaran sewa</p>
            <p className="mt-0.5">
              {daysUntilDue === 0
                ? `Masa sewa kamar ${tenant.room.roomNumber} jatuh tempo hari ini.`
                : `Masa sewa kamar ${tenant.room.roomNumber} jatuh tempo dalam ${daysUntilDue} hari.`}{" "}
              Mohon siapkan pembayaran Rp {tenant.room.priceMonthly.toLocaleString("id-ID")} paling lambat {formattedDueDate}.
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold"><Home className="w-4 h-4 text-[#c5a880]" /> Informasi kamar</div>
          <p className="text-sm text-zinc-200">Kamar {tenant.room.roomNumber} · {tenant.room.type}</p>
          <p className="text-xs text-zinc-400">{tenant.room.size || "Ukuran belum dicatat"}</p>
          <p className="text-xs text-zinc-400">Sewa: Rp {tenant.room.priceMonthly.toLocaleString("id-ID")} / bulan</p>
          {tenant.room.facilities.length > 0 && <p className="text-xs text-zinc-400">Fasilitas: {tenant.room.facilities.join(", ")}</p>}
        </section>
        <section className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold"><CalendarDays className="w-4 h-4 text-[#c5a880]" /> Data sewa</div>
          <p className="text-xs text-zinc-400">Mulai tinggal: {tenant.startDate.toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
          <p className="text-xs text-zinc-400">Deposit: Rp {tenant.depositAmount.toLocaleString("id-ID")} · {tenant.depositStatus === "HELD" ? "Ditahan" : tenant.depositStatus === "REFUNDED" ? "Dikembalikan" : "Dipotong"}</p>
        </section>
      </div>
      <div className="flex gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-200">
        <Shield className="w-4 h-4 shrink-0" />
        Portal login penghuni sudah aktif. Informasi tagihan dan komplain online belum dihubungkan ke database.
      </div>
    </div>
  );
}
