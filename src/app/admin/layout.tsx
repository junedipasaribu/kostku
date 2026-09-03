"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useKost } from "@/lib/kost-context";
import {
  LayoutDashboard,
  DoorClosed,
  Users,
  Receipt,
  Wallet,
  AlertCircle,
  LogOut,
  Building2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { building, currentUser, logout, rooms, invoices, complaints } = useKost();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingVerificationCount = invoices.filter((i) => i.status === "PENDING_VERIFICATION").length;
  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED").length;

  const navItems = [
    {
      label: "Ringkasan Gedung",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Denah & Kamar",
      href: "/admin/kamar",
      icon: DoorClosed,
      badge: `${rooms.filter((r) => r.status === "AVAILABLE").length} Kosong`,
    },
    {
      label: "Data Penghuni & Deposit",
      href: "/admin/penghuni",
      icon: Users,
    },
    {
      label: "Tagihan & Pembayaran",
      href: "/admin/tagihan",
      icon: Receipt,
      badge: pendingVerificationCount > 0 ? `${pendingVerificationCount} Perlu Cek` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      label: "Pengeluaran Gedung",
      href: "/admin/pengeluaran",
      icon: Wallet,
    },
    {
      label: "Laporan Kerusakan",
      href: "/admin/komplain",
      icon: AlertCircle,
      badge: openComplaintsCount > 0 ? `${openComplaintsCount}` : undefined,
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#090807] text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-sm">
            K
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-wide">
              KOST<span className="text-[#c5a880]">KU</span>
            </span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-white/10 p-5 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="mb-8">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#c5a880]/20">
                K
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wider">
                  KOST<span className="text-[#c5a880]">KU</span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Admin Gedung
                </p>
              </div>
            </a>
          </div>

          {/* Building Card Info */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
            <div className="flex items-center gap-2 text-[#c5a880] mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-xs font-bold truncate">{building.name}</span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate">{building.address}</p>
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Pemilik:</span>
              <span className="font-semibold text-white truncate max-w-[110px]">{building.ownerName}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/20 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        isActive
                          ? "bg-black/20 text-black border-black/30"
                          : item.badgeColor || "bg-white/10 text-zinc-300 border-white/10"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar / Profile & Switch */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Mode Pengelola (Owner)</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[#090807] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
