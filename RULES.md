# RULES & METODOLOGI ARSITEKTUR CODED PROTOTYPE

## 1. Prinsip Utama Sistem (User-Centered Design, Admin & Buyer Modules)
* **Kategori Proyek:** High-Fidelity Coded Prototype (E-Commerce Galeri Ulos Sianipar Medan).
* **Fokus UCD & 6 Modul Pembeli (Buyer):**
  * **Modul 1 (Penjelajahan Produk):** Katalog interaktif, filter kategori, pencarian realtime, dan pemilih varian (Warna & Ukuran).
  * **Modul 2 (Keranjang Belanja):** Manajemen QTY, opsi varian terpilih, dan penghitungan otomatis harga.
  * **Modul 3 (Checkout & Transaksi):** Form alamat penerima, pilihan kurir, pengaplikasian kode voucher, dan metode transfer manual.
  * **Modul 4 (Konfirmasi Pembayaran):** Tampilan rekening toko dan unggah bukti transfer manual.
  * **Modul 5 (Pelacakan Pesanan):** Monitoring status pesanan (*Pending*, *Verified*, *Dikirim*, *Selesai*) dan lacak nomor resi.
  * **Modul 6 (Riwayat & Notifikasi Email):** Tab "Pesanan Saya", riwayat masa lalu, dan simulator Inbox Email (Invoice, Konfirmasi, Resi).
* **Fitur 6 Modul Admin:** Manajemen Produk/Varian, Verifikasi Bukti Bayar, Logistik & Resi/Cetak Label, Ringkasan Keuangan/Rekening, Email Log, dan Promosi/Voucher.

---

## 2. Struktur Folder & Peta Keterhubungan Berkas

```text
galeri-ulos-prototype/
├── RULES.md                  # Dokumen aturan & batasan prototype
├── TEST_PLAN.md              # Dokumen skenario uji Usability (UCD)
├── index.html                # Halaman Beranda, Katalog, Edukasi, Footer & Modal Auth
├── detail-ulos.html          # Halaman Detail Motif Ulos (Pilihan Varian & Stok)
├── keranjang.html            # Keranjang, Form Checkout, Tab Pesanan Saya, Email Inbox & Admin Dashboard
├── data/
│   └── ulos-data.json        # Initial Seed Data Ulos (termasuk Berat & Varian Detail)
└── assets/
    ├── css/
    │   └── style.css         # Styling custom, fonts, glassmorphism & printable label
    ├── js/
    │   └── app.js            # Engine Logika: Auth, 6 Modul Admin & 6 Modul Pembeli
    └── images/               # Direktori foto motif ulos