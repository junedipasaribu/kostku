"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import {
  Wallet,
  Plus,
  Zap,
  Droplets,
  Wifi,
  Trash2,
  Wrench,
  Calendar,
  X
} from "lucide-react";

export default function AdminPengeluaranPage() {
  const { expenses, addExpense } = useKost();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [category, setCategory] = useState<"Listrik" | "Air/PDAM" | "WiFi" | "Kebersihan & Sampah" | "Maintenance & Perbaikan">("Listrik");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(500000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Listrik": return <Zap className="w-4 h-4 text-amber-400" />;
      case "Air/PDAM": return <Droplets className="w-4 h-4 text-sky-400" />;
      case "WiFi": return <Wifi className="w-4 h-4 text-purple-400" />;
      case "Kebersihan & Sampah": return <Trash2 className="w-4 h-4 text-emerald-400" />;
      default: return <Wrench className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    addExpense({
      category,
      description,
      amount: Number(amount),
      date,
    });

    setIsAddModalOpen(false);
    setDescription("");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pengeluaran Operasional Gedung
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Catat dan pantau seluruh biaya operasional: listrik induk, air PDAM, internet WiFi, kebersihan, dan pemeliharaan gedung.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#d6bc96] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c5a880]/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pengeluaran</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <span className="text-xs text-zinc-400 font-semibold">Total Beban Bulan Ini</span>
          <p className="text-3xl font-black text-rose-400 mt-2">
            Rp {totalExpense.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">5 transaksi operasional tercatat</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <span className="text-xs text-zinc-400 font-semibold">Beban Utilitas Terbesar</span>
          <p className="text-2xl font-bold text-amber-300 mt-2">Listrik Induk</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Rp 1.250.000 / bulan</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <span className="text-xs text-zinc-400 font-semibold">Internet & Fasilitas</span>
          <p className="text-2xl font-bold text-purple-300 mt-2">Biznet 100 Mbps</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Rp 650.000 / bulan</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-zinc-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Keterangan Pengeluaran</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold text-right">Nominal Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-bold text-white">
                      {getCategoryIcon(exp.category)}
                      <span>{exp.category}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300 font-medium">
                    {exp.description}
                  </td>
                  <td className="p-4 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{exp.date}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-black text-rose-400 text-sm">
                    Rp {exp.amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Pengeluaran */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Catat Pengeluaran Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-400 mb-1">Kategori Biaya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="Listrik">Listrik (Token / Induk Gedung)</option>
                  <option value="Air/PDAM">Air / PDAM</option>
                  <option value="WiFi">WiFi / Internet</option>
                  <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                  <option value="Maintenance & Perbaikan">Maintenance & Perbaikan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-400 mb-1">Keterangan Pengeluaran</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli Token Listrik Pompa Air"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
