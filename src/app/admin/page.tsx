"use client";

import React from "react";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import {
  DoorClosed,
  Users,
  Receipt,
  Wallet,
  Clock,
  ArrowUpRight,
  Phone,
  Check,
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
      `Halo Kak ${inv.tenantName} (Kamar ${inv.roomNumber}), ini pengingat tagihan sewa ${building.name} untuk periode ${inv.periodMonth} ${inv.periodYear} sebesar Rp ${inv.amount.toLocaleString("id-ID")}.\n\nPembayaran dapat ditransfer ke ${building.bankName} ${building.bankAccount} a.n. ${building.bankHolder}.\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${inv.tenantPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Ringkasan Operasional
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {building.name} • {building.address}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/tagihan"
            className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors"
          >
            + Buat Tagihan
          </Link>
          <Link
            href="/admin/pengeluaran"
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
          >
            + Catat Pengeluaran
          </Link>
        </div>
      </div>

      {/* 2. Top Metrics (Subtle, Clean Typography) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Okupansi */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Okupansi Kamar</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white tracking-tight">{occupiedRooms}</span>
            <span className="text-xs text-zinc-500">/ {totalRooms} kamar ({Math.round((occupiedRooms / totalRooms) * 100)}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-3">
            <span>{availableRooms} tersedia</span>
            <span>•</span>
            <span>{maintenanceRooms} servis</span>
          </div>
        </div>

        {/* Card 2: Deposit */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Uang Jaminan (Deposit)</span>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              Rp {totalDepositHeld.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Dari {tenants.length} penyewa aktif
          </p>
        </div>

        {/* Card 3: Piutang */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Tagihan Pending</span>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              Rp {pendingAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            {pendingInvoices.length} invoice belum selesai
          </p>
        </div>

        {/* Card 4: Arus Kas */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
          <span className="text-xs font-medium text-zinc-400">Pemasukan Lunas</span>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-white tracking-tight">
              Rp {paidAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Beban: Rp {totalExpenses.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* 3. Action Required Section (Minimalist, No Rainbow Glowing Boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Verification Pending */}
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Verifikasi Bukti Transfer ({invoices.filter((i) => i.status === "PENDING_VERIFICATION").length})
              </span>
              <Link href="/admin/tagihan" className="text-[11px] text-zinc-500 hover:text-zinc-300">
                Semua →
              </Link>
            </div>

            {invoices.filter((i) => i.status === "PENDING_VERIFICATION").length > 0 ? (
              <div className="space-y-2">
                {invoices
                  .filter((i) => i.status === "PENDING_VERIFICATION")
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Kamar {inv.roomNumber}</span>
                          <span className="text-zinc-400">• {inv.tenantName}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Rp {inv.amount.toLocaleString("id-ID")} ({inv.paymentMethod || "Transfer"})
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {inv.paymentProof && (
                          <a
                            href={inv.paymentProof}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                          >
                            Bukti
                          </a>
                        )}
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, "PAID")}
                          className="px-2.5 py-1 rounded bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Lunas</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3 text-center">
                Tidak ada bukti transfer menunggu konfirmasi.
              </p>
            )}
          </div>
        </div>

        {/* Complaints Pending */}
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-3">
              <span className="text-xs font-medium text-zinc-300">
                Komplain Fasilitas Aktif ({openComplaints.length})
              </span>
              <Link href="/admin/komplain" className="text-[11px] text-zinc-500 hover:text-zinc-300">
                Kelola →
              </Link>
            </div>

            <div className="space-y-2">
              {openComplaints.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Kamar {c.roomNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {c.status === "IN_PROGRESS" ? "Dikerjakan" : "Baru"}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-[11px] mt-0.5 truncate">{c.title}</p>
                  </div>
                  <Link
                    href="/admin/komplain"
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs shrink-0 transition-colors"
                  >
                    Detail
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Denah Kamar Visual (Clean Monochromatic Grid) */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Status Kamar Gedung</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Tata letak kamar per lantai</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Terisi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Servis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rooms.map((room) => {
            const isOccupied = room.status === "OCCUPIED";
            const isAvailable = room.status === "AVAILABLE";

            return (
              <div
                key={room.id}
                className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between h-28 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Kamar {room.roomNumber}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isOccupied
                        ? "bg-zinc-800 text-zinc-300"
                        : isAvailable
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                        : "bg-amber-950/40 text-amber-300 border border-amber-900/40"
                    }`}
                  >
                    {isOccupied ? "Terisi" : isAvailable ? "Kosong" : "Servis"}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] text-zinc-400">{room.type} • Lt {room.floor}</p>
                  <p className="text-xs font-medium text-zinc-200 mt-0.5">
                    Rp {room.priceMonthly.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="text-[10px] text-zinc-500 truncate pt-1 border-t border-zinc-900">
                  {isOccupied ? room.tenantName : "Siap huni"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Pending Invoices Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Tagihan Belum Lunas</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Daftar tagihan yang dapat dikirim pengingat WhatsApp</p>
          </div>
          <Link href="/admin/tagihan" className="text-xs text-zinc-400 hover:text-white">
            Lihat semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400">
                <th className="pb-2.5 font-medium">Kamar</th>
                <th className="pb-2.5 font-medium">Penyewa</th>
                <th className="pb-2.5 font-medium">Periode</th>
                <th className="pb-2.5 font-medium">Nominal</th>
                <th className="pb-2.5 font-medium">Jatuh Tempo</th>
                <th className="pb-2.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {invoices
                .filter((i) => i.status !== "PAID")
                .map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-900/30">
                    <td className="py-2.5 font-medium text-white">Kamar {inv.roomNumber}</td>
                    <td className="py-2.5">{inv.tenantName}</td>
                    <td className="py-2.5 text-zinc-400">{inv.periodMonth} {inv.periodYear}</td>
                    <td className="py-2.5 font-medium text-white">Rp {inv.amount.toLocaleString("id-ID")}</td>
                    <td className="py-2.5 text-zinc-400">{inv.dueDate}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => sendWhatsAppReminder(inv)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                      >
                        <Phone className="w-3 h-3" />
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
