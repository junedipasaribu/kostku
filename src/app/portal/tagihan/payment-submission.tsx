"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSubmission({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [method, setMethod] = useState("Transfer Bank");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  if (status !== "UNPAID" && status !== "OVERDUE") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) { setError("Pilih gambar bukti pembayaran terlebih dahulu."); return; }
    setSending(true);
    setError("");
    try {
      const body = new FormData();
      body.set("proof", file);
      body.set("method", method);
      const response = await fetch(`/api/portal/invoices/${encodeURIComponent(invoiceId)}/payment`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Bukti pembayaran gagal dikirim.");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Bukti pembayaran gagal dikirim.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 border-t border-zinc-800 pt-4 text-xs">
      <p className="font-medium text-zinc-200">Sudah membayar? Kirim bukti untuk diverifikasi pengelola.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">Metode pembayaran
          <select value={method} onChange={(event) => setMethod(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100">
            <option>Transfer Bank</option><option>QRIS</option><option>Tunai</option>
          </select>
        </label>
        <label className="space-y-1">Bukti pembayaran (JPG/PNG/WEBP, maks. 5MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 file:mr-3 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-zinc-100" />
        </label>
      </div>
      {error && <p role="alert" className="text-rose-400">{error}</p>}
      <button disabled={sending || !file} className="rounded-lg bg-white px-4 py-2 font-semibold text-black disabled:opacity-50">{sending ? "Mengirim…" : "Kirim bukti pembayaran"}</button>
    </form>
  );
}
