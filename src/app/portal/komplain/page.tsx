"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useKost } from "@/lib/kost-context";
import type { ComplaintData } from "@/lib/data";

export default function TenantComplaintPage() {
  const { addComplaint } = useKost();
  const [complaints, setComplaints] = useState<Pick<ComplaintData, "id" | "title" | "description" | "status" | "date">[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/operations", { cache: "no-store" });
    if (!response.ok) throw new Error("Riwayat laporan belum dapat dimuat.");
    const payload = await response.json();
    setComplaints(Array.isArray(payload.complaints) ? payload.complaints : []);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Terjadi kesalahan.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [refresh]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await addComplaint({ title, description });
      setTitle("");
      setDescription("");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Laporan belum dapat dikirim.");
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = (status: ComplaintData["status"]) => status === "OPEN" ? "Baru" : status === "IN_PROGRESS" ? "Sedang ditangani" : "Selesai";

  return (
    <section className="max-w-2xl space-y-6">
      <header className="border-b border-zinc-800/80 pb-5">
        <h1 className="text-xl font-semibold text-white">Lapor fasilitas</h1>
        <p className="mt-1 text-xs text-zinc-400">Laporan hanya dapat dilihat Anda dan pengelola.</p>
      </header>
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
        <label className="block space-y-1 text-xs text-zinc-300">Judul laporan<input required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white" /></label>
        <label className="block space-y-1 text-xs text-zinc-300">Keterangan<textarea required maxLength={2000} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-white" /></label>
        {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
        <button disabled={saving} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-50">{saving ? "Mengirim…" : "Kirim laporan"}</button>
      </form>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Riwayat laporan</h2>
        {loading ? <p className="text-xs text-zinc-500">Memuat…</p> : complaints.length ? complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
            <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium text-white">{complaint.title}</h3><span className="shrink-0 text-[10px] text-amber-300">{statusLabel(complaint.status)}</span></div>
            <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-400">{complaint.description}</p>
            <p className="mt-3 text-[10px] text-zinc-500">{complaint.date}</p>
          </article>
        )) : <p className="text-xs text-zinc-500">Belum ada laporan.</p>}
      </div>
    </section>
  );
}
