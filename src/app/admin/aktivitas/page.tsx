"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";

type ActivityLog = {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
};

type ActivityResponse = { logs: ActivityLog[]; total: number; page: number; pageSize: number };

const actionLabels: Record<string, string> = {
  "auth.login": "Masuk",
  "auth.logout": "Keluar",
  "room.created": "Kamar ditambahkan",
  "room.updated": "Kamar diperbarui",
  "room.status_changed": "Status kamar berubah",
  "room.deleted": "Kamar dihapus",
  "maintenance.created": "Perbaikan dicatat",
  "tenant.saved": "Data penghuni disimpan",
  "tenant.account_created": "Akun penghuni dibuat",
  "tenant.account_updated": "Akun penghuni diperbarui",
  "invoice.created": "Tagihan dibuat",
  "invoice.payment_submitted": "Bukti pembayaran dikirim",
  "invoice.payment_verified": "Pembayaran diverifikasi",
  "invoice.payment_rejected": "Pembayaran ditolak",
  "expense.created": "Pengeluaran dicatat",
  "complaint.created": "Komplain dikirim",
  "complaint.status_changed": "Status komplain berubah",
  "building.updated": "Pengaturan kost diperbarui",
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    try {
      const response = await fetch(`/api/admin/activity-logs?${params}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Log aktivitas belum dapat dimuat.");
      const data = payload as ActivityResponse;
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotal(data.total ?? 0);
      setPageCount(Math.max(1, Math.ceil((data.total ?? 0) / (data.pageSize ?? 50))));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Log aktivitas belum dapat dimuat.");
    } finally {
      setIsLoading(false);
    }
  }, [page, query, refreshKey]);

  useEffect(() => { void loadLogs(); }, [loadLogs]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchText.trim());
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Log Aktivitas</h1>
          <p className="mt-1 text-xs text-zinc-400">Riwayat login dan perubahan data di aplikasi.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{total.toLocaleString("id-ID")} aktivitas</span>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            aria-label="Muat ulang log aktivitas"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <form onSubmit={submitSearch} className="flex gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Cari aktivitas atau nama pengguna..."
            className="h-10 w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-500"
          />
        </label>
        <button type="submit" className="rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200">Cari</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20">
        {isLoading ? (
          <p className="p-8 text-center text-xs text-zinc-400">Memuat log aktivitas…</p>
        ) : error ? (
          <div className="space-y-3 p-8 text-center">
            <p role="alert" className="text-xs text-rose-400">{error}</p>
            <button onClick={() => setRefreshKey((value) => value + 1)} className="text-xs text-zinc-200 underline">Coba lagi</button>
          </div>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-xs text-zinc-400">Belum ada aktivitas yang cocok.</p>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {logs.map((log) => (
              <article key={log.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-white">{actionLabels[log.action] ?? log.action}</span>
                    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">{log.actorRole}</span>
                  </div>
                  <p className="text-xs text-zinc-300">{log.summary}</p>
                  <p className="text-[11px] text-zinc-500">{log.actorName} · {log.entityType.replaceAll("_", " ")}</p>
                </div>
                <time className="shrink-0 text-[11px] text-zinc-500" dateTime={log.createdAt}>
                  {new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Halaman {page} dari {pageCount}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || isLoading} className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 disabled:opacity-40">
            <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
          </button>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page >= pageCount || isLoading} className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 disabled:opacity-40">
            Berikutnya <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
