/**
 * repair_db.mjs
 *
 * Script to migrate and repair Firestore database inconsistencies.
 * 1. Restores the missing 'turnitin-no-repo' checkType.
 * 2. Migrates submission documents with random hash keys (e.g. KyTkPepe865OOfboDDE8)
 *    to clean keys matching their user-facing ID (e.g. SUB-64321), and sets the internal "id" field.
 * 3. Migrates payment documents with random hash keys to clean keys matching their paymentId (e.g. PAY-83179).
 * 4. Migrates credit transactions to clean prefixed keys (e.g. TXN-...) and sets internal "id".
 * 5. Ensures all documents in other collections have their internal "id" field set to match their document ID.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, ".env.local");

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
  console.log("✓ .env.local successfully loaded");
} catch {
  console.error("❌ File .env.local not found in frontend directory.");
  process.exit(1);
}

// Firebase Config
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
  console.error("❌ Firebase config incomplete. Check .env.local.");
  process.exit(1);
}

async function repair() {
  console.log("🚀 Initializing Firebase...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // 1. Restore turnitin-no-repo checkType
  console.log("\n1️⃣  Checking turnitin-no-repo checkType...");
  const noRepoDocRef = doc(db, "checkTypes", "turnitin-no-repo");
  const noRepoData = {
    id: "turnitin-no-repo",
    name: "Turnitin No-Repository (Safe Draft)",
    slug: "turnitin-no-repo",
    description: "Hasil cek tidak masuk database Turnitin, aman dicek berkali-kali untuk revisi draf skripsi/tesis.",
    creditCost: 2,
    unitType: "fixed",
    unitValue: 1,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  };
  await setDoc(noRepoDocRef, noRepoData);
  console.log("   ✓ Restored/Confirmed 'turnitin-no-repo' check type.");

  // 2. Migrate Submissions
  console.log("\n2️⃣  Migrating submissions...");
  const subSnap = await getDocs(collection(db, "submissions"));
  for (const docSnap of subSnap.docs) {
    const docId = docSnap.id;
    const data = docSnap.data();
    const targetId = data.submissionId || docId;
    
    // If the doc ID is a random Firestore hash (i.e. not equal to targetId and not mock like sub-1)
    if (docId !== targetId) {
      console.log(`   Migrating submission: ${docId} -> ${targetId}`);
      // Create new doc with targetId
      const newDocRef = doc(db, "submissions", targetId);
      await setDoc(newDocRef, { ...data, id: targetId });
      // Delete old doc
      const oldDocRef = doc(db, "submissions", docId);
      await deleteDoc(oldDocRef);
    } else if (data.id !== docId) {
      // Just align the payload ID field
      console.log(`   Fixing payload id field for submission: ${docId}`);
      const docRef = doc(db, "submissions", docId);
      await setDoc(docRef, { ...data, id: docId });
    }
  }
  console.log("   ✓ Completed submissions migration.");

  // 3. Migrate Payments
  console.log("\n3️⃣  Migrating payments...");
  const paySnap = await getDocs(collection(db, "payments"));
  for (const docSnap of paySnap.docs) {
    const docId = docSnap.id;
    const data = docSnap.data();
    const targetId = data.paymentId || docId;
    
    if (docId !== targetId) {
      console.log(`   Migrating payment: ${docId} -> ${targetId}`);
      const newDocRef = doc(db, "payments", targetId);
      await setDoc(newDocRef, { ...data, id: targetId });
      const oldDocRef = doc(db, "payments", docId);
      await deleteDoc(oldDocRef);
    } else if (data.id !== docId) {
      console.log(`   Fixing payload id field for payment: ${docId}`);
      const docRef = doc(db, "payments", docId);
      await setDoc(docRef, { ...data, id: docId });
    }
  }
  console.log("   ✓ Completed payments migration.");

  // 4. Migrate Credit Transactions
  console.log("\n4️⃣  Migrating creditTransactions...");
  const txnSnap = await getDocs(collection(db, "creditTransactions"));
  for (const docSnap of txnSnap.docs) {
    const docId = docSnap.id;
    const data = docSnap.data();
    
    // Check if it's already a clean transaction ID format
    const isMock = docId.startsWith("txn-");
    const isClean = docId.startsWith("TXN-");
    
    if (!isMock && !isClean) {
      // Generate standard TXN-<randomHash> based on doc ID to make it clean
      const targetId = `TXN-${docId.toUpperCase()}`;
      console.log(`   Migrating transaction: ${docId} -> ${targetId}`);
      const newDocRef = doc(db, "creditTransactions", targetId);
      await setDoc(newDocRef, { ...data, id: targetId });
      const oldDocRef = doc(db, "creditTransactions", docId);
      await deleteDoc(oldDocRef);
    } else if (data.id !== docId) {
      console.log(`   Fixing payload id field for transaction: ${docId}`);
      const docRef = doc(db, "creditTransactions", docId);
      await setDoc(docRef, { ...data, id: docId });
    }
  }
  console.log("   ✓ Completed creditTransactions migration.");

  // 5. Standardize other collections (users, settings, notifications, checkTypes)
  const remainingCollections = ["users", "settings", "notifications", "checkTypes"];
  console.log("\n5️⃣  Standardizing remaining collections...");
  for (const colName of remainingCollections) {
    const snap = await getDocs(collection(db, colName));
    for (const docSnap of snap.docs) {
      const docId = docSnap.id;
      const data = docSnap.data();
      if (data.id !== docId) {
        console.log(`   Fixing payload id field in ${colName}/${docId}`);
        const docRef = doc(db, colName, docId);
        await setDoc(docRef, { ...data, id: docId });
      }
    }
  }
  console.log("   ✓ Completed standardization for other collections.");

  console.log("\n✅ Database migration and repair completed successfully!");
}

repair().catch((err) => {
  console.error("❌ Error running database repair:", err);
  process.exit(1);
});
