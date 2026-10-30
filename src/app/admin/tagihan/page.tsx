"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { Phone, Search, X, Check, FileText, Printer, Download } from "lucide-react";
import { InvoiceData } from "@/lib/data";

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

function InvoiceReceiptModal({
  inv,
  building,
  onClose,
}: {
  inv: InvoiceData;
  building: { name: string; address: string; bankName: string; bankAccount: string; bankHolder: string; ownerName: string };
  onClose: () => void;
}) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head>
      <title>Kwitansi ${escapeHtml(inv.invoiceNumber)}</title>
      <style>
        body { font-family:'Segoe UI',sans-serif; padding:32px; color:#111; max-width:480px; margin:0 auto; }
        .header { text-align:center; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:16px; }
        .header h1 { font-size:18px; font-weight:700; margin:0; }
        .header p { font-size:11px; color:#555; margin:3px 0 0; }
        .badge { display:inline-block; padding:2px 10px; border-radius:4px; font-size:11px; font-weight:600;
          background:${inv.status==='PAID'?'#d1fae5':'#fef9c3'}; color:${inv.status==='PAID'?'#065f46':'#713f12'}; }
        .row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #ddd; font-size:12px; }
        .total { font-weight:700; font-size:14px; margin-top:8px; display:flex; justify-content:space-between; }
        .footer { margin-top:24px; text-align:center; font-size:10px; color:#888; }
        .ttd { margin-top:40px; display:flex; justify-content:space-between; font-size:11px; }
        .ttd-box { text-align:center; }
        .ttd-line { margin-top:48px; border-top:1px solid #555; padding-top:4px; }
      </style></head><body>
      <div class="header">
        <h1>${escapeHtml(building.name)}</h1>
        <p>${escapeHtml(building.address)}</p>
        <p style="margin-top:6px;font-size:13px;font-weight:600;">KWITANSI PEMBAYARAN SEWA</p>
      </div>
      <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#555;">${escapeHtml(inv.invoiceNumber)}</span>
        <span class="badge">${inv.status==='PAID'?'LUNAS':inv.status==='PENDING_VERIFICATION'?'MENUNGGU VERIFIKASI':'BELUM BAYAR'}</span>
      </div>
      <div class="row"><span>Nama Penyewa</span><span><b>${escapeHtml(inv.tenantName)}</b></span></div>
      <div class="row"><span>No. Kamar</span><span>${escapeHtml(inv.roomNumber)}</span></div>
      <div class="row"><span>Periode Sewa</span><span>${escapeHtml(inv.periodMonth)} ${inv.periodYear}</span></div>
      <div class="row"><span>Jatuh Tempo</span><span>${escapeHtml(inv.dueDate)}</span></div>
      ${inv.paymentMethod ? `<div class="row"><span>Metode Bayar</span><span>${escapeHtml(inv.paymentMethod)}</span></div>` : ""}
      ${inv.paidAt ? `<div class="row"><span>Dibayar Pada</span><span>${escapeHtml(inv.paidAt)}</span></div>` : ""}
      <div class="total"><span>TOTAL TAGIHAN</span><span>Rp ${inv.amount.toLocaleString("id-ID")}</span></div>
      <div style="margin-top:16px;padding:10px;border:1px dashed #ccc;background:#fafafa;border-radius:4px;font-size:11px;">
        <b>Transfer ke:</b> ${escapeHtml(building.bankName)} — ${escapeHtml(building.bankAccount)} a.n. ${escapeHtml(building.bankHolder)}
      </div>
      <div class="ttd">
        <div class="ttd-box"><div>Penyewa</div><div class="ttd-line">${escapeHtml(inv.tenantName)}</div></div>
        <div class="ttd-box"><div>Pengelola</div><div class="ttd-line">${escapeHtml(building.ownerName)}</div></div>
      </div>
      <div class="footer">Dokumen digital ${escapeHtml(building.name)}. Sah tanpa tanda tangan basah.</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-zinc-800/60 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Kwitansi Resmi</p>
          <h2 className="text-sm font-bold text-white">{building.name}</h2>
        </div>
        <div className="p-5 space-y-1.5 text-xs">
          {[
            ["No. Invoice", <span key="invoice-number" className="font-mono text-[11px]">{inv.invoiceNumber}</span>],
            ["Penyewa", <span key="tenant-name" className="font-semibold text-white">{inv.tenantName}</span>],
            ["Kamar", inv.roomNumber],
            ["Periode", `${inv.periodMonth} ${inv.periodYear}`],
            ["Jatuh Tempo", inv.dueDate],
            ...(inv.paymentMethod ? [["Metode Bayar", inv.paymentMethod]] : []),
            ...(inv.paidAt ? [["Dibayar Pada", inv.paidAt]] : []),
          ].map(([label, value], i) => (
            <div key={i} className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">{label}</span>
              <span className="text-zinc-300">{value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <span className="text-white font-bold">Total Tagihan</span>
            <span className="text-white font-bold text-base">Rp {inv.amount.toLocaleString("id-ID")}</span>
          </div>
          <div className={`mt-2 px-3 py-1.5 rounded text-[11px] font-semibold text-center ${
            inv.status === "PAID" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
            : inv.status === "PENDING_VERIFICATION" ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
            : "bg-zinc-800 text-zinc-400"
          }`}>
            {inv.status === "PAID" ? "✓ LUNAS" : inv.status === "PENDING_VERIFICATION" ? "⏳ MENUNGGU VERIFIKASI" : "○ BELUM BAYAR"}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800/60 flex gap-2">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Cetak / PDF
          </button>
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTagihanPage() {
  const { invoices, building, updateInvoiceStatus } = useKost();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [printInvoice, setPrintInvoice] = useState<InvoiceData | null>(null);

  const exportCSV = () => {
    const headers = ["No. Invoice", "Penyewa", "No. Kamar", "Periode", "Nominal", "Jatuh Tempo", "Status", "Metode Bayar", "Dibayar Pada"];
    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceNumber}"`,
      `"${inv.tenantName}"`,
      inv.roomNumber,
      `"${inv.periodMonth} ${inv.periodYear}"`,
      inv.amount,
      inv.dueDate,
      inv.status,
      inv.paymentMethod || "-",
      inv.paidAt || "-",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Tagihan_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
      {/* Print Modal */}
      {printInvoice && <InvoiceReceiptModal inv={printInvoice} building={building} onClose={() => setPrintInvoice(null)} />}

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

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400">
            Piutang Tertunda: <span className="text-white font-semibold">Rp {invoices.filter((i) => i.status !== "PAID").reduce((acc, i) => acc + i.amount, 0).toLocaleString("id-ID")}</span>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor CSV
          </button>
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
                      <button
                        onClick={() => setPrintInvoice(inv)}
                        className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Cetak Kwitansi"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

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
