"use client";

import React, { useEffect, useState } from "react";
import { useKost } from "@/lib/kost-context";
import { UserPlus, Phone, Search, X, KeyRound, UserCog } from "lucide-react";

type TenantAccount = {
  tenantId: string | null;
  profileId?: string;
  name: string;
  phone: string;
  roomNumber: string;
  userId: string;
  email: string;
  isActive: boolean;
};

export default function AdminPenghuniPage() {
  const { tenants, rooms, addTenant } = useKost();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<TenantAccount[]>([]);
  const [accountTenant, setAccountTenant] = useState<(typeof tenants)[number] | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountActive, setAccountActive] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  useEffect(() => {
    fetch("/api/admin/tenant-users", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => { if (payload?.accounts) setAccounts(payload.accounts); })
      .catch(() => undefined);
  }, []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("628");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [roomId, setRoomId] = useState(rooms.find((r) => r.status === "AVAILABLE")?.id || rooms[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [depositAmount, setDepositAmount] = useState(1000000);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("628");
  const [checkinError, setCheckinError] = useState("");
  const [isSavingTenant, setIsSavingTenant] = useState(false);

  const filteredTenants = tenants.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.includes(searchQuery) ||
      t.phone.includes(searchQuery)
  );

  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");
  const accountByTenant = new Map(accounts.filter((account) => account.tenantId).map((account) => [account.tenantId!, account]));

  const openAccountDialog = (tenant: (typeof tenants)[number]) => {
    const account = accountByTenant.get(tenant.id);
    setAccountTenant(tenant);
    setAccountEmail(account?.email ?? "");
    setAccountPassword("");
    setAccountActive(account?.isActive ?? true);
    setAccountError("");
    setAccountSuccess("");
  };

  const openSavedAccount = (account: TenantAccount) => {
    if (!account.tenantId) return;
    openAccountDialog({
      id: account.tenantId,
      fullName: account.name,
      roomNumber: account.roomNumber,
      roomId: "",
      phone: account.phone,
      idCardNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      startDate: new Date().toISOString().split("T")[0],
      depositAmount: 0,
      depositStatus: "HELD",
      status: "ACTIVE",
    });
  };

  const closeAccountDialog = () => {
    setAccountTenant(null);
    setAccountPassword("");
  };

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accountTenant) return;
    const account = accountByTenant.get(accountTenant.id);
    const room = rooms.find((item) => item.id === accountTenant.roomId);
    if (!account && !room) {
      setAccountError("Data kamar tidak ditemukan. Periksa penempatan kamar penghuni.");
      return;
    }
    if (!account && accountPassword.length < 12) {
      setAccountError("Kata sandi awal minimal 12 karakter.");
      return;
    }

    setIsSavingAccount(true);
    setAccountError("");
    setAccountSuccess("");
    try {
      const response = await fetch("/api/admin/tenant-users", {
        method: account ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account ? {
          tenantId: accountTenant.id,
          email: accountEmail,
          password: accountPassword,
          isActive: accountActive,
        } : {
          tenant: accountTenant,
          room: room && {
            roomNumber: room.roomNumber,
            type: room.type,
            priceMonthly: room.priceMonthly,
            floor: room.floor,
            size: room.size,
            facilities: room.facilities,
            image: room.image,
          },
          email: accountEmail,
          password: accountPassword,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setAccountError(payload.error ?? "Akun belum dapat disimpan.");
        return;
      }
      if (payload.account) {
        setAccounts((current) => [...current.filter((item) => item.tenantId !== payload.account.tenantId), payload.account]);
      } else {
        setAccounts((current) => current.map((item) => item.tenantId === accountTenant.id ? { ...item, email: accountEmail.trim().toLowerCase(), isActive: accountActive } : item));
      }
      setAccountSuccess(account ? "Perubahan akun berhasil disimpan." : "Akun login penghuni berhasil dibuat.");
      setAccountPassword("");
    } catch {
      setAccountError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (!selectedRoom || !fullName) return;

    setCheckinError("");
    setIsSavingTenant(true);
    try {
      await addTenant({
        fullName,
        phone,
        idCardNumber,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        startDate,
        depositAmount: Number(depositAmount),
        depositStatus: "HELD",
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        status: "ACTIVE",
      });

      setIsCheckinModalOpen(false);
      setFullName("");
      setIdCardNumber("");
      setEmergencyName("");
    } catch (error) {
      setCheckinError(error instanceof Error ? error.message : "Data penghuni belum dapat disimpan.");
    } finally {
      setIsSavingTenant(false);
    }
  };

  const openWhatsApp = (phoneNum: string, name: string, roomNo: string) => {
    const text = encodeURIComponent(`Halo Kak ${name} (Kamar ${roomNo}), pengelola Kostku di sini.`);
    window.open(`https://wa.me/${phoneNum}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Data Penghuni & Deposit
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar anak kost aktif, tanggal masuk, uang jaminan, dan kontak darurat.
          </p>
        </div>

        <button
          onClick={() => setIsCheckinModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Check-in Baru</span>
        </button>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari penghuni atau kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="text-zinc-400 font-medium">
          Total: <span className="text-white">{tenants.length} penghuni</span> • Deposit: <span className="text-white font-medium">Rp {tenants.reduce((acc, t) => acc + t.depositAmount, 0).toLocaleString("id-ID")}</span>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800/80">
          <h2 className="text-sm font-semibold text-white">Akun portal penghuni</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">Kelola akun tersimpan, termasuk akun yang dibuat dari perangkat admin lain.</p>
        </div>
        {accounts.length ? (
          <div className="divide-y divide-zinc-800/60">
            {accounts.map((account) => (
              <div key={account.userId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200">{account.name} <span className="text-zinc-500">· Kamar {account.roomNumber}</span></p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{account.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] ${account.isActive ? "text-emerald-400" : "text-rose-400"}`}>{account.isActive ? "Aktif" : "Dinonaktifkan"}</span>
                  <button type="button" onClick={() => openSavedAccount(account)} className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs">Kelola</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-4 text-xs text-zinc-500">Belum ada akun penghuni yang dibuat.</p>
        )}
      </section>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 bg-zinc-950/40">
                <th className="p-3.5 font-medium">Kamar & Nama</th>
                <th className="p-3.5 font-medium">Tgl Masuk</th>
                <th className="p-3.5 font-medium">Deposit</th>
                <th className="p-3.5 font-medium">NIK KTP</th>
                <th className="p-3.5 font-medium">Kontak Darurat</th>
                <th className="p-3.5 font-medium">Akun Portal</th>
                <th className="p-3.5 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">Kamar {t.roomNumber}</div>
                    <div className="text-zinc-400 text-[11px]">{t.fullName} • +{t.phone}</div>
                  </td>
                  <td className="p-3.5 text-zinc-300 font-medium">{t.startDate}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-white">Rp {t.depositAmount.toLocaleString("id-ID")}</div>
                    <span className="text-[10px] text-zinc-500">Tertahan</span>
                  </td>
                  <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{t.idCardNumber || "-"}</td>
                  <td className="p-3.5 text-zinc-400">
                    <div>{t.emergencyContactName || "-"}</div>
                    <div className="text-[10px] font-mono">{t.emergencyContactPhone || "-"}</div>
                  </td>
                  <td className="p-3.5">
                    {accountByTenant.has(t.id) ? (
                      <div className="space-y-1">
                        <div className="text-[11px] text-zinc-300">{accountByTenant.get(t.id)?.email}</div>
                        <span className={`text-[10px] ${accountByTenant.get(t.id)?.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                          {accountByTenant.get(t.id)?.isActive ? "Aktif" : "Dinonaktifkan"}
                        </span>
                      </div>
                    ) : <span className="text-[11px] text-zinc-500">Belum ada akun</span>}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {(accountByTenant.has(t.id) || t.status === "ACTIVE") ? (
                        <button
                          type="button"
                          onClick={() => openAccountDialog(t)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                        >
                          {accountByTenant.has(t.id) ? <UserCog className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
                          <span>{accountByTenant.has(t.id) ? "Kelola akun" : "Buat login"}</span>
                        </button>
                      ) : <span className="text-[10px] text-zinc-500">Penghuni tidak aktif</span>}
                      <button
                        type="button"
                        onClick={() => openWhatsApp(t.phone, t.fullName, t.roomNumber)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                        aria-label={`WhatsApp ${t.fullName}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>WA</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check-in */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-semibold text-white">Check-in Penghuni Baru</h3>
              <button onClick={() => setIsCheckinModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Kamar Tersedia</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                >
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.roomNumber} ({r.type}) • Rp {r.priceMonthly.toLocaleString("id-ID")}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Tgl Masuk</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Uang Deposit (Rp)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                {checkinError && <p role="alert" className="mr-auto self-center text-rose-300">{checkinError}</p>}
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingTenant}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black font-medium disabled:opacity-60"
                >
                  {isSavingTenant ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {accountTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">{accountByTenant.has(accountTenant.id) ? "Kelola akun portal" : "Buat akun portal"}</h3>
                <p className="text-[11px] text-zinc-400 mt-1">{accountTenant.fullName} · Kamar {accountTenant.roomNumber}</p>
              </div>
              <button type="button" onClick={closeAccountDialog} aria-label="Tutup" className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="tenant-account-email" className="block text-zinc-400 mb-1">Email login</label>
                <input id="tenant-account-email" type="email" autoComplete="username" maxLength={254} required value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white" />
              </div>
              <div>
                <label htmlFor="tenant-account-password" className="block text-zinc-400 mb-1">{accountByTenant.has(accountTenant.id) ? "Kata sandi baru (opsional)" : "Kata sandi awal"}</label>
                <input id="tenant-account-password" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required={!accountByTenant.has(accountTenant.id)} value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} placeholder={accountByTenant.has(accountTenant.id) ? "Kosongkan jika tidak diubah" : "Minimal 12 karakter"} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500" />
              </div>
              {accountByTenant.has(accountTenant.id) && (
                <label className="flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 p-3 text-zinc-300">
                  <input type="checkbox" checked={accountActive} onChange={(event) => setAccountActive(event.target.checked)} className="accent-emerald-500" />
                  Akun dapat login ke portal
                </label>
              )}
              {accountError && <p role="alert" className="text-rose-300">{accountError}</p>}
              {accountSuccess && <p role="status" className="text-emerald-300">{accountSuccess}</p>}
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={closeAccountDialog} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white">Tutup</button>
                <button type="submit" disabled={isSavingAccount} className="px-3.5 py-1.5 rounded-lg bg-white text-black font-medium disabled:opacity-60">
                  {isSavingAccount ? "Menyimpan…" : accountByTenant.has(accountTenant.id) ? "Simpan perubahan" : "Buat akun"}
                </button>
              </div>
              {accountByTenant.has(accountTenant.id) && <p className="text-[10px] leading-relaxed text-zinc-500">Menonaktifkan akun atau mengganti kata sandi akan mengeluarkan sesi penghuni yang sedang aktif.</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
