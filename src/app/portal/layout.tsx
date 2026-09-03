"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useKost } from "@/lib/kost-context";
import {
  Home,
  Receipt,
  AlertCircle,
  LogOut,
  Building2,
  Menu,
  X,
  Phone,
  ShieldCheck,
  User,
  CheckCircle2
} from "lucide-react";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { building, currentUser, logout, invoices, tenants, rooms } = useKost();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Find logged in tenant info
  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const room = rooms.find((r) => r.roomNumber === (tenant?.roomNumber || "101"));

  // Invoices for this tenant
  const myInvoices = invoices.filter((i) => i.tenantPhone === tenant?.phone || i.roomNumber === tenant?.roomNumber);
  const unpaidCount = myInvoices.filter((i) => i.status === "UNPAID").length;

  const navItems = [
    {
      label: "Kamar & Info Sewa",
      href: "/portal",
      icon: Home,
    },
    {
      label: "Bayar & Tagihan",
      href: "/portal/tagihan",
      icon: Receipt,
      badge: unpaidCount > 0 ? "Belum Bayar" : "Lunas",
      badgeColor: unpaidCount > 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      label: "Lapor Kerusakan",
      href: "/portal/komplain",
      icon: AlertCircle,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#090807] text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-sm">
            K
          </div>
          <div>
            <span className="font-black text-white text-sm tracking-wide">
              KOST<span className="text-[#c5a880]">KU</span>
            </span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              Kamar {tenant?.roomNumber}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-white/10 p-5 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#c5a880]/20">
                K
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wider">
                  KOST<span className="text-[#c5a880]">KU</span>
                </h1>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Portal Penghuni
                </p>
              </div>
            </Link>
          </div>

          {/* Tenant Room Badge Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kamar Saya</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Aktif
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">Kamar {tenant?.roomNumber}</span>
              <span className="text-xs text-[#c5a880] font-semibold">({room?.type})</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 truncate font-medium">{tenant?.fullName}</p>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
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
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Contact & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <a
            href={`https://wa.me/${building.ownerPhone}?text=${encodeURIComponent(`Halo Pengelola ${building.name}, saya ${tenant?.fullName} dari Kamar ${tenant?.roomNumber}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Pengelola WA</span>
          </a>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{tenant?.fullName}</p>
              <p className="text-[10px] text-zinc-500">Penghuni Terdaftar</p>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[#090807] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
