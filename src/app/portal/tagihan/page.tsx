"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import {
  Receipt,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  QrCode,
  CreditCard,
  Building2,
  FileCheck,
  Printer
} from "lucide-react";

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
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Bayar & Kelola Tagihan Sewa
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Lakukan pembayaran sewa bulanan dan unggah bukti transfer untuk diverifikasi oleh pengelola.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Bukti transfer berhasil diunggah! Status sekarang menunggu konfirmasi dari pengelola.</span>
          </div>
          <button onClick={() => setSuccessMessage(false)} className="text-xs underline font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Invoice & Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {activeInvoice ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-6">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Invoice Periode
                  </span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    {activeInvoice.periodMonth} {activeInvoice.periodYear}
                  </h2>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{activeInvoice.invoiceNumber}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      activeInvoice.status === "PAID"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : activeInvoice.status === "PENDING_VERIFICATION"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {activeInvoice.status === "PAID"
                      ? "✓ Lunas"
                      : activeInvoice.status === "PENDING_VERIFICATION"
                      ? "Menunggu Verifikasi"
                      : "Belum Dibayar"}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Jatuh tempo: <strong className="text-white">{activeInvoice.dueDate}</strong>
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Sewa Kamar {activeInvoice.roomNumber}</span>
                  <span className="text-white font-semibold">Rp {activeInvoice.amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Fasilitas (AC, WiFi 100Mbps, Air)</span>
                  <span className="text-emerald-400 font-semibold">Termasuk (Gratis)</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-black text-white">
                  <span>Total yang Harus Dibayar</span>
                  <span className="text-xl text-[#c5a880]">Rp {activeInvoice.amount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Form Upload Bukti (Only if UNPAID or want to re-upload) */}
              {activeInvoice.status === "UNPAID" && (
                <form onSubmit={handleUploadPayment} className="pt-4 border-t border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#c5a880]" />
                    <span>Konfirmasi Pembayaran Transfer</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-zinc-400 mb-1">Metode Transfer yang Digunakan</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                      >
                        <option value="Transfer BCA">Transfer Bank BCA</option>
                        <option value="Transfer Mandiri">Transfer Bank Mandiri</option>
                        <option value="Transfer BNI/BRI">Transfer BNI / BRI</option>
                        <option value="QRIS">QRIS / E-Wallet (GoPay/OVO)</option>
                        <option value="Cash / Tunai">Bayar Tunai ke Pengelola</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-zinc-400 mb-1">Foto Bukti Transfer (Struk ATM / m-Banking)</label>
                      <input
                        type="text"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="Link foto bukti transfer..."
                        required
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#a48256] text-black font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#c5a880]/20 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? "Mengirimkan Bukti..." : "Kirim Bukti Pembayaran ke Admin"}</span>
                  </button>
                </form>
              )}

              {activeInvoice.status === "PENDING_VERIFICATION" && (
                <div className="pt-4 border-t border-white/10 p-4 rounded-2xl bg-black/40 border border-sky-500/30 text-xs">
                  <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Bukti Transfer Telah Dikirim</span>
                  </div>
                  <p className="text-zinc-300">
                    Pengelola sedang memeriksa mutasi rekening. Anda akan menerima notifikasi jika status sudah lunas.
                  </p>
                  {activeInvoice.paymentProof && (
                    <div className="mt-3">
                      <a
                        href={activeInvoice.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#c5a880] hover:underline font-bold"
                      >
                        Lihat foto bukti yang diunggah →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {activeInvoice.status === "PAID" && (
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tagihan telah lunas diverifikasi ({activeInvoice.paidAt})</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Nota</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/60 text-center text-zinc-400 text-xs">
              Tidak ada tagihan aktif untuk kamar Anda saat ini.
            </div>
          )}
        </div>

        {/* Right Col: Official Bank & QRIS Instruction */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c5a880]" />
              <span>Rekening Transfer Resmi</span>
            </h3>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-2">
              <span className="text-[11px] text-zinc-400 block font-semibold">{building.bankName}</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-black text-white">{building.bankAccount}</span>
                <button
                  onClick={copyBankToClipboard}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Salin"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-[#c5a880] font-bold block">a.n. {building.bankHolder}</span>
            </div>

            <div className="text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
              <p>1. Transfer tepat sesuai nominal tagihan sewa.</p>
              <p>2. Simpan struk transfer atau screenshot m-Banking.</p>
              <p>3. Unggah bukti pada formulir di sebelah kiri.</p>
            </div>
          </div>

          {/* QRIS Card */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-3 text-center">
            <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4 text-[#c5a880]" />
              <span>Scan QRIS Kostku</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Dapat di-scan menggunakan seluruh aplikasi mobile banking (BCA, Mandiri, BRI) & e-Wallet (GoPay, OVO, Dana).
            </p>
            <div className="w-36 h-36 mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white p-2">
              <img
                src={building.qrisUrl}
                alt="QRIS Kostku"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Past Invoices Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10">
        <h3 className="text-base font-bold text-white mb-4">Riwayat Pembayaran Sebelumnya</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">No. Invoice</th>
                <th className="pb-3 font-semibold">Periode</th>
                <th className="pb-3 font-semibold">Nominal</th>
                <th className="pb-3 font-semibold">Metode</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono text-zinc-300">{inv.invoiceNumber}</td>
                  <td className="py-3 text-white font-bold">{inv.periodMonth} {inv.periodYear}</td>
                  <td className="py-3 text-[#c5a880] font-bold">Rp {inv.amount.toLocaleString("id-ID")}</td>
                  <td className="py-3 text-zinc-400">{inv.paymentMethod || "Transfer"}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : inv.status === "PENDING_VERIFICATION"
                          ? "bg-sky-500/20 text-sky-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {inv.status === "PAID" ? "Lunas" : inv.status === "PENDING_VERIFICATION" ? "Verifikasi" : "Belum Bayar"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
