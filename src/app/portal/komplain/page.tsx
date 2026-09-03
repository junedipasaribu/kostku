"use client";

import React, { useState } from "react";
import { useKost } from "@/lib/kost-context";
import {
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  Wrench,
  Calendar,
  Send,
  HelpCircle
} from "lucide-react";

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
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Lapor Kerusakan & Fasilitas Kamar
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Kamar {tenant?.roomNumber} mengalami kendala? Buat laporan tiket perbaikan di sini agar teknisi pengelola segera menanganinya.
        </p>
      </div>

      {isSubmitted && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Laporan Anda telah berhasil terkirim ke tim pengelola gedung! Kami akan segera menindaklanjutinya.</span>
        </div>
      )}

      {/* Form Lapor Kerusakan */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#c5a880]" />
          <span>Formulir Laporan Kerusakan Baru</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-400 mb-1.5">
              Judul Kendala / Kerusakan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: AC kamar tidak dingin / Kran shower bocor / Lampu mati"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-400 mb-1.5">
              Penjelasan Detail Kendala
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Jelaskan sejak kapan masalah terjadi dan apa yang Anda amati di kamar..."
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#a48256] text-black font-extrabold uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-[#c5a880]/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Laporan Kerusakan</span>
          </button>
        </form>
      </div>

      {/* Daftar Tiket Komplain Saya */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Status Laporan Anda ({myComplaints.length})</h3>

        {myComplaints.length > 0 ? (
          myComplaints.map((c) => {
            const isOpen = c.status === "OPEN";
            const isInProgress = c.status === "IN_PROGRESS";
            const isResolved = c.status === "RESOLVED";

            return (
              <div
                key={c.id}
                className={`p-6 rounded-3xl border bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isOpen
                    ? "border-red-500/30"
                    : isInProgress
                    ? "border-amber-500/30"
                    : "border-emerald-500/30"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{c.title}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        isOpen
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : isInProgress
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isOpen ? "Menunggu Penanganan" : isInProgress ? "Sedang Dikerjakan Teknisi" : "Selesai Diperbaiki"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{c.description}</p>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> Dilaporkan pada {c.date}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 text-center text-zinc-400 text-xs">
            Belum ada laporan kerusakan yang diajukan untuk kamar Anda.
          </div>
        )}
      </div>
    </div>
  );
}
