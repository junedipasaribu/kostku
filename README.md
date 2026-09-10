# 🏠 Kostku - Website & Sistem Manajemen Kost Eksklusif

Website dan sistem operasional kost modern berbasis Next.js App Router, Tailwind CSS, TypeScript, PostgreSQL (Prisma ORM), dan 3D Coverflow Showcase.

🌐 **Domain Produksi**: `https://kostku.juns-digital.my.id`

---

## 🛠️ Tech Stack

* **Frontend & Backend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling & UI**: Tailwind CSS v4, Lucide Icons, 3D Coverflow Carousel, shadcn structure
* **Database**: PostgreSQL 15 (Prisma ORM v6)
* **Containerization**: Docker Multi-stage, Docker Compose
* **CI/CD**: GitHub Actions & GitHub Container Registry (`ghcr.io`)
* **Jaringan & Server**: Tailscale VPN, SSH Automation, Reverse Proxy (Nginx/Apache)

---

## ✨ Fitur Utama Sistem

### 🔴 Operasional Admin & Manajemen
1. **Dashboard Metrik & Alert Real-Time**: 
   - Banner merah otomatis untuk tagihan jatuh tempo (≤ 3 hari / lewat jatuh tempo) dengan tombol kirim WhatsApp tagihan instan.
   - Alert peringatan masa sewa penghuni yang segera berakhir.
2. **Katalog & Manajemen Kamar**:
   - Status kamar dinamis (*AVAILABLE*, *OCCUPIED*, *MAINTENANCE*).
   - Riwayat Log Maintenance per kamar (catat tanggal perbaikan, estimasi/biaya, teknisi penanggung jawab, dan deskripsi).
3. **Pencatatan Keuangan & Pengeluaran**:
   - Chart horizontal distribusi pengeluaran per kategori (Listrik, Air, Internet, Kebersihan, Perbaikan, Operasional) lengkap dengan nominal dan persentase otomatis.
   - Rekap saldo kas, total pemasukan sewa, dan pengeluaran operasional.
4. **Manajemen Penghuni & Tagihan**:
   - Filter cepat status pembayaran (Lunas, Belum Lunas, Menunggu Verifikasi).
   - Verifikasi bukti transfer yang diunggah penghuni.

### 🟢 Portal Penghuni (Self-Service)
1. **Upload Bukti Transfer File**:
   - Area drag-and-drop unggah foto bukti bayar (gambar max 5MB) dengan preview instan dan konversi base64 otomatis.
2. **Informasi Masa Sewa Visual**:
   - Progress bar masa sewa kamar dengan indikator sisa hari aktif.
3. **Status Deposit & Kontak Darurat**:
   - Badge status uang deposit (Tersimpan aman / Telah dikembalikan).
   - Kontak darurat pengelola kost dengan tombol panggilan/WhatsApp langsung.


---

## 🚀 Persiapan GitHub Secrets untuk CI/CD

Tambahkan Secret berikut pada repository GitHub (`Settings > Secrets and variables > Actions`):

| Nama Secret | Deskripsi |
| :--- | :--- |
| `TAILSCALE_AUTHKEY` | Auth Key Tailscale untuk menghubungkan GitHub Runner ke VPS |
| `SSH_HOST` | IP Address VPS (atau IP Tailscale VPS) |
| `SSH_USER` | Username SSH VPS (misal: `root` atau `ubuntu`) |
| `SSH_KEY` | Private SSH Key untuk otentikasi login ke server |
| `SSH_PORT` | Port SSH server (default: `22`) |
| `DB_PASSWORD` | Password untuk PostgreSQL produksi |
| `NEXTAUTH_SECRET` | Kunci enkripsi sesi (acak & aman) |

---

## 🌐 Konfigurasi Domain di Server (`kostku.juns-digital.my.id`)

Aplikasi Kostku berjalan di port host **`3002`** (sehingga tidak bentrok dengan `Web-L` di port `3000` dan aplikasi lain di port `3001`).

### Pilihan 1: Jika Server Menggunakan Nginx
1. Salin konfigurasi dari `nginx/kostku.conf` ke `/etc/nginx/sites-available/kostku.conf`:
   ```bash
   sudo cp nginx/kostku.conf /etc/nginx/sites-available/kostku.conf
   sudo ln -s /etc/nginx/sites-available/kostku.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
2. Pasang SSL Gratis dengan Certbot:
   ```bash
   sudo certbot --nginx -d kostku.juns-digital.my.id
   ```

### Pilihan 2: Jika Server Menggunakan Apache
1. Aktifkan modul proxy:
   ```bash
   sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite
   ```
2. Salin konfigurasi dari `apache/kostku.conf`:
   ```bash
   sudo cp apache/kostku.conf /etc/apache2/sites-available/kostku.conf
   sudo a2ensite kostku.conf
   sudo systemctl reload apache2
   ```
3. Pasang SSL Gratis dengan Certbot:
   ```bash
   sudo certbot --apache -d kostku.juns-digital.my.id
   ```

---

## 💻 Menjalankan Secara Lokal (Development)

1. Jalankan PostgreSQL lokal (opsional lewat Docker):
   ```bash
   docker compose up -d
   ```
2. Pasang dependensi dan jalankan server dev:
   ```bash
   npm install
   npx prisma generate
   npm run dev -- -p 3001
   ```
3. Buka di browser:
   * Landing Page: `http://localhost:3001`
   * Demo Carousel: `http://localhost:3001/demo`
