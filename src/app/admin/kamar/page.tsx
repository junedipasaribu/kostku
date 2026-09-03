"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { 
  DoorClosed, 
  Plus, 
  CheckCircle2, 
  Users, 
  Wrench, 
  Sparkles, 
  X,
  Layers
} from "lucide-react";

export default function AdminKamarPage() {
  const { rooms, updateRoomStatus, addRoom } = useKost();
  const [filterFloor, setFilterFloor] = useState<number | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState<"Executive" | "Deluxe" | "Superior" | "Standard">("Deluxe");
  const [floor, setFloor] = useState(1);
  const [priceMonthly, setPriceMonthly] = useState(1950000);
  const [size, setSize] = useState("3.5 x 4 m");
  const [facilityText, setFacilityText] = useState("AC Inverter, Kamar Mandi Dalam, Water Heater, WiFi 100 Mbps, Kasur Single");

  const filteredRooms = rooms.filter((r) => {
    if (filterFloor !== "ALL" && r.floor !== filterFloor) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    addRoom({
      roomNumber,
      type,
      floor,
      priceMonthly: Number(priceMonthly),
      size,
      status: "AVAILABLE",
      facilities: facilityText.split(",").map((f) => f.trim()),
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    });

    setIsAddModalOpen(false);
    setRoomNumber("");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Denah & Manajemen Kamar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Kelola ketersediaan kamar, tarif sewa bulanan, dan status operasional per lantai.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#d6bc96] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kamar Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
        {/* Floor Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Lantai:
          </span>
          <button
            onClick={() => setFilterFloor("ALL")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterFloor === "ALL" ? "bg-[#c5a880] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            Semua Lantai
          </button>
          <button
            onClick={() => setFilterFloor(1)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterFloor === 1 ? "bg-[#c5a880] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            Lantai 1
          </button>
          <button
            onClick={() => setFilterFloor(2)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterFloor === 2 ? "bg-[#c5a880] text-black" : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            Lantai 2
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider mr-2">Status:</span>
          {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterStatus === st ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "Semua" : st === "AVAILABLE" ? "Tersedia" : st === "OCCUPIED" ? "Terisi" : "Perbaikan"}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === "OCCUPIED";
          const isAvailable = room.status === "AVAILABLE";
          const isMaintenance = room.status === "MAINTENANCE";

          return (
            <div
              key={room.id}
              className={`rounded-3xl border bg-zinc-900/80 p-5 flex flex-col justify-between transition-all group ${
                isOccupied
                  ? "border-blue-500/30 hover:border-blue-500/60"
                  : isAvailable
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : "border-amber-500/30 hover:border-amber-500/60"
              }`}
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={room.image}
                    alt={`Kamar ${room.roomNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-black">
                    Kamar {room.roomNumber}
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                      isOccupied
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : isAvailable
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {isOccupied ? "Terisi" : isAvailable ? "Tersedia" : "Perbaikan"}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">{room.type}</span>
                  <span className="text-xs text-zinc-400">Lantai {room.floor} • {room.size}</span>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#c5a880]">
                    Rp {room.priceMonthly.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-zinc-500">/ bulan</span>
                </div>

                {/* Tenant / Status Info */}
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  {isOccupied ? (
                    <div className="flex items-center gap-2 text-blue-300">
                      <Users className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold truncate">{room.tenantName || "Penyewa Aktif"}</p>
                        <p className="text-[10px] text-zinc-400">Penyewa Aktif</p>
                      </div>
                    </div>
                  ) : isAvailable ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-bold">Kamar Siap Huni</p>
                        <p className="text-[10px] text-zinc-400">Kunci & inventaris siap</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                      <Wrench className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-bold">Dalam Maintenance</p>
                        <p className="text-[10px] text-zinc-400">Perbaikan fasilitas</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Facilities Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.facilities.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                      {f}
                    </span>
                  ))}
                  {room.facilities.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">
                      +{room.facilities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Update Quick Action */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <span className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">
                  Ubah Status Operasional:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    onClick={() => updateRoomStatus(room.id, "AVAILABLE")}
                    disabled={isAvailable}
                    className={`py-1.5 rounded-lg transition-all ${
                      isAvailable
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Kosong
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "OCCUPIED")}
                    disabled={isOccupied}
                    className={`py-1.5 rounded-lg transition-all ${
                      isOccupied
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Terisi
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "MAINTENANCE")}
                    disabled={isMaintenance}
                    className={`py-1.5 rounded-lg transition-all ${
                      isMaintenance
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Servis
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Room */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Tambah Kamar Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Nomor Kamar</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Contoh: 105"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Lantai</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Tipe Kamar</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Superior">Superior</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Tarif Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Ukuran Kamar</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Contoh: 3.5 x 4 m"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Fasilitas (Pisahkan dengan koma)</label>
                <textarea
                  value={facilityText}
                  onChange={(e) => setFacilityText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d6bc96] text-black font-extrabold uppercase tracking-wider"
                >
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
