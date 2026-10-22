"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Email atau kata sandi salah.");
        return;
      }
      router.replace(payload.user.role === "TENANT" ? "/portal" : "/admin");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] flex flex-col justify-center items-center px-4 py-12 text-zinc-100 antialiased">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">K</div>
          <span className="text-lg font-semibold tracking-tight text-white">Kostku</span>
        </Link>
        <p className="text-xs text-zinc-400 mt-1">Sistem Operasional 1 Gedung Kosan</p>
      </div>

      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
        <div className="mb-5 rounded-lg border border-amber-800/70 bg-amber-950/40 px-3 py-2.5 text-[11px] leading-relaxed text-amber-200">
          Autentikasi pengelola diverifikasi oleh server. Portal penyewa dinonaktifkan sampai data dan hak aksesnya dipindahkan ke server. Data operasional belum siap untuk data nyata.
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="email" className="block text-zinc-400 mb-1 font-medium">Email akun</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-zinc-400 mb-1 font-medium">Kata sandi</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={1024}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-600"
            />
          </div>
          {error && <p role="alert" className="text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2 rounded-lg bg-white text-black font-medium text-xs hover:bg-zinc-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? "Memeriksa…" : "Masuk"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
