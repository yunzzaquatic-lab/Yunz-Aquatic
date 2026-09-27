# Aplikasi Usaha Ikan

Aplikasi PWA offline untuk pencatatan usaha ikan.

## Fitur
- Dashboard omzet, laba bersih, nilai stok, stok pakan, hutang/piutang.
- Database stok ikan per ekor/jenis/varian dan modal rata-rata per ekor.
- Pembelian ikan otomatis menambah stok dan menghitung modal rata-rata.
- Penjualan otomatis mengurangi stok dan menghitung HPP/COGS serta laba kotor.
- Nota penjualan siap cetak.
- Stok pakan.
- Hutang-piutang dan pembayaran.
- Biaya operasional.
- Laporan bulanan.
- Backup/restore data JSON.
- Bisa dipasang sebagai aplikasi (PWA) dari browser.

## Cara menjalankan
PWA perlu dibuka melalui HTTPS atau localhost. Cara paling mudah untuk uji:
1. Ekstrak folder.
2. Jalankan server lokal, misalnya `python -m http.server 8000`.
3. Buka `http://localhost:8000` pada browser.
4. Untuk instal di HP, upload folder ke hosting HTTPS, lalu buka dari Chrome Android dan pilih "Tambahkan ke layar utama"/"Install app".

## Catatan
Versi ini menyimpan data secara lokal pada perangkat/browser. Untuk versi produksi multi-device diperlukan backend/database online, login pengguna, sinkronisasi, dan hak akses.
