# Persiapan Production Kostku

## Data aplikasi

Data kamar, sewa/penghuni, tagihan, pengeluaran, komplain, catatan perawatan, dan konfigurasi gedung disimpan di PostgreSQL. Aplikasi tidak lagi mengisi dashboard dengan data penghuni atau transaksi demo. Lengkapi profil kost melalui **Pengaturan Kost**, lalu masukkan kamar dan data sewa melalui dashboard admin.

Pada login admin pertama setelah versi ini dipasang, data penghuni lama yang masih tersimpan di `localStorage` dengan key `kostku_tenants` akan dikirim ke API admin dan dihapus dari browser hanya setelah server mengonfirmasi impor. Data kamar, tagihan, pengeluaran, dan komplain lama tidak diimpor otomatis; periksa dan salin data yang benar sebelum menghapus data browser lama. Tiap browser/perangkat menyimpan `localStorage` terpisah.

Portal penghuni hanya mengambil tagihan dan komplain milik akun yang sedang login. Data gedung dan kamar yang tersedia di halaman publik berasal dari konfigurasi dan database.

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

Deploy menyelaraskan skema Prisma tanpa opsi `--accept-data-loss`. Backup database sebelum perubahan skema. Compose produksi menggunakan named volume `kostku_postgres_data_prod` untuk database dan `kostku_room_uploads_prod` untuk foto kamar; jangan hapus volume saat memperbarui container. Pastikan backup mencakup keduanya.

## Pengamanan operasional

- Login membatasi 10 kegagalan per alamat IP dalam 15 menit. Penghitung saat ini berada di memori proses; gunakan pembatas terdistribusi jika menjalankan beberapa replika.
- Gunakan HTTPS, rahasia deployment yang kuat, dan batasi akses server/database. Jangan membagikan password admin melalui chat atau log.
- Uji pemulihan backup PostgreSQL dan volume foto, serta pantau kapasitas disk dan kesehatan container.
- Pembayaran di aplikasi saat ini dicatat admin sebagai status tagihan; aplikasi belum memproses pembayaran otomatis.
