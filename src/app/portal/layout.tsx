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
  Menu,
  X,
  Phone,
} from "lucide-react";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { building, currentUser, logout, tenants, rooms, invoices } = useKost();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tenant = tenants.find((t) => t.id === currentUser.tenantId) || tenants[0];
  const room = rooms.find((r) => r.roomNumber === (tenant?.roomNumber || "101"));

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
      badge: unpaidCount > 0 ? "Pending" : "Lunas",
    },
    {
      label: "Lapor Fasilitas",
      href: "/portal/komplain",
      icon: AlertCircle,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs">
            K
          </div>
          <span className="font-semibold text-white text-sm">
            Kamar {tenant?.roomNumber}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="px-2 pt-1 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
                K
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Kostku</span>
                <span className="block text-[11px] text-zinc-500 font-medium">Portal Penghuni</span>
              </div>
            </Link>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 uppercase font-medium">Kamar Anda</span>
            <p className="text-sm font-semibold text-white mt-0.5">Kamar {tenant?.roomNumber} ({room?.type})</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{tenant?.fullName}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/90 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? "bg-zinc-700 text-zinc-200"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800"
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

        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <a
            href={`https://wa.me/${building.ownerPhone}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Pengelola</span>
          </a>

          <div className="px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400 truncate">{tenant?.fullName}</span>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto overflow-x-hidden max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
