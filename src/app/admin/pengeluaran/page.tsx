"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import type { ExpenseData } from "@/lib/data";
import ModalPortal from "@/components/ui/modal-portal";
import { formatRupiahInput, parseRupiahInput } from "@/lib/rupiah";
import { Plus, X } from "lucide-react";

export default function AdminPengeluaranPage() {
  const { expenses, invoices, addExpense } = useKost();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [category, setCategory] = useState<"Listrik" | "Air/PDAM" | "WiFi" | "Kebersihan & Sampah" | "Maintenance & Perbaikan">("Listrik");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthlyIncome = invoices.filter((invoice) => invoice.status === "PAID" && invoice.paidAt?.slice(0, 7) === monthKey).reduce((sum, invoice) => sum + invoice.amount, 0);
  const monthlyExpense = expenses.filter((expense) => expense.date.slice(0, 7) === monthKey).reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyNet = monthlyIncome - monthlyExpense;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const transactions = [
    ...invoices.filter((invoice) => invoice.status === "PAID" && invoice.paidAt).map((invoice) => ({ id: `income-${invoice.id}`, kind: "Pemasukan" as const, detail: `Sewa ${invoice.periodMonth} ${invoice.periodYear} · ${invoice.tenantName}`, date: invoice.paidAt!.slice(0, 10), amount: invoice.amount })),
    ...expenses.map((expense) => ({ id: `expense-${expense.id}`, kind: "Pengeluaran" as const, detail: `${expense.category} · ${expense.description}`, date: expense.date, amount: expense.amount })),
  ].sort((a, b) => b.date.localeCompare(a.date));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    try {
      await addExpense({ category, description, amount: parseRupiahInput(amount), date });
      setIsAddModalOpen(false);
      setDescription("");
      setAmount("");
    } catch {
      // Keep the form open so the entry can be retried.
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Cashflow Operational
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pantau pemasukan sewa yang sudah dibayar dan seluruh biaya operasional.
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"><span className="text-xs text-zinc-400">Pemasukan bulan ini</span><p className="mt-1 text-xl font-semibold text-emerald-400">Rp {monthlyIncome.toLocaleString("id-ID")}</p></div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"><span className="text-xs text-zinc-400">Pengeluaran bulan ini</span><p className="mt-1 text-xl font-semibold text-rose-400">Rp {monthlyExpense.toLocaleString("id-ID")}</p></div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"><span className="text-xs text-zinc-400">Arus kas bersih</span><p className={`mt-1 text-xl font-semibold ${monthlyNet >= 0 ? "text-white" : "text-rose-400"}`}>Rp {monthlyNet.toLocaleString("id-ID")}</p></div>
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
                <th className="p-3.5 font-medium">Jenis</th>
                <th className="p-3.5 font-medium">Keterangan</th>
                <th className="p-3.5 font-medium">Tanggal</th>
                <th className="p-3.5 font-medium text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className={`p-3.5 font-medium ${transaction.kind === "Pemasukan" ? "text-emerald-400" : "text-rose-400"}`}>{transaction.kind}</td>
                  <td className="p-3.5 text-zinc-300">{transaction.detail}</td>
                  <td className="p-3.5 text-zinc-500">{transaction.date}</td>
                  <td className={`p-3.5 text-right font-medium ${transaction.kind === "Pemasukan" ? "text-emerald-400" : "text-zinc-200"}`}>
                    {transaction.kind === "Pemasukan" ? "+" : "−"}Rp {transaction.amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {!transactions.length && <tr><td colSpan={4} className="p-5 text-center text-zinc-500">Belum ada transaksi cashflow.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isAddModalOpen && (
        <ModalPortal>
        <div className="kost-modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div className="kost-modal-card w-full max-w-md overflow-y-auto rounded-2xl border shadow-2xl">
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
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(formatRupiahInput(e.target.value))}
                    required
                    placeholder="1.500.000"
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
        </ModalPortal>
      )}
    </div>
  );
}
