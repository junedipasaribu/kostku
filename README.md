# Kostku

Prototype website dan dashboard untuk manajemen rumah kost. Dibuat dengan Next.js, TypeScript, Tailwind CSS, dan PostgreSQL/Prisma.

> **Status:** admin dapat membuat dan mengelola akun login penghuni. Portal menampilkan profil kamar/sewa yang tersimpan di database; pengelolaan operasional lain masih berupa demo di browser dan tagihan, komplain, serta upload belum aktif untuk produksi.

## Fitur

- Website informasi dan katalog kamar
- Dashboard demo untuk kamar, penghuni, tagihan, pengeluaran, dan komplain
- Login pengelola dan penghuni dengan sesi server
- Pembuatan akun penghuni dari data penghuni di dashboard admin, termasuk ubah email/kata sandi dan aktif/nonaktif akun

## Menjalankan lokal

1. Salin `.env.example` menjadi `.env`, lalu sesuaikan konfigurasi database.
2. Jalankan PostgreSQL, misalnya dengan `docker compose up -d`.
3. Jalankan:

   ```bash
   npm install
   npx prisma generate
   npm run dev -- -p 3001
   ```

Buka [http://localhost:3001](http://localhost:3001). Panduan deployment dan provisioning akun tersedia di [`docs/production-setup.md`](docs/production-setup.md).
