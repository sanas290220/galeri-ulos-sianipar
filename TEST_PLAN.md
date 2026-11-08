# SKENARIO PENGUJIAN USABILITY TESTING (UCD EVALUATION)

## 1. Informasi Evaluasi
* **Objek Uji:** Prototype UI/UX & Fitur 6 Modul Pembeli & 6 Modul Admin Galeri Ulos Sianipar Medan.
* **Metode Uji:** Task-Based Usability Testing & System Usability Scale (SUS).

---

## 2. Matriks Skenario Pengujian Modul Pembeli

| ID Tugas | Peran | Deskripsi Tugas Pembeli | Jalur Interaksi UI (UI Path) | Kriteria Keberhasilan |
| :--- | :--- | :--- | :--- | :--- |
| **TASK-01** | Pembeli | Menjelajahi katalog, memilih varian ulos, & membaca makna filosofis. | Klik item di `index.html` $\rightarrow$ Masuk ke `detail-ulos.html` $\rightarrow$ Pilih varian Warna & Ukuran. | Varian warna/ukuran terpilih dengan stok yang sesuai dan makna filosofis tampil lengkap. |
| **TASK-02** | Pembeli | Menambahkan ke keranjang dan mengubah kuantiti pesanan. | Klik "Tambah Keranjang" $\rightarrow$ Buka `keranjang.html` $\rightarrow$ Ubah QTY (+/-). | Subtotal produk terhitung secara realtime sesuai kuantiti dan varian. |
| **TASK-03** | Pembeli | Melakukan Checkout, memilih kurir, voucher, & transfer bank. | Isi alamat pengiriman $\rightarrow$ Pilih Kurir (JNE/POS) $\rightarrow$ Input Voucher `ULOSHERITAGE` $\rightarrow$ Pilih Bank Tujuan. | Diskon voucher terpotong dan total bayar terhitung transparan. |
| **TASK-04** | Pembeli | Mengunggah bukti transfer pembayaran manual. | Unggah URL foto bukti bayar pada form checkout atau di tab "Pesanan Saya". | Pesanan tercatat dengan status "Menunggu Verifikasi Pembayaran". |
| **TASK-05** | Pembeli | Melacak status pesanan dan nomor resi pengiriman. | Masuk ke `keranjang.html` $\rightarrow$ Buka tab "Pesanan Saya & Lacak Resi". | Status pesanan dan nomor resi pengiriman dari Admin tampil jelas. |
| **TASK-06** | Pembeli | Memeriksa riwayat transaksi dan membaca notifikasi email. | Buka tab "Kotak Masuk Email Pembeli" di `keranjang.html`. | Surat elektronik berupa Invoice, Konfirmasi Bayar, dan Resi tampil di inbox simulasi. |