"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import { 
  ShieldCheck, 
  User, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Home, 
  Building2,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, tenants } = useKost();
  const [role, setRole] = useState<"ADMIN" | "TENANT">("ADMIN");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("t101");
  const [email, setEmail] = useState("admin@kostku.com");
  const [password, setPassword] = useState("admin123");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "ADMIN") {
      loginAs("ADMIN");
      router.push("/admin");
    } else {
      loginAs("TENANT", selectedTenantId);
      router.push("/portal");
    }
  };

  const handleQuickLogin = (targetRole: "ADMIN" | "TENANT", tenantId?: string) => {
    if (targetRole === "ADMIN") {
      loginAs("ADMIN");
      router.push("/admin");
    } else {
      loginAs("TENANT", tenantId || "t101");
      router.push("/portal");
    }
  };

  return (
    <div className="min-h-screen bg-[#090807] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#c5a880] selection:text-black">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#8a6839] flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-[#c5a880]/20 group-hover:scale-105 transition-transform">
            K
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-wider">
              KOST<span className="text-[#c5a880]">KU</span>
            </span>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">
              Sistem Operasional 1 Gedung Kosan
            </p>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/5 mb-8">
          <button
            type="button"
            onClick={() => {
              setRole("ADMIN");
              setEmail("admin@kostku.com");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "ADMIN"
                ? "bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin / Pengelola</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("TENANT");
              setEmail("budi@kostku.com");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "TENANT"
                ? "bg-[#c5a880] text-black shadow-md shadow-[#c5a880]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Penyewa (Tenant)</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {role === "ADMIN" ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Email Pengelola
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#c5a880] transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Pilih Akun Kamar Penyewa
              </label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/15 text-white text-sm focus:outline-none focus:border-[#c5a880] transition-colors"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    Kamar {t.roomNumber} - {t.fullName}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500 mt-2">
                Penyewa dapat mengecek tagihan, bayar & upload bukti transfer, serta membuat tiket komplain.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#a48256] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 shadow-lg shadow-[#c5a880]/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Masuk ke {role === "ADMIN" ? "Dashboard Admin" : "Portal Penghuni"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Akses Cepat Demo (1-Klik)
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("ADMIN")}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                <div>
                  <p className="text-xs font-bold text-white">Login sebagai Owner / Admin</p>
                  <p className="text-[10px] text-zinc-500">Kelola status kamar, deposit, & keuangan gedung</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#c5a880] group-hover:translate-x-0.5 transition-transform">
                Masuk →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("TENANT", "t101")}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">Login Penyewa: Budi (Kamar 101)</p>
                  <p className="text-[10px] text-zinc-500">Lihat tagihan pending, upload bukti, lapor AC</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                Masuk →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("TENANT", "t102")}
              className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-sky-400" />
                <div>
                  <p className="text-xs font-bold text-white">Login Penyewa: Siti (Kamar 102)</p>
                  <p className="text-[10px] text-zinc-500">Status bukti transfer menunggu verifikasi admin</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                Masuk →
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-[#c5a880] transition-colors inline-flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Depan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
