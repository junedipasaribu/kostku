"use client";

import React from "react";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import {
  DoorClosed,
  Users,
  Receipt,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Phone,
  Building2,
  Sparkles,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { building, rooms, tenants, invoices, expenses, complaints, updateInvoiceStatus } = useKost();

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenanceRooms = rooms.filter((r) => r.status === "MAINTENANCE").length;

  const totalDepositHeld = tenants.reduce((acc, t) => acc + (t.depositStatus === "HELD" ? t.depositAmount : 0), 0);

  const pendingInvoices = invoices.filter((i) => i.status === "UNPAID" || i.status === "PENDING_VERIFICATION");
  const pendingAmount = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const paidAmount = invoices.filter((i) => i.status === "PAID").reduce((acc, i) => acc + i.amount, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const openComplaints = complaints.filter((c) => c.status !== "RESOLVED");

  const sendWhatsAppReminder = (inv: (typeof invoices)[0]) => {
    const text = encodeURIComponent(
      `Halo Kak ${inv.tenantName} (Kamar ${inv.roomNumber}), ini pengingat tagihan sewa Kostku untuk periode ${inv.periodMonth} ${inv.periodYear} sebesar Rp ${inv.amount.toLocaleString("id-ID")} dengan batas jatuh tempo ${inv.dueDate}.\n\nPembayaran dapat ditransfer ke ${building.bankName} ${building.bankAccount} a.n. ${building.bankHolder}.\n\nJika sudah transfer, mohon unggah bukti di portal penghuni atau kirim ke WA ini. Terima kasih! 🙏`
    );
    window.open(`https://wa.me/${inv.tenantPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880] text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Sistem Gedung Tunggal: {building.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Pengelola Gedung
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pantau status kamar, penghuni aktif, uang deposit, serta arus kas tagihan sewa gedung secara realtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/tagihan"
            className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#d6bc96] transition-all shadow-md shadow-[#c5a880]/20"
          >
            + Buat Tagihan
          </Link>
          <Link
            href="/admin/pengeluaran"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            + Catat Pengeluaran
          </Link>
        </div>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Okupansi Kamar */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Status Okupansi Kamar</span>
            <DoorClosed className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{occupiedRooms}/{totalRooms}</span>
            <span className="text-xs text-emerald-400 font-bold">Terisi ({Math.round((occupiedRooms / totalRooms) * 100)}%)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="text-emerald-400 font-semibold">{availableRooms} Tersedia</span>
            <span className="text-amber-400 font-semibold">{maintenanceRooms} Perbaikan</span>
          </div>
        </div>

        {/* Card 2: Uang Deposit */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Total Deposit Tertahan</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">Rp {totalDepositHeld.toLocaleString("id-ID")}</span>
          </div>
          <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
            Dari <span className="text-white font-bold">{tenants.length} anak kost</span> aktif (uang jaminan)
          </p>
        </div>

        {/* Card 3: Piutang Sewa */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Tagihan Pending / Piutang</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-300">Rp {pendingAmount.toLocaleString("id-ID")}</span>
          </div>
          <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
            <span className="text-amber-300 font-bold">{pendingInvoices.length} tagihan</span> belum diverifikasi / dibayar
          </p>
        </div>

        {/* Card 4: Arus Kas */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Pemasukan Lunas Bulan Ini</span>
            <Sparkles className="w-4 h-4 text-[#c5a880]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-400">Rp {paidAmount.toLocaleString("id-ID")}</span>
          </div>
          <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
            Pengeluaran: <span className="text-red-400 font-bold">Rp {totalExpenses.toLocaleString("id-ID")}</span>
          </p>
        </div>
      </div>

      {/* 3. Action Required Section: Verifikasi Bukti & Laporan Kerusakan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Alert */}
        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Perlu Verifikasi Bukti Pembayaran</h2>
            </div>
            <Link href="/admin/tagihan" className="text-xs font-bold text-amber-400 hover:underline">
              Kelola Semua →
            </Link>
          </div>

          {invoices.filter((i) => i.status === "PENDING_VERIFICATION").length > 0 ? (
            <div className="space-y-3">
              {invoices
                .filter((i) => i.status === "PENDING_VERIFICATION")
                .map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">Kamar {inv.roomNumber}</span>
                        <span className="text-xs text-zinc-300">• {inv.tenantName}</span>
                      </div>
                      <p className="text-xs font-bold text-amber-300 mt-1">
                        Rp {inv.amount.toLocaleString("id-ID")} ({inv.periodMonth} {inv.periodYear})
                      </p>
                      <span className="text-[10px] text-zinc-400">Metode: {inv.paymentMethod || "Transfer Bank"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.paymentProof && (
                        <a
                          href={inv.paymentProof}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                        >
                          Bukti
                        </a>
                      )}
                      <button
                        onClick={() => updateInvoiceStatus(inv.id, "PAID")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-900/30"
                      >
                        ✓ Konfirmasi Lunas
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-black/20 text-center text-xs text-zinc-400">
              Tidak ada bukti transfer yang menunggu verifikasi saat ini.
            </div>
          )}
        </div>

        {/* Complaints Alert */}
        <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Laporan Fasilitas / Komplain ({openComplaints.length})</h2>
            </div>
            <Link href="/admin/komplain" className="text-xs font-bold text-red-400 hover:underline">
              Kelola Tiket →
            </Link>
          </div>

          <div className="space-y-3">
            {openComplaints.slice(0, 2).map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-black/40 border border-red-500/20 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">Kamar {c.roomNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      c.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"
                    }`}>
                      {c.status === "IN_PROGRESS" ? "Dikerjakan" : "Menunggu"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{c.title}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{c.description}</p>
                </div>
                <Link
                  href="/admin/komplain"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white shrink-0"
                >
                  Tangani
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Mini Denah Kamar Visual (Lantai 1 & Lantai 2) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Denah Visual Kamar Gedung</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Tata letak kamar Lantai 1 & Lantai 2 beserta status real-time</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Tersedia
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Terisi
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Perbaikan
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const isOccupied = room.status === "OCCUPIED";
            const isAvailable = room.status === "AVAILABLE";

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                  isOccupied
                    ? "bg-blue-950/20 border-blue-500/30 hover:border-blue-500/60"
                    : isAvailable
                    ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white">Kamar {room.roomNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isOccupied
                        ? "bg-blue-500/20 text-blue-300"
                        : isAvailable
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {isOccupied ? "Terisi" : isAvailable ? "Kosong" : "Servis"}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-zinc-300 font-semibold">{room.type} • Lt {room.floor}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Rp {room.priceMonthly.toLocaleString("id-ID")}/bln</p>
                </div>

                <div className="pt-2 border-t border-white/5 text-[11px] truncate">
                  {isOccupied ? (
                    <span className="text-blue-300 font-semibold truncate flex items-center gap-1">
                      <Users className="w-3 h-3" /> {room.tenantName}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Siap Disewa</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Pending Invoices & WhatsApp Reminder */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Tagihan Belum Lunas & Pengingat WA</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Kirim notifikasi tagihan langsung ke nomor WhatsApp anak kost</p>
          </div>
          <Link href="/admin/tagihan" className="text-xs font-bold text-[#c5a880] hover:underline">
            Lihat Semua Tagihan →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Kamar</th>
                <th className="pb-3 font-semibold">Nama Penyewa</th>
                <th className="pb-3 font-semibold">Periode</th>
                <th className="pb-3 font-semibold">Nominal</th>
                <th className="pb-3 font-semibold">Jatuh Tempo</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices
                .filter((i) => i.status === "UNPAID" || i.status === "PENDING_VERIFICATION")
                .map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-black text-white">Kamar {inv.roomNumber}</td>
                    <td className="py-3 text-zinc-200">{inv.tenantName}</td>
                    <td className="py-3 text-zinc-400">{inv.periodMonth} {inv.periodYear}</td>
                    <td className="py-3 font-bold text-[#c5a880]">Rp {inv.amount.toLocaleString("id-ID")}</td>
                    <td className="py-3 text-zinc-400">{inv.dueDate}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === "PENDING_VERIFICATION"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                      }`}>
                        {inv.status === "PENDING_VERIFICATION" ? "Menunggu Verifikasi" : "Belum Bayar"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => sendWhatsAppReminder(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>
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
