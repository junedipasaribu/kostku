"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  Wallet,
  ShieldCheck,
  Search,
  X,
  CreditCard,
  AlertCircle
} from "lucide-react";

export default function AdminPenghuniPage() {
  const { tenants, rooms, addTenant } = useKost();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  // Form checkin penghuni baru
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
    const text = encodeURIComponent(`Halo Kak ${name} (Kamar ${roomNo}), pengelola Kostku di sini. Ada yang bisa kami bantu seputar fasilitas kamar?`);
    window.open(`https://wa.me/${phoneNum}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Check-in Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Data Penghuni & Uang Deposit
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Informasi lengkap anak kost: tanggal masuk, uang jaminan deposit, identitas KTP, dan kontak darurat.
          </p>
        </div>

        <button
          onClick={() => setIsCheckinModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#d6bc96] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Check-in Penghuni Baru</span>
        </button>
      </div>

      {/* Top Search & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama penghuni atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
          <span>Total Anak Kost: <strong className="text-white">{tenants.length} orang</strong></span>
          <span>•</span>
          <span>Deposit Tertahan: <strong className="text-emerald-400">Rp {tenants.reduce((acc, t) => acc + t.depositAmount, 0).toLocaleString("id-ID")}</strong></span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-zinc-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">Penghuni & Kamar</th>
                <th className="p-4 font-semibold">Tanggal Masuk</th>
                <th className="p-4 font-semibold">Uang Deposit</th>
                <th className="p-4 font-semibold">Identitas KTP</th>
                <th className="p-4 font-semibold">Kontak Darurat</th>
                <th className="p-4 font-semibold text-right">Hubungi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Name & Room */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c5a880]/20 to-[#8a6839]/10 border border-[#c5a880]/30 flex items-center justify-center font-bold text-[#c5a880]">
                        {t.roomNumber}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{t.fullName}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">+{t.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span className="font-semibold">{t.startDate}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Status: Aktif</span>
                  </td>

                  {/* Deposit */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-extrabold text-white">
                        Rp {t.depositAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                      {t.depositStatus === "HELD" ? "Tertahan Aman" : t.depositStatus}
                    </span>
                  </td>

                  {/* KTP */}
                  <td className="p-4 text-zinc-300">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono">{t.idCardNumber || "-"}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Terverifikasi</span>
                  </td>

                  {/* Emergency Contact */}
                  <td className="p-4">
                    <p className="font-semibold text-zinc-200">{t.emergencyContactName || "-"}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{t.emergencyContactPhone || "-"}</p>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openWhatsApp(t.phone, t.fullName, t.roomNumber)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat WA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check-in Penghuni Baru */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#c5a880]" />
                <h3 className="text-base font-bold text-white">Check-in Anak Kost Baru</h3>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Pilih Kamar yang Ditempati</label>
                {availableRooms.length > 0 ? (
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Kamar {r.roomNumber} - {r.type} (Lantai {r.floor}) • Rp {r.priceMonthly.toLocaleString("id-ID")}/bln
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-amber-400 text-xs">
                    Semua kamar saat ini terisi! Anda bisa mengubah status kamar di menu Denah & Kamar terlebih dahulu.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Nama Lengkap Penghuni</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="628..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Tanggal Masuk Kost</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Nominal Uang Deposit (Rp)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Nomor NIK KTP (Opsional)</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="16 Digit NIK KTP"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-xs font-bold text-zinc-300 mb-2">Kontak Darurat (Keluarga / Kerabat)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">Nama & Hubungan</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contoh: Pak Joko (Ayah)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-400 mb-1">No. HP Kontak Darurat</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="628..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={availableRooms.length === 0}
                  className="px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d6bc96] text-black font-extrabold uppercase tracking-wider disabled:opacity-50"
                >
                  Simpan & Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
