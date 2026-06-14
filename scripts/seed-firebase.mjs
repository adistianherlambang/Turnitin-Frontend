/**
 * seed-firebase.mjs
 *
 * Script untuk memasukkan data seed ke Firebase Firestore.
 * Membaca konfigurasi dari .env.local — JANGAN hardcode secrets di sini.
 *
 * Jalankan: node scripts/seed-firebase.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import crypto from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ─── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

const envVars = {};
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    envVars[key] = value;
  }
  console.log("✓ .env.local berhasil dimuat");
} catch {
  console.error("❌ File .env.local tidak ditemukan. Pastikan file ada di root frontend/");
  process.exit(1);
}

// ─── Firebase Config (dari .env.local) ────────────────────────────────────────
const firebaseConfig = {
  apiKey: envVars["NEXT_PUBLIC_FIREBASE_API_KEY"],
  authDomain: envVars["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  projectId: envVars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"],
  storageBucket: envVars["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: envVars["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  appId: envVars["NEXT_PUBLIC_FIREBASE_APP_ID"],
  measurementId: envVars["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"]
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Firebase config tidak lengkap. Periksa .env.local Anda.");
  process.exit(1);
}

// ─── Password Hashing (sama persis dengan authService.js) ──────────────────────
const SALT = "turnitin-checker-2026";

async function hashPassword(password) {
  const data = Buffer.from(password + SALT, "utf-8");
  const hashBuffer = crypto.createHash("sha256").update(data).digest();
  const hashArray = Array.from(hashBuffer);
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Generate password hashes ──────────────────────────────────────────────────
const ADMIN_PASSWORD = "admin123";
const USER_PASSWORD = "user123";

const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);
const userPasswordHash = await hashPassword(USER_PASSWORD);

console.log("✓ Password hashes generated:");
console.log(`  Admin  (${ADMIN_PASSWORD}): ${adminPasswordHash.substring(0, 20)}...`);
console.log(`  User   (${USER_PASSWORD}): ${userPasswordHash.substring(0, 20)}...`);

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const now = new Date();
const daysAgo = (n) => new Date(now - n * 24 * 3600 * 1000).toISOString();
const STORAGE = envVars["NEXT_PUBLIC_STORAGE_SERVER"] || "http://localhost:5001";

console.log(`✓ Storage server: ${STORAGE}`);

const SEED_DATA = {
  // ── Settings ──────────────────────────────────────────────────────────────────
  settings: {
    general: {
      bankName: "Bank Central Asia (BCA)",
      bankAccountNumber: "8029381029",
      bankAccountHolder: "PT Turnitin Indonesia Group",
      contactWhatsapp: "6281776743211",
      contactEmail: "support@turnitinchecker.com",
      creditPrice: 5000,
      websiteName: "Turnitin Checker AI",
      websiteLogo: "",
      footer: "© 2026 Turnitin Checker AI. All rights reserved.",
      seoTitle: "Turnitin Checker AI - Jasa Cek Plagiasi Turnitin Cepat & Murah",
      seoDescription:
        "Jasa cek plagiasi Turnitin no-repository murah, cepat dan aman. Terpercaya untuk skripsi, tesis, dan jurnal."
    }
  },

  // ── Check Types ───────────────────────────────────────────────────────────────
  checkTypes: {
    "turnitin-no-repo": {
      id: "turnitin-no-repo",
      name: "Turnitin No-Repository (Safe Draft)",
      slug: "turnitin-no-repo",
      description:
        "Hasil cek tidak masuk database Turnitin, aman dicek berkali-kali untuk revisi draf skripsi/tesis.",
      creditCost: 2,
      unitType: "fixed",
      unitValue: 1,
      isActive: true,
      sortOrder: 1,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30)
    },
    "turnitin-repo": {
      id: "turnitin-repo",
      name: "Turnitin Repository (Final Check)",
      slug: "turnitin-repo",
      description:
        "Pengecekan final dengan mencocokkan dokumen ke database institusi nasional & internasional.",
      creditCost: 3,
      unitType: "fixed",
      unitValue: 1,
      isActive: true,
      sortOrder: 2,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(25)
    },
    "turnitin-per-page": {
      id: "turnitin-per-page",
      name: "Turnitin Premium (Per 250 Kata)",
      slug: "turnitin-per-page",
      description:
        "Pengecekan fleksibel untuk artikel pendek, abstrak, atau per bab. Lebih hemat biaya.",
      creditCost: 1,
      unitType: "per_word",
      unitValue: 250,
      isActive: true,
      sortOrder: 3,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(20)
    }
  },

  // ── Notifications ─────────────────────────────────────────────────────────────
  notifications: {
    "notif-1": {
      id: "notif-1",
      title: "Promo Awal Bulan: Bonus 5 Kredit Top-Up!",
      message:
        "Setiap pembelian minimal 20 kredit akan mendapatkan bonus tambahan 5 kredit secara otomatis. Berlaku hingga akhir minggu ini.",
      createdAt: daysAgo(2),
      createdBy: "admin-system"
    },
    "notif-2": {
      id: "notif-2",
      title: "Server Pemeliharaan Selesai",
      message:
        "Pemeliharaan rutin server pengecekan Turnitin telah selesai. Semua proses pengecekan kini berjalan lebih cepat.",
      createdAt: daysAgo(5),
      createdBy: "admin-system"
    }
  },

  // ── Users ─────────────────────────────────────────────────────────────────────
  users: {
    "admin-user-id": {
      id: "admin-user-id",
      name: "Super Admin",
      email: "admin@turnitin.com",
      passwordHash: adminPasswordHash,
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
      role: "admin",
      credits: 9999,
      status: "active",
      createdAt: daysAgo(100)
    },
    "regular-user-id": {
      id: "regular-user-id",
      name: "John Doe",
      email: "user@turnitin.com",
      passwordHash: userPasswordHash,
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      role: "user",
      credits: 15,
      status: "active",
      createdAt: daysAgo(15)
    }
  },

  // ── Payments ──────────────────────────────────────────────────────────────────
  payments: {
    "pay-1": {
      id: "pay-1",
      paymentId: "PAY-10029",
      userId: "regular-user-id",
      amount: 100000,
      credits: 20,
      proofFile: "",
      status: "approved",
      createdAt: daysAgo(10),
      verifiedAt: daysAgo(10),
      verifiedBy: "admin-user-id"
    },
    "pay-2": {
      id: "pay-2",
      paymentId: "PAY-20938",
      userId: "regular-user-id",
      amount: 50000,
      credits: 10,
      proofFile: "",
      status: "pending",
      createdAt: daysAgo(1)
    }
  },

  // ── Submissions ───────────────────────────────────────────────────────────────
  submissions: {
    "sub-1": {
      id: "sub-1",
      submissionId: "SUB-88291",
      userId: "regular-user-id",
      checkTypeId: "turnitin-no-repo",
      checkTypeName: "Turnitin No-Repository (Safe Draft)",
      creditUsed: 2,
      documentFile: "",
      resultFile: "",
      status: "completed",
      notes: "Hasil plagiasi 12%. Aman di bawah batas minimal 20%.",
      options: {
        excludeBibliography: true,
        excludeQuotes: true,
        percentLimit: 20
      },
      createdAt: daysAgo(8),
      processedAt: daysAgo(8)
    },
    "sub-2": {
      id: "sub-2",
      submissionId: "SUB-99381",
      userId: "regular-user-id",
      checkTypeId: "turnitin-repo",
      checkTypeName: "Turnitin Repository (Final Check)",
      creditUsed: 3,
      documentFile: "",
      resultFile: "",
      status: "waiting",
      notes: "",
      options: {
        excludeBibliography: false,
        excludeQuotes: false
      },
      createdAt: daysAgo(2)
    }
  }
};

// ─── Credit Transactions (Array Collection) ────────────────────────────────────
const CREDIT_TRANSACTIONS = [
  {
    id: "txn-1",
    userId: "regular-user-id",
    type: "bonus",
    amount: 5,
    beforeBalance: 0,
    afterBalance: 5,
    referenceId: "promo-bonus-initial",
    description: "Bonus pendaftaran pengguna baru",
    createdAt: daysAgo(15)
  },
  {
    id: "txn-2",
    userId: "regular-user-id",
    type: "topup",
    amount: 20,
    beforeBalance: 5,
    afterBalance: 25,
    referenceId: "pay-1",
    description: "Pembelian kredit via transfer bank (Approved)",
    createdAt: daysAgo(10)
  },
  {
    id: "txn-3",
    userId: "regular-user-id",
    type: "usage",
    amount: -2,
    beforeBalance: 25,
    afterBalance: 23,
    referenceId: "sub-1",
    description: "Penggunaan kredit untuk Cek Turnitin No-Repository",
    createdAt: daysAgo(8)
  }
];

// ─── Main Seeder ───────────────────────────────────────────────────────────────
async function seedFirestore() {
  console.log("\n🚀 Menginisialisasi Firebase...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log("📦 Mulai memasukkan data seed ke Firestore...\n");

  // 1. Settings (nested: settings/general)
  console.log("1️⃣  Seeding collection: settings...");
  await setDoc(doc(db, "settings", "general"), SEED_DATA.settings.general);
  console.log("   ✓ settings/general");

  // 2. Check Types
  console.log("\n2️⃣  Seeding collection: checkTypes...");
  for (const [id, data] of Object.entries(SEED_DATA.checkTypes)) {
    await setDoc(doc(db, "checkTypes", id), data);
    console.log(`   ✓ checkTypes/${id}`);
  }

  // 3. Notifications
  console.log("\n3️⃣  Seeding collection: notifications...");
  for (const [id, data] of Object.entries(SEED_DATA.notifications)) {
    await setDoc(doc(db, "notifications", id), data);
    console.log(`   ✓ notifications/${id}`);
  }

  // 4. Users (dengan passwordHash)
  console.log("\n4️⃣  Seeding collection: users...");
  for (const [id, data] of Object.entries(SEED_DATA.users)) {
    await setDoc(doc(db, "users", id), data);
    console.log(`   ✓ users/${id} (${data.email}) [role: ${data.role}]`);
  }

  // 5. Payments
  console.log("\n5️⃣  Seeding collection: payments...");
  for (const [id, data] of Object.entries(SEED_DATA.payments)) {
    await setDoc(doc(db, "payments", id), data);
    console.log(`   ✓ payments/${id}`);
  }

  // 6. Submissions
  console.log("\n6️⃣  Seeding collection: submissions...");
  for (const [id, data] of Object.entries(SEED_DATA.submissions)) {
    await setDoc(doc(db, "submissions", id), data);
    console.log(`   ✓ submissions/${id}`);
  }

  // 7. Credit Transactions (Array → pakai setDoc dengan custom id)
  console.log("\n7️⃣  Seeding collection: creditTransactions...");
  for (const txn of CREDIT_TRANSACTIONS) {
    await setDoc(doc(db, "creditTransactions", txn.id), txn);
    console.log(`   ✓ creditTransactions/${txn.id}`);
  }

  console.log("\n✅ Seeding selesai! Semua data berhasil dimasukkan ke Firestore.");
  console.log("\n📋 Ringkasan Login:");
  console.log("┌─────────────────────────────────────────────────┐");
  console.log("│  ADMIN                                          │");
  console.log(`│  Email   : admin@turnitin.com                   │`);
  console.log(`│  Password: ${ADMIN_PASSWORD}                             │`);
  console.log("│                                                 │");
  console.log("│  USER (Demo)                                    │");
  console.log(`│  Email   : user@turnitin.com                    │`);
  console.log(`│  Password: ${USER_PASSWORD}                              │`);
  console.log("└─────────────────────────────────────────────────┘");
}

seedFirestore().catch((err) => {
  console.error("\n❌ Error saat seeding:", err.message);
  process.exit(1);
});
