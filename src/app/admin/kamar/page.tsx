"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { Plus, X, Layers, Check } from "lucide-react";

export default function AdminKamarPage() {
  const { rooms, updateRoomStatus, addRoom } = useKost();
  const [filterFloor, setFilterFloor] = useState<number | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Denah & Manajemen Kamar
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar kamar gedung per lantai, tarif sewa, dan status ketersediaan.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kamar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-medium mr-2">Lantai:</span>
          {["ALL", 1, 2].map((fl) => (
            <button
              key={String(fl)}
              onClick={() => setFilterFloor(fl as any)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterFloor === fl
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {fl === "ALL" ? "Semua" : `Lantai ${fl}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-medium mr-2">Status:</span>
          {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === st
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "Semua" : st === "AVAILABLE" ? "Tersedia" : st === "OCCUPIED" ? "Terisi" : "Servis"}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === "OCCUPIED";
          const isAvailable = room.status === "AVAILABLE";

          return (
            <div
              key={room.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 flex flex-col justify-between hover:border-zinc-700 transition-colors"
            >
              <div>
                <div className="relative h-36 rounded-lg overflow-hidden mb-3 bg-zinc-950">
                  <img
                    src={room.image}
                    alt={`Kamar ${room.roomNumber}`}
                    className="w-full h-full object-cover grayscale-[20%] contrast-[105%]"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-semibold">
                    Kamar {room.roomNumber}
                  </div>
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium ${
                      isOccupied
                        ? "bg-zinc-900/90 text-zinc-300 border border-zinc-700/60"
                        : isAvailable
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/60"
                        : "bg-amber-950/80 text-amber-300 border border-amber-900/60"
                    }`}
                  >
                    {isOccupied ? "Terisi" : isAvailable ? "Tersedia" : "Servis"}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{room.type}</span>
                  <span className="text-[11px] text-zinc-500">Lt {room.floor} • {room.size}</span>
                </div>

                <div className="mt-1">
                  <span className="text-sm font-semibold text-white">
                    Rp {room.priceMonthly.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[11px] text-zinc-500"> /bln</span>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-zinc-950/60 border border-zinc-900 text-xs">
                  <span className="text-[11px] text-zinc-400">
                    {isOccupied ? `Penyewa: ${room.tenantName}` : isAvailable ? "Kamar siap huni" : "Perbaikan fasilitas"}
                  </span>
                </div>
              </div>

              {/* Status Action */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-1 text-[11px]">
                <span className="text-zinc-500 text-[10px]">Status:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateRoomStatus(room.id, "AVAILABLE")}
                    disabled={isAvailable}
                    className={`px-2 py-0.5 rounded ${
                      isAvailable ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Kosong
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "OCCUPIED")}
                    disabled={isOccupied}
                    className={`px-2 py-0.5 rounded ${
                      isOccupied ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Terisi
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room.id, "MAINTENANCE")}
                    className="px-2 py-0.5 rounded text-zinc-500 hover:text-zinc-300"
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
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-semibold text-white">Tambah Kamar Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nomor Kamar</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="105"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Lantai</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Tipe</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Superior">Superior</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tarif Bulanan</label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Fasilitas</label>
                <textarea
                  value={facilityText}
                  onChange={(e) => setFacilityText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
