# Logbook Barang Laboratorium

Aplikasi web sederhana untuk mengelola logbook barang laboratorium dengan fitur pencatatan barang masuk, keluar, peminjaman, dan perbaikan/rusak.

## 🚀 Fitur Utama

### 📊 Dashboard
- Statistik real-time jumlah barang
- Aktivitas terbaru dengan status penyelesaian
- Tracking peminjaman terlambat dan jatuh tempo
- Export data ke JSON

### 📥 Barang Masuk
- Pencatatan barang baru masuk ke laboratorium
- Kategori: Alat Lab, Bahan Kimia, Peralatan, Elektronik, Lainnya
- Kondisi: Baik, Cukup, Rusak
- CRUD operations lengkap

### 📤 Barang Keluar
- Pencatatan barang keluar dari laboratorium
- Tracking tujuan dan PIC (Person In Charge)
- CRUD operations lengkap

### 🔄 Peminjaman
- Sistem peminjaman barang laboratorium
- Status tracking: Dipinjam, Dikembalikan, Terlambat
- Auto-detect peminjaman terlambat berdasarkan tanggal jatuh tempo
- Warning untuk peminjaman yang akan jatuh tempo (≤3 hari)
- Tanggal jatuh tempo dan pengembalian
- Fitur pengembalian barang dengan satu klik
- Aktivitas pengembalian tercatat otomatis

### 🔧 Perbaikan/Rusak
- Laporan barang rusak atau perlu perbaikan
- Kondisi: Rusak Ringan, Rusak Berat, Perlu Kalibrasi, Perlu Maintenance
- Status tracking: Rusak, Perbaikan, Selesai
- Fitur menandai perbaikan selesai dengan timestamp
- Aktivitas penyelesaian perbaikan tercatat otomatis

## 🛠️ Teknologi

- **HTML5** - Struktur aplikasi dengan semantic markup
- **CSS3** - Styling modern dan responsive design
- **Vanilla JavaScript** - Logika aplikasi dan interaktivitas
- **LocalStorage** - Penyimpanan data lokal (JSON)
- **Font Awesome** - Icon library

## 📱 Responsive Design

Aplikasi dirancang mobile-first dan fully responsive:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎨 Design Features

- **Modern UI/UX** dengan color scheme yang konsisten
- **Dark/Light theme** support
- **Smooth animations** dan transitions
- **Mobile-friendly navigation** dengan hamburger menu
- **Card-based layout** untuk better readability
- **Status badges** dengan color coding
- **Notification system** untuk user feedback

## 📈 Smart Status Tracking

### Peminjaman
- **🔄 Dipinjam** - Status normal untuk barang yang sedang dipinjam
- **⏰ Jatuh Tempo Segera** - Warning otomatis untuk peminjaman ≤3 hari
- **⚠️ Terlambat** - Auto-detect berdasarkan tanggal jatuh tempo
- **✅ Dikembalikan** - Status setelah barang dikembalikan

### Perbaikan
- **❌ Perlu Perbaikan** - Status awal untuk barang rusak
- **🔧 Sedang Diperbaiki** - Status dalam proses perbaikan
- **✅ Selesai** - Status setelah perbaikan selesai

### Aktivitas Terbaru
- Menampilkan semua aktivitas dengan status real-time
- Aktivitas pengembalian dan penyelesaian perbaikan tercatat otomatis
- Timeline lengkap dengan timestamp dan status

## 📦 Instalasi & Penggunaan

### Cara 1: Langsung buka file
1. Download atau clone repository
2. Buka file `index.html` di browser modern

### Cara 2: Menggunakan HTTP Server
```bash
# Menggunakan Python
python -m http.server 8000

# Menggunakan Node.js
npx http-server -p 8000

# Menggunakan PHP
php -S localhost:8000
```

Kemudian buka `http://localhost:8000` di browser.

### Cara 3: Testing dengan Sample Data
1. Buka aplikasi di browser
2. Klik tombol "Import Data" di Dashboard
3. Pilih file `sample-data.json` yang disediakan
4. Aplikasi akan terisi dengan data contoh untuk testing

## 💾 Penyimpanan Data

Data disimpan secara lokal menggunakan **localStorage** browser dalam format JSON. Data akan tetap tersimpan meskipun browser ditutup.

### Struktur Data
```json
{
  "barangMasuk": [
    {
      "tanggal": "2024-01-15",
      "namaBarang": "Mikroskop Digital",
      "kategori": "Alat Lab",
      "jumlah": "2",
      "kondisi": "Baik",
      "keterangan": "Untuk praktikum biologi"
    }
  ],
  "barangKeluar": [...],
  "peminjaman": [...],
  "perbaikan": [...]
}
```

## 🔧 Fitur Tambahan

### Export & Import Data
- **Export Data**: Export semua data ke file JSON dengan metadata
- **Import Data**: Import data dari file JSON dengan validasi
- **Auto Backup**: Backup otomatis sebelum import data baru
- **Restore**: Kembalikan data dari backup terakhir
- Nama file: `lab-logbook-backup-YYYY-MM-DD.json`
- Validasi format dan konfirmasi sebelum import

### Notification System
- Notifikasi real-time untuk setiap aksi
- Auto-dismiss setelah 5 detik
- Color-coded berdasarkan jenis notifikasi

### Search & Filter
- Filter data berdasarkan kategori
- Search berdasarkan nama barang
- Sort berdasarkan tanggal

## 🌟 Keunggulan

1. **No Backend Required** - Aplikasi berjalan sepenuhnya di frontend
2. **Offline Capable** - Bekerja tanpa koneksi internet
3. **Fast & Lightweight** - Loading cepat dengan minimal dependencies
4. **User Friendly** - Interface intuitif dan mudah digunakan
5. **Mobile Optimized** - Perfect untuk penggunaan di smartphone/tablet
6. **Data Persistence** - Data tersimpan lokal dan tidak hilang

## 🔒 Keamanan & Backup Data

- **Local Storage**: Data tersimpan lokal di browser pengguna
- **No Server**: Tidak ada transmisi data ke server eksternal
- **Export/Import**: Backup dan restore data dengan mudah
- **Auto Backup**: Backup otomatis sebelum import data baru
- **Data Validation**: Validasi format data saat import
- **Restore Function**: Kembalikan data dari backup terakhir

## 🚀 Pengembangan Lanjutan

Fitur yang dapat ditambahkan:
- [x] Import data dari file JSON ✅
- [x] Auto backup system ✅
- [ ] Import data dari Excel/CSV
- [ ] Print/PDF report generation
- [ ] Barcode/QR code scanning
- [ ] Multi-user support dengan login
- [ ] Cloud sync dengan Firebase/Supabase
- [ ] Advanced filtering dan search
- [ ] Data visualization dengan charts
- [ ] Email notifications untuk reminder

## 📄 Lisensi

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

## 👨‍💻 Kontribusi

Kontribusi sangat diterima! Silakan buat issue atau pull request untuk perbaikan dan penambahan fitur.

---

**Dibuat dengan ❤️ untuk kemudahan pengelolaan laboratorium**
