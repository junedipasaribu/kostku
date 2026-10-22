# Persiapan Production Kostku

> Kostku belum siap menyimpan data penghuni atau transaksi nyata. Data operasional masih disimpan di browser; portal penyewa dan upload produksi dinonaktifkan. Autentikasi server yang tersedia saat ini hanya untuk pengelola.

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
- Bangun ulang portal penyewa dan alur upload menggunakan penyimpanan privat yang tahan lama.
- Tambahkan pembatasan percobaan login, pemulihan akun, backup yang diuji, pencatatan audit, dan pemantauan.
