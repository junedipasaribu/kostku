"use client";

import React, { useState, useRef } from "react";
import { useKost } from "@/lib/kost-context";
import { Copy, QrCode, Printer, ChevronDown, ChevronUp, Upload, ImageIcon } from "lucide-react";

function InvoiceReceipt({
  inv,
  building,
  onClose,
}: {
  inv: {
    invoiceNumber: string;
    periodMonth: string;
    periodYear: number;
    roomNumber: string;
    tenantName: string;
    amount: number;
    dueDate: string;
    status: string;
    paymentMethod?: string;
    paidAt?: string;
  };
  building: { name: string; address: string; bankName: string; bankAccount: string; bankHolder: string; ownerName: string };
  onClose: () => void;
}) {
  const handlePrint = () => {
    const content = document.getElementById("print-area");
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kwitansi ${inv.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #111; max-width: 480px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 18px; font-weight: 700; margin: 0; }
          .header p { font-size: 11px; color: #555; margin: 3px 0 0; }
          .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;
            background: ${inv.status === 'PAID' ? '#d1fae5' : '#fef9c3'}; color: ${inv.status === 'PAID' ? '#065f46' : '#713f12'}; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ddd; font-size: 12px; }
          .row:last-child { border-bottom: none; }
          .total { font-weight: 700; font-size: 14px; margin-top: 8px; display: flex; justify-content: space-between; }
          .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #888; }
          .ttd { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
          .ttd-box { text-align: center; }
          .ttd-line { margin-top: 48px; border-top: 1px solid #555; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${building.name}</h1>
          <p>${building.address}</p>
          <p style="margin-top:6px; font-size:13px; font-weight:600;">KWITANSI PEMBAYARAN SEWA</p>
        </div>

        <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; color:#555;">${inv.invoiceNumber}</span>
          <span class="badge">${inv.status === 'PAID' ? 'LUNAS' : inv.status === 'PENDING_VERIFICATION' ? 'MENUNGGU VERIFIKASI' : 'BELUM BAYAR'}</span>
        </div>

        <div class="row"><span>Nama Penyewa</span><span><b>${inv.tenantName}</b></span></div>
        <div class="row"><span>No. Kamar</span><span>${inv.roomNumber}</span></div>
        <div class="row"><span>Periode Sewa</span><span>${inv.periodMonth} ${inv.periodYear}</span></div>
        <div class="row"><span>Jatuh Tempo</span><span>${inv.dueDate}</span></div>
        ${inv.paymentMethod ? `<div class="row"><span>Metode Bayar</span><span>${inv.paymentMethod}</span></div>` : ""}
        ${inv.paidAt ? `<div class="row"><span>Dibayar Pada</span><span>${inv.paidAt}</span></div>` : ""}
        <div class="row"><span>Fasilitas (AC, WiFi, Air)</span><span>Termasuk</span></div>

        <div class="total">
          <span>TOTAL TAGIHAN</span>
          <span>Rp ${inv.amount.toLocaleString("id-ID")}</span>
        </div>

        <div style="margin-top:16px; padding:10px; border:1px dashed #ccc; background:#fafafa; border-radius:4px; font-size:11px;">
          <b>Transfer ke:</b> ${building.bankName} — ${building.bankAccount}<br>
          a.n. ${building.bankHolder}
        </div>

        <div class="ttd">
          <div class="ttd-box">
            <div>Penyewa</div>
            <div class="ttd-line">${inv.tenantName}</div>
          </div>
          <div class="ttd-box">
            <div>Pengelola</div>
            <div class="ttd-line">${building.ownerName}</div>
          </div>
        </div>

        <div class="footer">Kwitansi ini dibuat secara digital oleh sistem ${building.name}.<br>Dokumen ini sah tanpa tanda tangan basah.</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="print-area"
      >
        {/* Receipt Header */}
        <div className="p-5 border-b border-zinc-800/60 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Kwitansi Resmi</p>
          <h2 className="text-sm font-bold text-white">{building.name}</h2>
          <p className="text-[10px] text-zinc-500 mt-0.5">{building.address}</p>
        </div>

        {/* Receipt Body */}
        <div className="p-5 space-y-1.5 text-xs">
          <div className="flex justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-400">No. Invoice</span>
            <span className="text-zinc-300 font-mono text-[11px]">{inv.invoiceNumber}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-400">Penyewa</span>
            <span className="text-white font-semibold">{inv.tenantName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-400">Kamar</span>
            <span className="text-zinc-300">{inv.roomNumber}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-400">Periode</span>
            <span className="text-zinc-300">{inv.periodMonth} {inv.periodYear}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800/50">
            <span className="text-zinc-400">Jatuh Tempo</span>
            <span className="text-zinc-300">{inv.dueDate}</span>
          </div>
          {inv.paymentMethod && (
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Metode Bayar</span>
              <span className="text-zinc-300">{inv.paymentMethod}</span>
            </div>
          )}
          {inv.paidAt && (
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Dibayar Pada</span>
              <span className="text-zinc-300">{inv.paidAt}</span>
            </div>
          )}
          <div className="flex justify-between pt-3">
            <span className="text-white font-bold">Total Tagihan</span>
            <span className="text-white font-bold text-base">Rp {inv.amount.toLocaleString("id-ID")}</span>
          </div>

          <div
            className={`mt-2 px-3 py-1.5 rounded text-[11px] font-semibold text-center ${
              inv.status === "PAID"
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                : inv.status === "PENDING_VERIFICATION"
                ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {inv.status === "PAID" ? "✓ LUNAS" : inv.status === "PENDING_VERIFICATION" ? "⏳ MENUNGGU VERIFIKASI" : "○ BELUM BAYAR"}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800/60 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TenantTagihanPage() {
  const { building, currentUser, tenants, invoices, updateInvoiceStatus } = useKost();

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const myInvoices = invoices
    .filter((i) => i.roomNumber === tenant?.roomNumber || i.tenantPhone === tenant?.phone)
    .sort((a, b) => b.periodYear - a.periodYear || 0);

  const activeInvoice =
    myInvoices.find((i) => i.status === "UNPAID" || i.status === "PENDING_VERIFICATION") ||
    myInvoices[0];

  const [paymentMethod, setPaymentMethod] = useState("Transfer BCA");
  const [proofUrl, setProofUrl] = useState("");
  const [proofPreview, setProofPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [showQris, setShowQris] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<typeof myInvoices[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Hanya file gambar (JPG, PNG, dll) yang diizinkan."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran file maksimal 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProofUrl(dataUrl);
      setProofPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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

  const historyInvoices = myInvoices.filter((i) => i.id !== activeInvoice?.id);

  return (
    <div className="space-y-6">
      {/* Print Modal */}
      {printInvoice && (
        <InvoiceReceipt inv={printInvoice} building={building} onClose={() => setPrintInvoice(null)} />
      )}

      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-white tracking-tight">Bayar & Tagihan Sewa</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Pembayaran sewa bulanan dan konfirmasi transfer.</p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center justify-between">
          <span>✓ Bukti transfer telah terkirim ke pengelola untuk diverifikasi.</span>
          <button onClick={() => setSuccessMessage(false)} className="text-zinc-500 hover:text-white">
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Active Bill */}
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
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      activeInvoice.status === "PAID"
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                        : activeInvoice.status === "PENDING_VERIFICATION"
                        ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {activeInvoice.status === "PAID"
                      ? "Lunas"
                      : activeInvoice.status === "PENDING_VERIFICATION"
                      ? "Menunggu Verifikasi"
                      : "Belum Bayar"}
                  </span>
                  {/* Print Button */}
                  <button
                    onClick={() => setPrintInvoice(activeInvoice)}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Cetak Kwitansi"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
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

              {/* Jatuh Tempo warning */}
              {activeInvoice.status === "UNPAID" && (
                <p className="text-[11px] text-zinc-500">
                  ⏰ Jatuh tempo: <span className="text-amber-400 font-medium">{activeInvoice.dueDate}</span>
                </p>
              )}

              {/* Upload Form */}
              {activeInvoice.status === "UNPAID" && (
                <form onSubmit={handleUploadPayment} className="pt-3 border-t border-zinc-800/60 space-y-3 text-xs">
                  <span className="block font-medium text-white">Konfirmasi Bukti Transfer:</span>
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
                      <option value="Tunai">Tunai</option>
                    </select>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-zinc-400 mb-1">Foto Bukti Transfer <span className="text-rose-400">*</span></label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full flex items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed transition-colors ${
                        proofPreview
                          ? "border-zinc-700 bg-zinc-950/40"
                          : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/20 hover:bg-zinc-950/40"
                      }`}
                    >
                      {proofPreview ? (
                        <div className="relative w-full">
                          <img src={proofPreview} alt="Preview" className="max-h-40 object-contain mx-auto rounded" />
                          <p className="text-[11px] text-zinc-500 mt-2 text-center">Klik untuk ganti foto</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                          <Upload className="w-5 h-5" />
                          <span className="text-xs">Klik untuk upload foto bukti transfer</span>
                          <span className="text-[11px]">JPG, PNG, max 5MB</span>
                        </div>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !proofUrl}
                    className="w-full py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* History */}
          {historyInvoices.length > 0 && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-4 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <span>Riwayat Tagihan Sebelumnya ({historyInvoices.length})</span>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showHistory && (
                <div className="divide-y divide-zinc-800/40">
                  {historyInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-3 text-xs">
                      <div>
                        <span className="text-zinc-300 font-medium">{inv.periodMonth} {inv.periodYear}</span>
                        <span className="text-zinc-500 font-mono ml-2 text-[11px]">{inv.invoiceNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">Rp {inv.amount.toLocaleString("id-ID")}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            inv.status === "PAID"
                              ? "bg-emerald-950/60 text-emerald-400"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {inv.status === "PAID" ? "Lunas" : "Belum"}
                        </span>
                        <button
                          onClick={() => setPrintInvoice(inv)}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-white transition-colors"
                          title="Cetak Kwitansi"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Bank + QRIS */}
        <div className="space-y-4">
          {/* Bank Account */}
          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3 text-xs">
            <span className="text-zinc-400 font-medium block">Rekening Resmi Pembayaran:</span>
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{building.bankName}</p>
                <p className="font-mono text-zinc-300 font-semibold tracking-wider">{building.bankAccount}</p>
                <p className="text-[10px] text-zinc-500">a.n. {building.bankHolder}</p>
              </div>
              <button
                onClick={copyBankToClipboard}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Salin No. Rekening"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QRIS Collapsible */}
          {building.qrisUrl && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
              <button
                onClick={() => setShowQris(!showQris)}
                className="w-full flex items-center justify-between p-3.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="font-medium">Bayar via QRIS</span>
                </div>
                {showQris ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showQris && (
                <div className="px-4 pb-4 space-y-2 text-center">
                  <div className="rounded-lg overflow-hidden border border-zinc-800/60 bg-white p-2">
                    <img
                      src={building.qrisUrl}
                      alt="QRIS Pembayaran"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500">Scan QR ini dengan aplikasi m-banking atau e-wallet.</p>
                </div>
              )}
            </div>
          )}

          {/* Quick info */}
          {activeInvoice && (
            <div className="p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/20 text-xs text-zinc-400 space-y-1.5">
              <p className="text-zinc-300 font-medium mb-2">Ringkasan Tagihan</p>
              <div className="flex justify-between">
                <span>Tagihan Aktif</span>
                <span className="text-white font-semibold">Rp {activeInvoice.amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Dibayar (bulan ini)</span>
                <span className="text-emerald-400">
                  {activeInvoice.status === "PAID" ? `Rp ${activeInvoice.amount.toLocaleString("id-ID")}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sisa Tagihan</span>
                <span className={activeInvoice.status === "PAID" ? "text-emerald-400" : "text-amber-400"}>
                  {activeInvoice.status === "PAID" ? "Rp 0" : `Rp ${activeInvoice.amount.toLocaleString("id-ID")}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
