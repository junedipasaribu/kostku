"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { UserPlus, Phone, Search, X } from "lucide-react";

export default function AdminPenghuniPage() {
  const { tenants, rooms, addTenant } = useKost();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("628");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [roomId, setRoomId] = useState(rooms.find((r) => r.status === "AVAILABLE")?.id || rooms[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositAmount, setDepositAmount] = useState(1000000);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("628");

  const filteredTenants = tenants.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.includes(searchQuery) ||
      t.phone.includes(searchQuery)
  );

  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (!selectedRoom || !fullName) return;

    addTenant({
      fullName,
      phone,
      idCardNumber,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      startDate,
      depositAmount: Number(depositAmount),
      depositStatus: "HELD",
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      status: "ACTIVE",
    });

    setIsCheckinModalOpen(false);
    setFullName("");
    setIdCardNumber("");
    setEmergencyName("");
  };

  const openWhatsApp = (phoneNum: string, name: string, roomNo: string) => {
    const text = encodeURIComponent(`Halo Kak ${name} (Kamar ${roomNo}), pengelola Kostku di sini.`);
    window.open(`https://wa.me/${phoneNum}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Data Penghuni & Deposit
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar anak kost aktif, tanggal masuk, uang jaminan, dan kontak darurat.
          </p>
        </div>

        <button
          onClick={() => setIsCheckinModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Check-in Baru</span>
        </button>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari penghuni atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="text-zinc-400 font-medium">
          Total: <span className="text-white">{tenants.length} penghuni</span> • Deposit: <span className="text-white font-medium">Rp {tenants.reduce((acc, t) => acc + t.depositAmount, 0).toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 bg-zinc-950/40">
                <th className="p-3.5 font-medium">Kamar & Nama</th>
                <th className="p-3.5 font-medium">Tgl Masuk</th>
                <th className="p-3.5 font-medium">Deposit</th>
                <th className="p-3.5 font-medium">NIK KTP</th>
                <th className="p-3.5 font-medium">Kontak Darurat</th>
                <th className="p-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">Kamar {t.roomNumber}</div>
                    <div className="text-zinc-400 text-[11px]">{t.fullName} • +{t.phone}</div>
                  </td>
                  <td className="p-3.5 text-zinc-300 font-medium">{t.startDate}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-white">Rp {t.depositAmount.toLocaleString("id-ID")}</div>
                    <span className="text-[10px] text-zinc-500">Tertahan</span>
                  </td>
                  <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{t.idCardNumber || "-"}</td>
                  <td className="p-3.5 text-zinc-400">
                    <div>{t.emergencyContactName || "-"}</div>
                    <div className="text-[10px] font-mono">{t.emergencyContactPhone || "-"}</div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openWhatsApp(t.phone, t.fullName, t.roomNumber)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check-in */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-semibold text-white">Check-in Penghuni Baru</h3>
              <button onClick={() => setIsCheckinModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Kamar Tersedia</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                >
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.roomNumber} ({r.type}) • Rp {r.priceMonthly.toLocaleString("id-ID")}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Tgl Masuk</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Uang Deposit (Rp)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
