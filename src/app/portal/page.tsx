"use client";

import React from "react";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import { Copy, ChevronRight } from "lucide-react";

export default function TenantHomePage() {
  const { building, currentUser, tenants, rooms, invoices } = useKost();

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const room = rooms.find((r) => r.roomNumber === (tenant?.roomNumber || "101"));

  const myInvoices = invoices.filter((i) => i.roomNumber === tenant?.roomNumber || i.tenantPhone === tenant?.phone);
  const currentInvoice = myInvoices[0];

  const isUnpaid = currentInvoice?.status === "UNPAID";
  const isPending = currentInvoice?.status === "PENDING_VERIFICATION";

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText(building.bankAccount);
    alert(`Nomor rekening ${building.bankAccount} berhasil disalin!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Informasi Kamar & Sewa
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          {building.name} • Kamar {tenant?.roomNumber} ({room?.type})
        </p>
      </div>

      {/* Billing Alert */}
      {currentInvoice && (
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Tagihan {currentInvoice.periodMonth} {currentInvoice.periodYear}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  isUnpaid
                    ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                    : isPending
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                }`}
              >
                {isUnpaid ? "Belum Dibayar" : isPending ? "Verifikasi" : "Lunas"}
              </span>
            </div>
            <p className="text-zinc-400 mt-0.5 text-[11px]">
              Total: Rp {currentInvoice.amount.toLocaleString("id-ID")} • Jatuh tempo: {currentInvoice.dueDate}
            </p>
          </div>

          <Link
            href="/portal/tagihan"
            className="px-3 py-1.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1 shrink-0"
          >
            <span>{isUnpaid ? "Bayar Tagihan" : "Lihat Rincian"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Room & Deposit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room specs */}
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Spesifikasi Kamar</span>
            <span className="text-xs text-zinc-500">{room?.size}</span>
          </div>

          {room?.image && (
            <div className="h-36 rounded-lg overflow-hidden bg-zinc-950">
              <img src={room.image} alt="Kamar" className="w-full h-full object-cover grayscale-[20%]" />
            </div>
          )}

          <div>
            <span className="text-[11px] text-zinc-500 block mb-1.5 font-medium">Fasilitas Termasuk:</span>
            <div className="flex flex-wrap gap-1.5 text-xs text-zinc-300">
              {room?.facilities.map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Deposit & Rent details */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
            <span className="text-sm font-semibold text-white">Uang Jaminan (Deposit)</span>
            <p className="text-xl font-semibold text-white">
              Rp {tenant?.depositAmount.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Deposit tersimpan aman di pengelola dan dapat diklaim kembali saat masa sewa Anda berakhir sesuai ketentuan.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
            <span className="text-sm font-semibold text-white">Jadwal Sewa</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850">
                <span className="text-zinc-500 text-[11px]">Tanggal Masuk:</span>
                <p className="text-white font-medium mt-0.5">{tenant?.startDate}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-850">
                <span className="text-zinc-500 text-[11px]">Jatuh Tempo:</span>
                <p className="text-white font-medium mt-0.5">{currentInvoice?.dueDate || "Tgl 10"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-zinc-400">Rekening Resmi Pengelola</span>
          <p className="text-sm font-semibold text-white mt-0.5">
            {building.bankName} • {building.bankAccount} (a.n. {building.bankHolder})
          </p>
        </div>
        <button
          onClick={copyBankToClipboard}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Copy className="w-3 h-3" />
          <span>Salin Rekening</span>
        </button>
      </div>
    </div>
  );
}
