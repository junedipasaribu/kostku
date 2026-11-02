import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default async function TenantBillingPage() {
  const user = await getSessionUser();
  if (!user?.tenantId || user.role !== "TENANT") redirect("/login");
  const [invoices, building] = await Promise.all([
    prisma.invoice.findMany({
      where: { tenantId: user.tenantId },
      select: { invoiceNumber: true, periodMonth: true, periodYear: true, amount: true, dueDate: true, status: true, paidAt: true },
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.buildingConfig.findUnique({ where: { id: "default" }, select: { bankName: true, bankAccount: true, bankHolder: true } }),
  ]);

  return (
    <section className="max-w-2xl space-y-5">
      <header className="border-b border-zinc-800/80 pb-5">
        <h1 className="text-xl font-semibold text-white">Tagihan sewa</h1>
        <p className="mt-1 text-xs text-zinc-400">Riwayat dan status pembayaran tagihan Anda.</p>
      </header>
      {building?.bankAccount && (
        <aside className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-300">
          <p className="font-semibold text-white">Informasi pembayaran</p>
          <p className="mt-1">{building.bankName} · {building.bankAccount} · a.n. {building.bankHolder}</p>
          <p className="mt-2 text-zinc-500">Setelah membayar, hubungi pengelola untuk verifikasi.</p>
        </aside>
      )}
      {invoices.length ? invoices.map((invoice) => (
        <article key={invoice.invoiceNumber} className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-sm font-medium text-white">Sewa {months[invoice.periodMonth - 1]} {invoice.periodYear}</h2><p className="mt-1 text-[11px] text-zinc-500">{invoice.invoiceNumber}</p></div>
            <span className={`rounded px-2 py-1 text-[10px] ${invoice.status === "PAID" ? "bg-emerald-950 text-emerald-300" : invoice.status === "OVERDUE" ? "bg-rose-950 text-rose-300" : "bg-amber-950 text-amber-300"}`}>{invoice.status === "PAID" ? "Lunas" : invoice.status === "PENDING_VERIFICATION" ? "Menunggu verifikasi" : invoice.status === "OVERDUE" ? "Terlambat" : "Belum dibayar"}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs"><span className="text-zinc-400">Jatuh tempo {invoice.dueDate.toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "UTC" })}</span><span className="font-semibold text-white">Rp {invoice.amount.toLocaleString("id-ID")}</span></div>
        </article>
      )) : <p className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-sm text-zinc-400">Belum ada tagihan yang diterbitkan.</p>}
    </section>
  );
}
