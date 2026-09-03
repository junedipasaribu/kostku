"use client";

import React from "react";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import {
  Home,
  Receipt,
  Calendar,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  Copy,
  ChevronRight
} from "lucide-react";

export default function TenantHomePage() {
  const { building, currentUser, tenants, rooms, invoices } = useKost();

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const room = rooms.find((r) => r.roomNumber === (tenant?.roomNumber || "101"));

  const myInvoices = invoices.filter((i) => i.roomNumber === tenant?.roomNumber || i.tenantPhone === tenant?.phone);
  const currentInvoice = myInvoices[0]; // latest invoice

  const isUnpaid = currentInvoice?.status === "UNPAID";
  const isPending = currentInvoice?.status === "PENDING_VERIFICATION";
  const isPaid = currentInvoice?.status === "PAID";

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText(building.bankAccount);
    alert(`Nomor rekening ${building.bankAccount} berhasil disalin!`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Penghuni Resmi • {building.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Halo, {tenant?.fullName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Selamat datang di portal kamar Anda. Pantau status pembayaran sewa, rincian deposit, dan lapor kendala fasilitas dengan mudah.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-center shrink-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kamar Anda</span>
          <span className="text-3xl font-black text-[#c5a880]">Kamar {tenant?.roomNumber}</span>
          <span className="text-xs text-zinc-400 block mt-0.5">{room?.type} • Lantai {room?.floor}</span>
        </div>
      </div>

      {/* 2. Billing Status Alert Card */}
      {currentInvoice && (
        <div
          className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isUnpaid
              ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
              : isPending
              ? "bg-sky-950/20 border-sky-500/40 text-sky-200"
              : "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-start gap-3.5">
            {isUnpaid ? (
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            ) : isPending ? (
              <Clock className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold uppercase tracking-wider">
                  Tagihan Sewa Bulan {currentInvoice.periodMonth} {currentInvoice.periodYear}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isUnpaid
                      ? "bg-amber-500/30 text-amber-300"
                      : isPending
                      ? "bg-sky-500/30 text-sky-300"
                      : "bg-emerald-500/30 text-emerald-300"
                  }`}
                >
                  {isUnpaid ? "Belum Dibayar" : isPending ? "Menunggu Verifikasi" : "Lunas"}
                </span>
              </div>

              <p className="text-xs text-zinc-300 mt-1">
                {isUnpaid ? (
                  <>
                    Total tagihan: <strong className="text-white">Rp {currentInvoice.amount.toLocaleString("id-ID")}</strong>. Jatuh tempo: <strong className="text-amber-300">{currentInvoice.dueDate}</strong>.
                  </>
                ) : isPending ? (
                  <>
                    Bukti transfer Anda sedang diverifikasi oleh admin. Terima kasih sudah membayar tepat waktu!
                  </>
                ) : (
                  <>
                    Pembayaran sebesar <strong>Rp {currentInvoice.amount.toLocaleString("id-ID")}</strong> telah lunas dan diverifikasi pengelola.
                  </>
                )}
              </p>
            </div>
          </div>

          <Link
            href="/portal/tagihan"
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 ${
              isUnpaid
                ? "bg-[#c5a880] text-black hover:bg-[#d6bc96] shadow-md shadow-[#c5a880]/20"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <span>{isUnpaid ? "Bayar Sekarang" : "Lihat Rincian"}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. Room Details & Deposit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room Spec Card */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-[#c5a880]" />
              <span>Spesifikasi Kamar Anda</span>
            </h2>
            <span className="text-xs font-semibold text-zinc-400">{room?.size}</span>
          </div>

          {room?.image && (
            <div className="h-44 rounded-2xl overflow-hidden">
              <img
                src={room.image}
                alt={`Kamar ${room.roomNumber}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Fasilitas Kamar yang Disediakan:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {room?.facilities.map((f, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deposit & Rent Schedule Card */}
        <div className="space-y-6">
          {/* Uang Jaminan / Deposit */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Uang Jaminan / Deposit</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                {tenant?.depositStatus === "HELD" ? "Tertahan Aman" : tenant?.depositStatus}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-xs text-zinc-400 block">Nominal Deposit yang Tersimpan:</span>
              <p className="text-2xl font-black text-white mt-1">
                Rp {tenant?.depositAmount.toLocaleString("id-ID")}
              </p>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                Uang deposit adalah jaminan inventaris kamar yang akan dikembalikan secara penuh saat Anda checkout dan masa sewa berakhir (sesuai tata tertib gedung).
              </p>
            </div>
          </div>

          {/* Tanggal Masuk & Periode */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c5a880]" />
              <span>Jadwal Sewa Kost</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-zinc-500 font-medium block">Tanggal Masuk:</span>
                <span className="font-bold text-white mt-0.5 block">{tenant?.startDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-zinc-500 font-medium block">Jatuh Tempo Bulanan:</span>
                <span className="font-bold text-[#c5a880] mt-0.5 block">{currentInvoice?.dueDate || "Tgl 10"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Official Payment Account Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c5a880]" />
              <span>Rekening Resmi Pembayaran {building.name}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Harap hanya melakukan pembayaran sewa ke nomor rekening resmi pengelola di bawah ini.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/60 border border-white/10">
            <div>
              <p className="text-xs font-black text-white">{building.bankName}</p>
              <p className="text-base font-mono font-bold text-[#c5a880]">{building.bankAccount}</p>
              <p className="text-[10px] text-zinc-400">a.n. {building.bankHolder}</p>
            </div>
            <button
              onClick={copyBankToClipboard}
              title="Salin No Rekening"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
