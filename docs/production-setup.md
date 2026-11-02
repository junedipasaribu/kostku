# Persiapan Production Kostku

> Admin dapat membuat dan mengelola akun login penghuni. Profil penghuni, termasuk data identitas dan kontak darurat, disimpan di PostgreSQL dan hanya dimuat melalui API admin. Data operasional lain masih disimpan di browser; fitur tagihan, komplain, dan upload belum siap untuk transaksi nyata.

## Akun penghuni

Di dashboard admin, buka **Data Penghuni & Deposit**, lalu pilih **Buat login** pada penghuni. Masukkan email dan kata sandi awal minimal 12 karakter. Dari menu **Kelola akun**, admin dapat mengganti email atau kata sandi serta menonaktifkan atau mengaktifkan akses portal. Menonaktifkan akun atau mengganti kata sandi mengakhiri sesi aktif penghuni.

Check-in baru dan akun login menyimpan profil penghuni serta tautan kamar di PostgreSQL. Saat admin membuka dashboard, data check-in lama di browser akan diimpor ke database; salinan `kostku_tenants` dihapus dari browser setelah server mengonfirmasi impor. Proses ini memerlukan database dan skema yang aktif. Data operasional selain profil penghuni masih berupa data demo browser dan tidak otomatis tersinkron antar perangkat.

Login membatasi 10 kegagalan per alamat IP dalam 15 menit. Penghitung ini berada di memori proses; gunakan pembatas terdistribusi sebelum menjalankan beberapa replika aplikasi.

## Akun pengelola

Jalankan provisioning di lingkungan tepercaya yang memiliki `DATABASE_URL` menuju database Kostku. Masukkan kata sandi secara interaktif dan hapus variabel sementara setelahnya:

```powershell
$env:KOSTKU_USER_EMAIL = "admin@example.com"
$env:KOSTKU_USER_NAME = "Nama Pengelola"
$env:KOSTKU_USER_ROLE = "OWNER"
$env:KOSTKU_USER_PASSWORD = Read-Host "Kata sandi baru" -AsSecureString | ConvertFrom-SecureString -AsPlainText
npm run create-user
Remove-Item Env:KOSTKU_USER_EMAIL, Env:KOSTKU_USER_NAME, Env:KOSTKU_USER_ROLE, Env:KOSTKU_USER_PASSWORD
```

Kata sandi minimal 12 karakter. Jangan commit `.env` atau masukkan secret ke riwayat perintah.

## Deployment

Workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) membutuhkan GitHub Secrets: `TAILSCALE_AUTHKEY`, `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_PORT`, dan `DB_PASSWORD`. Gunakan konfigurasi reverse proxy di [`nginx/kostku.conf`](../nginx/kostku.conf) atau [`apache/kostku.conf`](../apache/kostku.conf), lalu aktifkan HTTPS.

Deploy menyelaraskan skema Prisma tanpa opsi `--accept-data-loss`. Tetap buat backup database sebelum perubahan skema.

## Sebelum menerima data nyata

- Pindahkan data operasional dari `localStorage` ke database melalui API yang memeriksa identitas dan izin pada setiap permintaan.
- Hubungkan tagihan, komplain, dan alur upload ke database serta penyimpanan privat yang tahan lama.
- Tambahkan pembatasan percobaan login terdistribusi jika aplikasi dijalankan dengan beberapa replika, pemulihan akun, backup yang diuji, pencatatan audit, dan pemantauan.
