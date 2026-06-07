# Turnitin Checker Client (Frontend)

Sisi client dari aplikasi **Turnitin Checker AI** yang dibangun menggunakan **Next.js (App Router)** dan terintegrasi secara real-time dengan **Firebase Firestore**.

---

## 🚀 Fitur Utama

- **Dashboard Pengguna**:
  - Mengajukan berkas naskah/dokumen untuk dicek plagiarisme Turnitin.
  - Memilih jenis layanan Turnitin (No-Repository, Repository, atau Premium Per Halaman).
  - Melakukan konfirmasi pembayaran untuk melakukan top-up kredit.
  - Riwayat pengajuan dan status realtime.
- **Dashboard Admin**:
  - Mengelola antrean pengajuan (mengubah status, mengunggah laporan hasil pengecekan Turnitin).
  - Memverifikasi struk pembayaran top-up kredit user (approve/reject).
  - Manajemen jenis pengecekan dan konfigurasi bank untuk transfer.
  - Analitik pendapatan dan total pengajuan bulanan yang diambil langsung dari Firestore.

---

## 🛠️ Tech Stack & Desain

- **Framework**: Next.js 15+ (React 19)
- **Styling**: Vanilla CSS Modules (tanpa dependensi eksternal `@apply` Tailwind, seluruh gaya diisolasi dalam berkas `*.module.css` local).
- **Database**: Firebase Firestore (Realtime listener via `onSnapshot`).
- **Charts**: Recharts untuk rendering statistik area & bar di dashboard admin.

---

## ⚙️ Cara Menjalankan Project

### 1. Prasyarat
Pastikan Anda memiliki Node.js versi 18 ke atas terinstall di komputer.

### 2. Pasang Dependensi
Masuk ke direktori `frontend` dan install npm package:
```bash
npm install
```

### 3. Konfigurasi Environment Variable (`.env.local`)
Buat berkas `.env.local` di root direktori frontend dan lengkapi variabel berikut:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyALsGHKi6753h7s9w-Db8G0_93bEP4yea4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=turnitin-f016a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=turnitin-f016a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=turnitin-f016a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1053768510291
NEXT_PUBLIC_FIREBASE_APP_ID=1:1053768510291:web:c44ad19c663df725eacfa6
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-NZ86BBBC1Y
NEXT_PUBLIC_STORAGE_SERVER=http://localhost:5001
```

### 4. Menjalankan Server Development
Jalankan server lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 🗄️ Manajemen Database (Firestore Scripts)

Kami menyediakan skrip standalone Node.js untuk administrasi database Firestore secara langsung:

### 1. Seeding Data Awal
Untuk memasukkan data mock awal (pengaturan web, akun admin, akun user demo, dan jenis cek):
```bash
node scripts/seed-firebase.mjs
```

### 2. Cek Isi Database
Untuk melihat seluruh daftar koleksi dan ID dokumen di Firestore:
```bash
node check_db.mjs
```

### 3. Migrasi & Perbaikan Struktur Database
Untuk menyelaraskan struktur ID dokumen di Firestore agar rapi sesuai dengan format user-facing (`SUB-...` dan `PAY-...` bukannya hash acak) serta merestore jenis cek yang hilang:
```bash
node repair_db.mjs
```

### 💡 Akun Login Demo (Hasil Seeding)
- **Super Admin**:
  - Email: `admin@turnitin.com`
  - Password: `admin123`
- **Regular User**:
  - Email: `user@turnitin.com`
  - Password: `user123`
