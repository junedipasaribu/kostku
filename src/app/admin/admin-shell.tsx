"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { building, logout, rooms, invoices, complaints } = useKost();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pendingVerificationCount = invoices.filter((i) => i.status === "PENDING_VERIFICATION").length;
  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED").length;

  const navItems = [
    {
      label: "Ringkasan",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Kamar & Denah",
      href: "/admin/kamar",
      icon: DoorClosed,
      badge: `${rooms.filter((r) => r.status === "AVAILABLE").length}`,
    },
    {
      label: "Data Penghuni",
      href: "/admin/penghuni",
      icon: Users,
    },
    {
      label: "Tagihan & Sewa",
      href: "/admin/tagihan",
      icon: Receipt,
      badge: pendingVerificationCount > 0 ? `${pendingVerificationCount}` : undefined,
    },
    {
      label: "Beban Operasional",
      href: "/admin/pengeluaran",
      icon: Wallet,
    },
    {
      label: "Komplain Fasilitas",
      href: "/admin/komplain",
      icon: AlertCircle,
      badge: openComplaintsCount > 0 ? `${openComplaintsCount}` : undefined,
    },
    {
      label: "Pengaturan Kost",
      href: "/admin/pengaturan",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs">
            K
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            Kostku <span className="text-zinc-400 font-normal text-xs">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact className="px-2.5" />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Minimalist Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
                K
              </div>
              <div>
                <span className="text-sm font-semibold text-white tracking-tight">
                  Kostku
                </span>
                <span className="block text-[11px] text-zinc-500 font-medium">
                  {building.name}
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
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

        {/* Footer Profile */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <ThemeToggle className="w-full" />
          <div className="px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-medium text-zinc-200 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500">Pengelola</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-1.5 px-3 rounded-lg text-zinc-400 hover:text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Buka Website Publik</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto overflow-x-hidden max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
