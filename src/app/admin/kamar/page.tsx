"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import { RoomData } from "@/lib/data";
import ImageUploader from "@/components/ui/image-uploader";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Check,
  Building,
  Bed,
  Layers,
  Sparkles,
  DollarSign,
  Info,
} from "lucide-react";

const PRESET_FACILITIES = [
  "AC Inverter",
  "Kamar Mandi Dalam",
  "Water Heater",
  "WiFi 100 Mbps",
  "Kasur Queen Size",
  "Kasur Single Size",
  "Meja & Kursi Kerja",
  "Smart TV 32\"",
  "Lemari Pakaian 2 Pintu",
  "Jendela Luar & Balkon",
  "Listrik Token Mandiri",
];

const PRESET_IMAGES: Record<string, string> = {
  Executive: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  Deluxe: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  Superior: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
  Standard: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
};

export default function AdminKamarPage() {
  const { rooms, updateRoomStatus, addRoom, updateRoom, deleteRoom } = useKost();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterFloor, setFilterFloor] = useState<number | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form States (Used for both Add & Edit)
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState<"Executive" | "Deluxe" | "Superior" | "Standard">("Deluxe");
  const [floor, setFloor] = useState(1);
  const [priceMonthly, setPriceMonthly] = useState(1950000);
  const [size, setSize] = useState("3.5 x 4 m");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    "AC Inverter",
    "Kamar Mandi Dalam",
    "Water Heater",
    "WiFi 100 Mbps",
  ]);
  const [customFacility, setCustomFacility] = useState("");
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES.Deluxe);
  const [status, setStatus] = useState<"AVAILABLE" | "OCCUPIED" | "MAINTENANCE">("AVAILABLE");

  // Quick stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
  const occupiedRooms = rooms.filter((r) => r.status === "OCCUPIED").length;
  const maintenanceRooms = rooms.filter((r) => r.status === "MAINTENANCE").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (filterFloor !== "ALL" && r.floor !== filterFloor) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNumber = r.roomNumber.toLowerCase().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      const matchTenant = r.tenantName?.toLowerCase().includes(q);
      if (!matchNumber && !matchType && !matchTenant) return false;
    }
    return true;
  });

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const openAddModal = () => {
    setRoomNumber("");
    setType("Deluxe");
    setFloor(1);
    setPriceMonthly(1950000);
    setSize("3.5 x 4 m");
    setSelectedFacilities(["AC Inverter", "Kamar Mandi Dalam", "Water Heater", "WiFi 100 Mbps"]);
    setImageUrl(PRESET_IMAGES.Deluxe);
    setStatus("AVAILABLE");
    setIsAddModalOpen(true);
  };

  const openEditModal = (room: RoomData) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setType(room.type);
    setFloor(room.floor);
    setPriceMonthly(room.priceMonthly);
    setSize(room.size);
    setSelectedFacilities([...room.facilities]);
    setImageUrl(room.image);
    setStatus(room.status);
  };

  const handleTypeChange = (newType: "Executive" | "Deluxe" | "Superior" | "Standard") => {
    setType(newType);
    if (!editingRoom) {
      setImageUrl(PRESET_IMAGES[newType] || PRESET_IMAGES.Deluxe);
      if (newType === "Executive") setPriceMonthly(2500000);
      else if (newType === "Deluxe") setPriceMonthly(1950000);
      else if (newType === "Superior") setPriceMonthly(1650000);
      else setPriceMonthly(1350000);
    }
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const addCustomFacility = () => {
    if (!customFacility.trim()) return;
    if (!selectedFacilities.includes(customFacility.trim())) {
      setSelectedFacilities((prev) => [...prev, customFacility.trim()]);
    }
    setCustomFacility("");
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    // Check duplicate roomNumber
    if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase())) {
      alert(`Nomor kamar ${roomNumber} sudah ada. Silakan gunakan nomor lain.`);
      return;
    }

    addRoom({
      roomNumber: roomNumber.trim(),
      type,
      floor: Number(floor),
      priceMonthly: Number(priceMonthly),
      size: size.trim() || "3 x 4 m",
      status,
      facilities: selectedFacilities,
      image: imageUrl.trim() || PRESET_IMAGES[type] || PRESET_IMAGES.Deluxe,
    });

    setIsAddModalOpen(false);
    showNotification(`Kamar ${roomNumber} berhasil ditambahkan ke sistem!`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    // Check duplicate roomNumber excluding self
    if (
      rooms.some(
        (r) =>
          r.id !== editingRoom.id &&
          r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase()
      )
    ) {
      alert(`Nomor kamar ${roomNumber} sudah digunakan oleh kamar lain.`);
      return;
    }

    updateRoom(editingRoom.id, {
      roomNumber: roomNumber.trim(),
      type,
      floor: Number(floor),
      priceMonthly: Number(priceMonthly),
      size: size.trim() || "3 x 4 m",
      status,
      facilities: selectedFacilities,
      image: imageUrl.trim() || editingRoom.image,
    });

    setEditingRoom(null);
    showNotification(`Informasi Kamar ${roomNumber} berhasil diperbarui!`);
  };

  const handleDeleteRoom = (room: RoomData) => {
    if (room.status === "OCCUPIED") {
      alert(`Kamar ${room.roomNumber} saat ini masih terisi oleh penghuni (${room.tenantName}). Pindahkan atau selesaikan masa sewa terlebih dahulu.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus Kamar ${room.roomNumber}? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteRoom(room.id);
      showNotification(`Kamar ${room.roomNumber} telah dihapus.`);
    }
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
            Kelola data kamar, spesifikasi fasilitas, tarif sewa bulanan, dan status ketersediaan.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kamar Baru</span>
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackMessage && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-emerald-900/60 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-zinc-500 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
          <span className="text-[11px] text-zinc-400 block font-medium">Total Kamar</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold text-white">{totalRooms}</span>
            <span className="text-[10px] text-zinc-500">Unit</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
          <span className="text-[11px] text-emerald-400 block font-medium">Kamar Tersedia</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold text-emerald-400">{availableRooms}</span>
            <span className="text-[10px] text-zinc-500">Siap Huni</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
          <span className="text-[11px] text-zinc-300 block font-medium">Kamar Terisi</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold text-white">{occupiedRooms}</span>
            <span className="text-[10px] text-zinc-400">({occupancyRate}% Okupansi)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
          <span className="text-[11px] text-amber-300 block font-medium">Dalam Perbaikan</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-semibold text-amber-300">{maintenanceRooms}</span>
            <span className="text-[10px] text-zinc-500">Servis</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. kamar, tipe, atau penghuni..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800/80">
            <span className="text-zinc-500 text-[11px] px-1.5 font-medium">Lt:</span>
            {["ALL", 1, 2, 3].map((fl) => (
              <button
                key={String(fl)}
                onClick={() => setFilterFloor(fl as any)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  filterFloor === fl
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {fl === "ALL" ? "Semua" : `Lt ${fl}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800/80">
            {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
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
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
          <Bed className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-400">Tidak ada kamar yang sesuai kriteria.</p>
          <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan filter atau tambahkan kamar baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === "OCCUPIED";
            const isAvailable = room.status === "AVAILABLE";

            return (
              <div
                key={room.id}
                className="group rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 flex flex-col justify-between hover:border-zinc-700 transition-all hover:bg-zinc-900/40"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-40 rounded-lg overflow-hidden mb-3 bg-zinc-950 border border-zinc-850">
                    <img
                      src={room.image}
                      alt={`Kamar ${room.roomNumber}`}
                      className="w-full h-full object-cover grayscale-[15%] group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-bold border border-white/10">
                      Kamar {room.roomNumber}
                    </div>

                    <div
                      className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm ${
                        isOccupied
                          ? "bg-zinc-900/90 text-zinc-300 border border-zinc-700/60"
                          : isAvailable
                          ? "bg-emerald-950/90 text-emerald-400 border border-emerald-800/60"
                          : "bg-amber-950/90 text-amber-300 border border-amber-800/60"
                      }`}
                    >
                      {isOccupied ? "Terisi" : isAvailable ? "Tersedia" : "Perbaikan"}
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold drop-shadow-sm">{room.type}</span>
                      <span className="text-[11px] text-zinc-300 drop-shadow-sm">
                        Lt {room.floor} • {room.size}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline justify-between pb-2 border-b border-zinc-800/60">
                    <div>
                      <span className="text-base font-bold text-white tracking-tight">
                        Rp {room.priceMonthly.toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-zinc-500"> / bulan</span>
                    </div>

                    <button
                      onClick={() => openEditModal(room)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Edit Kamar"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Occupant Info */}
                  <div className="mt-2.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-850 text-xs">
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Penghuni:</span>
                    <p className="text-xs text-zinc-200 font-medium truncate mt-0.5">
                      {isOccupied ? room.tenantName : isAvailable ? "Belum ada penyewa (Siap huni)" : "Non-aktif (Dalam servis)"}
                    </p>
                  </div>

                  {/* Facilities list preview */}
                  <div className="mt-2.5">
                    <span className="text-[10px] text-zinc-500 block mb-1 font-medium">Fasilitas ({room.facilities.length}):</span>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 truncate max-w-[120px]">
                          {f}
                        </span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                          +{room.facilities.length - 3} lagi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Quick Status & Delete */}
                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateRoomStatus(room.id, "AVAILABLE")}
                      disabled={isAvailable}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        isAvailable
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      Kosong
                    </button>
                    <button
                      onClick={() => updateRoomStatus(room.id, "OCCUPIED")}
                      disabled={isOccupied}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        isOccupied
                          ? "bg-zinc-800 text-white font-medium"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      Terisi
                    </button>
                    <button
                      onClick={() => updateRoomStatus(room.id, "MAINTENANCE")}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        room.status === "MAINTENANCE"
                          ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      Servis
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="p-1.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Hapus Kamar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Tambah Kamar Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white">Tambah Kamar Baru</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Row 1: Nomor Kamar & Lantai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nomor Kamar <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Contoh: 105, 204"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Lantai Gedung</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                    <option value={4}>Lantai 4</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Tipe Kamar & Ukuran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Tipe Kamar</label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Superior">Superior</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Ukuran / Dimensi</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="3.5 x 4 m"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Row 3: Tarif Sewa Bulanan */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Tarif Sewa Bulanan (Rp) <span className="text-rose-400">*</span></label>
                <input
                  type="number"
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(Number(e.target.value))}
                  required
                  min={100000}
                  step={50000}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Row 4: Upload Foto Kamar Langsung */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Foto Kamar (Upload Langsung dari Perangkat)
                </label>
                <ImageUploader
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  presetFallback={PRESET_IMAGES[type]}
                />
              </div>

              {/* Row 5: Checklist Fasilitas */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">Pilihan Fasilitas Kamar:</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg bg-zinc-900/60 border border-zinc-850">
                  {PRESET_FACILITIES.map((f) => {
                    const isSelected = selectedFacilities.includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => toggleFacility(f)}
                        className={`px-2 py-1 rounded text-left text-[11px] transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-zinc-800 text-white font-medium border border-zinc-700"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded flex items-center justify-center ${isSelected ? "bg-white text-black" : "border border-zinc-700"}`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="truncate">{f}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tambah fasilitas custom */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customFacility}
                    onChange={(e) => setCustomFacility(e.target.value)}
                    placeholder="Tambah fasilitas lain..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomFacility();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomFacility}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-colors"
                >
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Informasi Kamar */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold text-white">
                  Edit Informasi Kamar {editingRoom.roomNumber}
                </h3>
              </div>
              <button onClick={() => setEditingRoom(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Row 1: Nomor Kamar, Lantai & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">No. Kamar</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Lantai</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                    <option value={4}>Lantai 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  >
                    <option value="AVAILABLE">Tersedia (Kosong)</option>
                    <option value="OCCUPIED">Terisi Penghuni</option>
                    <option value="MAINTENANCE">Dalam Perbaikan</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Tipe Kamar & Ukuran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Tipe Kamar</label>
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
                  <label className="block text-zinc-400 mb-1 font-medium">Ukuran / Dimensi</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="3.5 x 4 m"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Row 3: Tarif Sewa Bulanan */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Tarif Sewa Bulanan (Rp)</label>
                <input
                  type="number"
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(Number(e.target.value))}
                  required
                  min={100000}
                  step={50000}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Row 4: Upload Foto Kamar Langsung */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Foto Kamar (Upload Langsung dari Perangkat)
                </label>
                <ImageUploader
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  presetFallback={editingRoom?.image}
                />
              </div>

              {/* Row 5: Checklist Fasilitas */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">Fasilitas Kamar:</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-lg bg-zinc-900/60 border border-zinc-850">
                  {PRESET_FACILITIES.map((f) => {
                    const isSelected = selectedFacilities.includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => toggleFacility(f)}
                        className={`px-2 py-1 rounded text-left text-[11px] transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-zinc-800 text-white font-medium border border-zinc-700"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded flex items-center justify-center ${isSelected ? "bg-white text-black" : "border border-zinc-700"}`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span className="truncate">{f}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tambah fasilitas custom */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customFacility}
                    onChange={(e) => setCustomFacility(e.target.value)}
                    placeholder="Tambah fasilitas lain..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomFacility();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomFacility}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
