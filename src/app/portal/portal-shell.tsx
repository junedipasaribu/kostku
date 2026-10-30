"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, Home, LogOut, Menu, Phone, Receipt, X } from "lucide-react";
import { initialBuildingInfo } from "@/lib/data";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type TenantInfo = { name: string; phone: string; roomNumber: string; roomType: string };

export default function TenantShell({ children, tenant }: { children: ReactNode; tenant: TenantInfo }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { label: "Beranda", href: "/portal", icon: Home },
    { label: "Tagihan", href: "/portal/tagihan", icon: Receipt },
    { label: "Komplain", href: "/portal/komplain", icon: AlertCircle },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col md:flex-row antialiased">
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-50">
        <span className="font-semibold text-white text-sm">Kamar {tenant.roomNumber}</span>
        <div className="flex items-center gap-2">
          <ThemeToggle compact className="px-2.5" />
          <button type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label="Buka menu" className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/80 p-4 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-6">
          <Link href="/portal" className="flex items-center gap-2.5 px-2 pt-1">
            <span className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">K</span>
            <span><span className="block text-sm font-semibold text-white">Kostku</span><span className="block text-[11px] text-zinc-500">Portal Penghuni</span></span>
          </Link>
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 uppercase font-medium">Kamar Anda</span>
            <p className="text-sm font-semibold text-white mt-0.5">Kamar {tenant.roomNumber} ({tenant.roomType})</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{tenant.name}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname === href ? "bg-zinc-800/90 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}`}>
                <Icon className="w-4 h-4" /><span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="pt-4 border-t border-zinc-800/80 space-y-2">
          <ThemeToggle className="w-full" />
          <a href={`https://wa.me/${initialBuildingInfo.ownerPhone}`} target="_blank" rel="noreferrer" className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /><span>WhatsApp Pengelola</span>
          </a>
          <div className="px-3 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400 truncate">{tenant.name}</span>
            <button type="button" onClick={handleLogout} title="Keluar" className="p-1 text-zinc-500 hover:text-zinc-300"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto overflow-x-hidden max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
