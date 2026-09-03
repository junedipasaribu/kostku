"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  ExternalLink,
  Search,
  X,
  FileText,
  DollarSign
} from "lucide-react";

export default function AdminTagihanPage() {
  const { invoices, building, tenants, updateInvoiceStatus } = useKost();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== "ALL" && inv.status !== filterStatus) return false;
    if (
      searchQuery &&
      !inv.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inv.roomNumber.includes(searchQuery) &&
      !inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const sendWhatsAppReminder = (inv: (typeof invoices)[0]) => {
    const text = encodeURIComponent(
      `*PENGINGAT TAGIHAN SEWA KOST*\n` +
      `-------------------------------------\n` +
      `Halo Kak ${inv.tenantName} (Kamar ${inv.roomNumber}),\n\n` +
      `Berikut rincian tagihan sewa *${building.name}* Anda:\n` +
      `• No. Invoice: ${inv.invoiceNumber}\n` +
      `• Periode: ${inv.periodMonth} ${inv.periodYear}\n` +
      `• Total Tagihan: *Rp ${inv.amount.toLocaleString("id-ID")}*\n` +
      `• Jatuh Tempo: *${inv.dueDate}*\n\n` +
      `Pembayaran dapat ditransfer ke:\n` +
      `🏦 *${building.bankName}*\n` +
      `No. Rekening: *${building.bankAccount}*\n` +
      `Atas Nama: *${building.bankHolder}*\n\n` +
      `Setelah transfer, mohon konfirmasi atau upload bukti bayar di Portal Penghuni: https://kostku.juns-digital.my.id/portal\n\n` +
      `Terima kasih! 🙏`
    );
    window.open(`https://wa.me/${inv.tenantPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tagihan & Verifikasi Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pantau pembayaran sewa bulanan, verifikasi bukti transfer, dan kirim pengingat WhatsApp instan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 text-xs flex items-center gap-3">
            <span className="text-zinc-400">Total Piutang:</span>
            <span className="text-base font-black text-amber-400">
              Rp {invoices.filter((i) => i.status !== "PAID").reduce((acc, i) => acc + i.amount, 0).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari kamar, nama, atau no invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          {[
            { label: "Semua", value: "ALL" },
            { label: "Belum Bayar", value: "UNPAID" },
            { label: "Verifikasi Bukti", value: "PENDING_VERIFICATION" },
            { label: "Lunas", value: "PAID" },
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setFilterStatus(st.value)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                filterStatus === st.value
                  ? "bg-[#c5a880] text-black"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-zinc-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">No. Invoice & Kamar</th>
                <th className="p-4 font-semibold">Nama Penyewa</th>
                <th className="p-4 font-semibold">Periode Sewa</th>
                <th className="p-4 font-semibold">Nominal</th>
                <th className="p-4 font-semibold">Jatuh Tempo</th>
                <th className="p-4 font-semibold">Status & Bukti</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Invoice & Room */}
                  <td className="p-4">
                    <p className="font-mono text-zinc-400 text-[11px]">{inv.invoiceNumber}</p>
                    <p className="font-black text-white text-sm mt-0.5">Kamar {inv.roomNumber}</p>
                  </td>

                  {/* Tenant */}
                  <td className="p-4">
                    <p className="font-bold text-white">{inv.tenantName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">+{inv.tenantPhone}</p>
                  </td>

                  {/* Period */}
                  <td className="p-4 text-zinc-300 font-semibold">
                    {inv.periodMonth} {inv.periodYear}
                  </td>

                  {/* Amount */}
                  <td className="p-4">
                    <span className="font-extrabold text-[#c5a880] text-sm">
                      Rp {inv.amount.toLocaleString("id-ID")}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="p-4 text-zinc-300">
                    <p className="font-semibold">{inv.dueDate}</p>
                    {inv.paidAt && <p className="text-[10px] text-emerald-400">Dibayar: {inv.paidAt}</p>}
                  </td>

                  {/* Status & Proof */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : inv.status === "PENDING_VERIFICATION"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {inv.status === "PAID"
                          ? "✓ Lunas"
                          : inv.status === "PENDING_VERIFICATION"
                          ? "Menunggu Verifikasi"
                          : "Belum Bayar"}
                      </span>

                      {inv.paymentProof && (
                        <div>
                          <button
                            onClick={() => setSelectedProofUrl(inv.paymentProof || null)}
                            className="text-[10px] text-[#c5a880] hover:underline flex items-center gap-1 font-bold"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Lihat Bukti Transfer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status === "PENDING_VERIFICATION" && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, "PAID")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950"
                        >
                          Konfirmasi Lunas
                        </button>
                      )}

                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => sendWhatsAppReminder(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </button>
                      )}

                      {inv.status === "PAID" && (
                        <span className="text-xs text-zinc-500 font-semibold italic">Telah Diverifikasi</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Bukti Transfer */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Bukti Transfer Pembayaran</h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10 mb-4">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
