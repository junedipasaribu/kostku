"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useKost } from "@/lib/kost-context";
import { ShieldCheck, User, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#0c0c0e] flex flex-col justify-center items-center px-4 py-12 text-zinc-100 antialiased">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
            K
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Kostku
          </span>
        </Link>
        <p className="text-xs text-zinc-400 mt-1">
          Sistem Operasional 1 Gedung Kosan
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
        {/* Role Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              setRole("ADMIN");
              setEmail("admin@kostku.com");
            }}
            className={`py-1.5 rounded-md font-medium transition-colors ${
              role === "ADMIN"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Pengelola (Admin)
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("TENANT");
              setEmail("budi@kostku.com");
            }}
            className={`py-1.5 rounded-md font-medium transition-colors ${
              role === "TENANT"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Penyewa (Tenant)
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          {role === "ADMIN" ? (
            <>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Email Pengelola</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Pilih Akun Kamar</label>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    Kamar {t.roomNumber} - {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Masuk ke {role === "ADMIN" ? "Dashboard" : "Portal"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 font-medium block mb-2">
            Akses Cepat Demo:
          </span>

          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin("ADMIN")}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-left flex items-center justify-between text-zinc-300 transition-colors"
            >
              <span>Login Pengelola (Owner)</span>
              <span className="text-zinc-500 text-[11px]">→</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("TENANT", "t101")}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-left flex items-center justify-between text-zinc-300 transition-colors"
            >
              <span>Login Penyewa: Kamar 101</span>
              <span className="text-zinc-500 text-[11px]">→</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
