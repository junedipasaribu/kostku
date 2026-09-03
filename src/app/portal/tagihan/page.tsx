"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { Copy, Upload, Check } from "lucide-react";

export default function TenantTagihanPage() {
  const { building, currentUser, tenants, invoices, updateInvoiceStatus } = useKost();

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const myInvoices = invoices.filter((i) => i.roomNumber === tenant?.roomNumber || i.tenantPhone === tenant?.phone);
  const activeInvoice = myInvoices.find((i) => i.status === "UNPAID" || i.status === "PENDING_VERIFICATION") || myInvoices[0];

  const [paymentMethod, setPaymentMethod] = useState("Transfer BCA");
  const [proofUrl, setProofUrl] = useState("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText(building.bankAccount);
    alert(`Nomor rekening ${building.bankAccount} berhasil disalin!`);
  };

  const handleUploadPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice) return;

    setIsSubmitting(true);
    setTimeout(() => {
      updateInvoiceStatus(activeInvoice.id, "PENDING_VERIFICATION", proofUrl, paymentMethod);
      setIsSubmitting(false);
      setSuccessMessage(true);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Bayar & Tagihan Sewa
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Pembayaran sewa bulanan dan konfirmasi transfer.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center justify-between">
          <span>✓ Bukti transfer telah terkirim ke pengelola untuk diverifikasi.</span>
          <button onClick={() => setSuccessMessage(false)} className="text-zinc-500 hover:text-white">Tutup</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Active Bill */}
        <div className="lg:col-span-2 space-y-5">
          {activeInvoice ? (
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 text-xs">
                <div>
                  <span className="font-semibold text-white text-sm">
                    Tagihan {activeInvoice.periodMonth} {activeInvoice.periodYear}
                  </span>
                  <p className="text-zinc-500 font-mono text-[11px]">{activeInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      activeInvoice.status === "PAID"
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                        : activeInvoice.status === "PENDING_VERIFICATION"
                        ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {activeInvoice.status === "PAID" ? "Lunas" : activeInvoice.status === "PENDING_VERIFICATION" ? "Menunggu Verifikasi" : "Belum Bayar"}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Jatuh tempo: {activeInvoice.dueDate}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Sewa Kamar {activeInvoice.roomNumber}</span>
                  <span className="text-white font-medium">Rp {activeInvoice.amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Utilitas & Fasilitas (AC, WiFi, Air)</span>
                  <span className="text-zinc-400 font-medium">Termasuk</span>
                </div>
                <div className="pt-2 border-t border-zinc-800/60 flex justify-between font-semibold text-white">
                  <span>Total Tagihan</span>
                  <span className="text-sm">Rp {activeInvoice.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Form Upload */}
              {activeInvoice.status === "UNPAID" && (
                <form onSubmit={handleUploadPayment} className="pt-3 border-t border-zinc-800/60 space-y-3 text-xs">
                  <span className="block font-medium text-white">Konfirmasi Bukti Transfer:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1">Metode Pembayaran</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                      >
                        <option value="Transfer BCA">Transfer BCA</option>
                        <option value="Transfer Mandiri">Transfer Mandiri</option>
                        <option value="QRIS">QRIS</option>
                        <option value="Cash">Tunai</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Link Foto Bukti Transfer</label>
                      <input
                        type="text"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                  </button>
                </form>
              )}

              {activeInvoice.status === "PENDING_VERIFICATION" && (
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400">
                  Bukti pembayaran telah terkirim. Admin akan memverifikasi mutasi rekening.
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Tidak ada tagihan aktif.</p>
          )}
        </div>

        {/* Right Col: Bank Account */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2 text-xs">
            <span className="text-zinc-400 font-medium">Rekening Resmi Pembayaran:</span>
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{building.bankName}</p>
                <p className="font-mono text-zinc-300 font-semibold">{building.bankAccount}</p>
                <p className="text-[10px] text-zinc-500">a.n. {building.bankHolder}</p>
              </div>
              <button
                onClick={copyBankToClipboard}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
