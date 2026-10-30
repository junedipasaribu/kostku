"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import type { ExpenseData } from "@/lib/data";
import { Plus, X } from "lucide-react";

export default function AdminPengeluaranPage() {
  const { expenses, addExpense } = useKost();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [category, setCategory] = useState<"Listrik" | "Air/PDAM" | "WiFi" | "Kebersihan & Sampah" | "Maintenance & Perbaikan">("Listrik");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(500000);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Chart data: pengeluaran per kategori
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const maxAmount = Math.max(...Object.values(byCategory), 1);

  const CATEGORY_COLORS: Record<string, string> = {
    "Listrik": "bg-yellow-600/60",
    "Air/PDAM": "bg-blue-600/60",
    "WiFi": "bg-indigo-600/60",
    "Kebersihan & Sampah": "bg-emerald-700/60",
    "Maintenance & Perbaikan": "bg-orange-600/60",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Pengeluaran Operasional
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pencatatan biaya utilitas dan operasional gedung kosan.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Catat Pengeluaran</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-400">Total Pengeluaran Bulan Ini</span>
          <p className="text-xl font-semibold text-white mt-1">
            Rp {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>
        <span className="text-xs text-zinc-500">{expenses.length} transaksi tercatat</span>
      </div>

      {/* Chart: Breakdown per Kategori */}
      {Object.keys(byCategory).length > 0 && (
        <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white mb-4">Breakdown per Kategori</h2>
          <div className="space-y-3">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => {
                const pct = Math.round((amt / totalExpense) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{cat}</span>
                      <span className="text-zinc-400">{pct}% · Rp {amt.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-4 rounded bg-zinc-900 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${CATEGORY_COLORS[cat] || 'bg-zinc-600/60'}`}
                        style={{ width: `${(amt / maxAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 bg-zinc-950/40">
                <th className="p-3.5 font-medium">Kategori</th>
                <th className="p-3.5 font-medium">Keterangan</th>
                <th className="p-3.5 font-medium">Tanggal</th>
                <th className="p-3.5 font-medium text-right">Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5 font-medium text-white">{exp.category}</td>
                  <td className="p-3.5 text-zinc-400">{exp.description}</td>
                  <td className="p-3.5 text-zinc-500">{exp.date}</td>
                  <td className="p-3.5 text-right font-medium text-white">
                    Rp {exp.amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-semibold text-white">Catat Pengeluaran</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseData["category"])}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                >
                  <option value="Listrik">Listrik (Token / Induk)</option>
                  <option value="Air/PDAM">Air / PDAM</option>
                  <option value="WiFi">WiFi Internet</option>
                  <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                  <option value="Maintenance & Perbaikan">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli Token Listrik"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
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
