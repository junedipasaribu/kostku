# Kostku

Prototype website dan dashboard untuk manajemen rumah kost. Dibuat dengan Next.js, TypeScript, Tailwind CSS, dan PostgreSQL/Prisma.

> **Status:** belum siap untuk data penghuni atau transaksi nyata. Data operasional masih berupa data demo di browser. Portal penyewa dan upload produksi dinonaktifkan.

## Fitur

- Website informasi dan katalog kamar
- Dashboard demo untuk kamar, penghuni, tagihan, pengeluaran, dan komplain
- Login pengelola dengan sesi server

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
