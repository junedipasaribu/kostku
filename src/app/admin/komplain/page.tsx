"use client";

import React from "react";
import { useKost } from "@/lib/kost-context";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Wrench,
  Calendar,
  User,
  Building2
} from "lucide-react";

export default function AdminKomplainPage() {
  const { complaints, updateComplaintStatus } = useKost();

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Laporan Kerusakan & Maintenance
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Pantau dan tangani keluhan fasilitas dari anak kost (AC, kran air, lampu, pipa, dan fasilitas umum).
        </p>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-red-300 font-bold uppercase tracking-wider">Menunggu Ditangani</span>
            <p className="text-2xl font-black text-white mt-1">{openCount} Tiket</p>
          </div>
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Sedang Dikerjakan</span>
            <p className="text-2xl font-black text-white mt-1">{inProgressCount} Tiket</p>
          </div>
          <Clock className="w-6 h-6 text-amber-400" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Selesai Diperbaiki</span>
            <p className="text-2xl font-black text-white mt-1">{resolvedCount} Tiket</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((c) => {
          const isOpen = c.status === "OPEN";
          const isInProgress = c.status === "IN_PROGRESS";
          const isResolved = c.status === "RESOLVED";

          return (
            <div
              key={c.id}
              className={`p-6 rounded-3xl border bg-zinc-900/80 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                isOpen
                  ? "border-red-500/30"
                  : isInProgress
                  ? "border-amber-500/30"
                  : "border-emerald-500/30"
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-white font-black text-xs">
                    Kamar {c.roomNumber}
                  </span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {c.tenantName}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {c.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{c.description}</p>
              </div>

              {/* Status & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5 text-xs font-bold">
                  <button
                    onClick={() => updateComplaintStatus(c.id, "OPEN")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      isOpen ? "bg-red-600 text-white shadow-md shadow-red-900/40" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => updateComplaintStatus(c.id, "IN_PROGRESS")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      isInProgress ? "bg-amber-600 text-white shadow-md shadow-amber-900/40" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Dikerjakan
                  </button>
                  <button
                    onClick={() => updateComplaintStatus(c.id, "RESOLVED")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      isResolved ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Selesai ✓
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
