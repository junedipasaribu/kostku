"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { Phone, Search, X, Check, FileText } from "lucide-react";

export default function AdminTagihanPage() {
  const { invoices, building, updateInvoiceStatus } = useKost();
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
      `Pengingat Tagihan Sewa ${building.name}\n` +
      `Kamar: ${inv.roomNumber} (${inv.tenantName})\n` +
      `Periode: ${inv.periodMonth} ${inv.periodYear}\n` +
      `Total: Rp ${inv.amount.toLocaleString("id-ID")}\n` +
      `Jatuh Tempo: ${inv.dueDate}\n\n` +
      `Transfer ke ${building.bankName} ${building.bankAccount} a.n. ${building.bankHolder}.\nTerima kasih.`
    );
    window.open(`https://wa.me/${inv.tenantPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Tagihan & Verifikasi Pembayaran
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar tagihan sewa bulanan dan verifikasi bukti transfer.
          </p>
        </div>

        <div className="text-xs text-zinc-400">
          Piutang Tertunda: <span className="text-white font-semibold">Rp {invoices.filter((i) => i.status !== "PAID").reduce((acc, i) => acc + i.amount, 0).toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari invoice atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { label: "Semua", value: "ALL" },
            { label: "Belum Bayar", value: "UNPAID" },
            { label: "Verifikasi", value: "PENDING_VERIFICATION" },
            { label: "Lunas", value: "PAID" },
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => setFilterStatus(st.value)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === st.value
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 bg-zinc-950/40">
                <th className="p-3.5 font-medium">No. Invoice & Kamar</th>
                <th className="p-3.5 font-medium">Penyewa</th>
                <th className="p-3.5 font-medium">Periode</th>
                <th className="p-3.5 font-medium">Nominal</th>
                <th className="p-3.5 font-medium">Status & Bukti</th>
                <th className="p-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">Kamar {inv.roomNumber}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{inv.invoiceNumber}</div>
                  </td>
                  <td className="p-3.5 text-zinc-300">{inv.tenantName}</td>
                  <td className="p-3.5 text-zinc-400">{inv.periodMonth} {inv.periodYear}</td>
                  <td className="p-3.5 font-semibold text-white">
                    Rp {inv.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          inv.status === "PAID"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                            : inv.status === "PENDING_VERIFICATION"
                            ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {inv.status === "PAID"
                          ? "Lunas"
                          : inv.status === "PENDING_VERIFICATION"
                          ? "Verifikasi"
                          : "Belum Bayar"}
                      </span>

                      {inv.paymentProof && (
                        <button
                          onClick={() => setSelectedProofUrl(inv.paymentProof || null)}
                          className="text-[11px] text-zinc-400 hover:text-white underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Bukti</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status === "PENDING_VERIFICATION" && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, "PAID")}
                          className="px-2.5 py-1 rounded bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Lunas</span>
                        </button>
                      )}

                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => sendWhatsAppReminder(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WA</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Bukti */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-semibold text-white">Bukti Transfer</h3>
              <button onClick={() => setSelectedProofUrl(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 mb-4">
              <img src={selectedProofUrl} alt="Bukti Transfer" className="w-full h-auto max-h-80 object-contain" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedProofUrl(null)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
