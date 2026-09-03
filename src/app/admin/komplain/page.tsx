"use client";

import React from "react";
import { useKost } from "@/lib/kost-context";

export default function AdminKomplainPage() {
  const { complaints, updateComplaintStatus } = useKost();

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Laporan Kerusakan & Fasilitas
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar keluhan fasilitas kamar dari anak kost.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>{openCount} baru</span>
          <span>•</span>
          <span>{inProgressCount} dikerjakan</span>
          <span>•</span>
          <span>{resolvedCount} selesai</span>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {complaints.map((c) => {
          const isOpen = c.status === "OPEN";
          const isInProgress = c.status === "IN_PROGRESS";
          const isResolved = c.status === "RESOLVED";

          return (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs">Kamar {c.roomNumber}</span>
                  <span className="text-[11px] text-zinc-400">• {c.tenantName}</span>
                  <span className="text-[10px] text-zinc-500">• {c.date}</span>
                </div>
                <h3 className="text-sm font-medium text-zinc-100">{c.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{c.description}</p>
              </div>

              {/* Status Action */}
              <div className="flex items-center gap-1 shrink-0 text-xs">
                <button
                  onClick={() => updateComplaintStatus(c.id, "OPEN")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    isOpen ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Baru
                </button>
                <button
                  onClick={() => updateComplaintStatus(c.id, "IN_PROGRESS")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    isInProgress ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Dikerjakan
                </button>
                <button
                  onClick={() => updateComplaintStatus(c.id, "RESOLVED")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    isResolved ? "bg-zinc-800 text-white font-medium" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Selesai ✓
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
