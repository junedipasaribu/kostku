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
  Menu,
  X,
  ExternalLink,
  Settings,
  History,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BackgroundPicker } from "@/components/ui/background-picker";

export default function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { building, logout, rooms, invoices, complaints, paymentAlerts, dismissPaymentAlert } = useKost();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

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
      label: "Cashflow Operational",
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
      label: "Log Aktivitas",
      href: "/admin/aktivitas",
      icon: History,
    },
    {
      label: "Pengaturan Kost",
      href: "/admin/pengaturan",
      icon: Settings,
    },
  ];

  const shortNavLabels: Record<string, string> = {
    "/admin": "Ringkasan",
    "/admin/kamar": "Kamar",
    "/admin/penghuni": "Penghuni",
    "/admin/tagihan": "Tagihan",
    "/admin/pengeluaran": "Cashflow",
    "/admin/komplain": "Komplain",
    "/admin/aktivitas": "Aktivitas",
    "/admin/pengaturan": "Pengaturan",
  };

  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event("kostku:session-changed"));
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 antialiased">
      {paymentAlerts.length > 0 && (
        <div className="fixed right-4 top-4 z-[70] w-[min(380px,calc(100vw-2rem))] space-y-2" aria-live="polite">
          {paymentAlerts.map((alert) => (
            <div key={alert.id} role="status" className="rounded-xl border border-amber-500/50 bg-zinc-900 p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-amber-300">Bukti pembayaran baru</p>
                  <p className="mt-1 text-xs text-zinc-200">Kamar {alert.roomNumber} · {alert.tenantName}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">{alert.invoiceNumber} · Rp {alert.amount.toLocaleString("id-ID")}</p>
                </div>
                <button type="button" onClick={() => dismissPaymentAlert(alert.id)} aria-label="Tutup notifikasi" className="text-zinc-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Link href="/admin/tagihan" onClick={() => dismissPaymentAlert(alert.id)} className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200">
                Buka verifikasi
              </Link>
            </div>
          ))}
        </div>
      )}
      <header className="theme-brand-header sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div className="kost-floating-nav relative mx-auto flex h-16 max-w-[1680px] items-center gap-3 rounded-full border px-3 sm:px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Kostku Admin">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#c5a880] to-[#8a6839] text-sm font-black text-black shadow-lg shadow-[#c5a880]/20">K</span>
            <span className="hidden text-sm font-semibold tracking-tight text-white sm:inline">Kostku <span className="font-normal text-zinc-400">Admin</span></span>
          </Link>

          <nav aria-label="Navigasi admin" className="kost-nav-scrollbar hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  onClick={() => setIsNavigationOpen(false)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-2 text-[11px] font-medium transition-colors 2xl:gap-2 2xl:px-3 ${
                    isActive
                      ? "border-white/15 bg-white/10 text-white shadow-inner"
                      : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#e2c59d]" : "text-zinc-500"}`} />
                  <span className="2xl:hidden">{shortNavLabels[item.href]}</span>
                  <span className="hidden 2xl:inline">{item.label}</span>
                  {item.badge && (
                    <span className={`min-w-4 rounded-full px-1 text-center text-[9px] font-mono ${isActive ? "bg-white/10 text-white" : "bg-white/10 text-zinc-400"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle compact className="rounded-full px-2.5" />
            <BackgroundPicker compact className="rounded-full" placement="bottom" />
            <button
              type="button"
              aria-label={isNavigationOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={isNavigationOpen}
              aria-controls="admin-floating-menu"
              onClick={() => setIsNavigationOpen((open) => !open)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 text-zinc-200 transition-colors hover:bg-white/10 sm:px-3"
            >
              {isNavigationOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="hidden max-w-28 truncate text-xs font-medium sm:inline">{user.name}</span>
            </button>
          </div>

          {isNavigationOpen && (
            <div id="admin-floating-menu" className="kost-floating-menu absolute left-1 right-1 top-[calc(100%+0.65rem)] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-white/10 p-3 shadow-2xl backdrop-blur-2xl md:left-auto md:right-0 md:w-80">
              <nav aria-label="Navigasi admin seluler" className="space-y-1 md:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsNavigationOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-medium transition-colors ${isActive ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                    >
                      <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" />{item.label}</span>
                      {item.badge && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">{item.badge}</span>}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 px-2 py-3 md:mt-0 md:border-t-0 md:pt-1">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{user.name}</p>
                  <p className="truncate text-[10px] text-zinc-400">{building.name} · Pengelola</p>
                </div>
                <button type="button" onClick={handleLogout} title="Logout" aria-label="Logout" className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <Link href="/" target="_blank" onClick={() => setIsNavigationOpen(false)} className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white">
                Buka Website Publik <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-w-0 p-6 sm:p-8 lg:p-10 overflow-x-hidden max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
