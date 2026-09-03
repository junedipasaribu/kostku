"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";

export default function TenantKomplainPage() {
  const { currentUser, tenants, complaints, addComplaint } = useKost();

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const myComplaints = complaints.filter(
    (c) => c.roomNumber === tenant?.roomNumber || c.tenantName.includes(tenant?.fullName || "")
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addComplaint({
      tenantId: tenant?.id || "t101",
      tenantName: tenant?.fullName || "Budi Santoso",
      roomNumber: tenant?.roomNumber || "101",
      title,
      description,
      status: "OPEN",
    });

    setIsSubmitted(true);
    setTitle("");
    setDescription("");
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Lapor Kerusakan Fasilitas
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Kamar {tenant?.roomNumber} mengalami kendala? Ajukan tiket perbaikan di sini.
        </p>
      </div>

      {isSubmitted && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
          ✓ Laporan berhasil diajukan. Pengelola akan segera menindaklanjuti.
        </div>
      )}

      {/* Form */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
        <h2 className="text-sm font-semibold text-white">Formulir Laporan</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Judul Kendala</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC tidak dingin / Kran bocor / Lampu mati"
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Keterangan Detail</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jelaskan sejak kapan kendala terjadi..."
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors"
          >
            Kirim Laporan
          </button>
        </form>
      </div>

      {/* My Complaints List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Riwayat Laporan ({myComplaints.length})</h3>
        {myComplaints.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{c.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    c.status === "RESOLVED"
                      ? "bg-zinc-800 text-zinc-400"
                      : c.status === "IN_PROGRESS"
                      ? "bg-amber-950/60 text-amber-300 border border-amber-900/60"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {c.status === "RESOLVED" ? "Selesai" : c.status === "IN_PROGRESS" ? "Dikerjakan" : "Baru"}
                </span>
              </div>
              <p className="text-zinc-400 mt-0.5">{c.description}</p>
              <span className="text-[10px] text-zinc-500 mt-1 block">{c.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
