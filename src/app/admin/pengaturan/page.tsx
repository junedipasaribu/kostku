"use client";

import { useState, type FormEvent } from "react";
import { useKost } from "@/lib/kost-context";
import type { BuildingInfo } from "@/lib/data";

export default function AdminPengaturanPage() {
  const { building, updateBuilding, isLoading } = useKost();
  const [draft, setDraft] = useState<BuildingInfo | null>(null);
  const form = draft ?? building;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key: keyof BuildingInfo, value: string) => setDraft((current) => ({ ...(current ?? building), [key]: value }));
  const updateLines = (key: "rules" | "sharedFacilities", value: string) => setDraft((current) => ({ ...(current ?? building), [key]: value.split("\n").map((line) => line.trim()).filter(Boolean) }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateBuilding(form);
      setDraft(form);
      setMessage("Pengaturan kost tersimpan.");
    } catch {
      setMessage("Pengaturan belum tersimpan. Periksa koneksi dan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-2xl space-y-6">
      <header className="border-b border-zinc-800/80 pb-5">
        <h1 className="text-xl font-semibold text-white">Pengaturan Kost</h1>
        <p className="mt-1 text-xs text-zinc-400">Informasi kost, kontak pengelola, dan tujuan pembayaran yang ditampilkan di aplikasi.</p>
      </header>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5">
        {([
          ["name", "Nama kost", true], ["tagline", "Slogan", false], ["address", "Alamat", false],
          ["ownerName", "Nama pengelola", true], ["ownerPhone", "WhatsApp pengelola", false],
          ["bankName", "Nama bank", false], ["bankAccount", "Nomor rekening", false], ["bankHolder", "Nama pemilik rekening", false], ["qrisUrl", "URL QRIS", false],
        ] as const).map(([key, label, required]) => (
          <label key={key} className="block space-y-1.5 text-xs text-zinc-300">
            <span>{label}</span>
            <input value={form[key]} onChange={(event) => update(key, event.target.value)} required={required} maxLength={key === "address" ? 300 : 120} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
          </label>
        ))}
        <label className="block space-y-1.5 text-xs text-zinc-300">Fasilitas bersama <span className="text-zinc-500">(satu per baris)</span>
          <textarea rows={4} value={form.sharedFacilities.join("\n")} onChange={(event) => updateLines("sharedFacilities", event.target.value)} maxLength={4000} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
        </label>
        <label className="block space-y-1.5 text-xs text-zinc-300">Peraturan kost <span className="text-zinc-500">(satu per baris)</span>
          <textarea rows={4} value={form.rules.join("\n")} onChange={(event) => updateLines("rules", event.target.value)} maxLength={9000} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white" />
        </label>
        <div className="flex items-center justify-between pt-2">
          <p role="status" className="text-xs text-zinc-400">{isLoading ? "Memuat pengaturan…" : message}</p>
          <button disabled={saving || isLoading} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan"}</button>
        </div>
      </form>
    </section>
  );
}
