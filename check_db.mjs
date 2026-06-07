import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALsGHKi6753h7s9w-Db8G0_93bEP4yea4",
  authDomain: "turnitin-f016a.firebaseapp.com",
  projectId: "turnitin-f016a",
  storageBucket: "turnitin-f016a.firebasestorage.app",
  messagingSenderId: "1053768510291",
  appId: "1:1053768510291:web:c44ad19c663df725eacfa6",
  measurementId: "G-NZ86BBBC1Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = [
  "checkTypes",
  "creditTransactions",
  "notifications",
  "payments",
  "settings",
  "submissions",
  "users"
];

async function listAllDocs() {
  console.log("=== LISTING ALL DOCUMENT IDS ===");
  for (const colName of COLLECTIONS) {
    console.log(`\n--- Collection: ${colName} ---`);
    try {
      const snap = await getDocs(collection(db, colName));
      snap.forEach((doc) => {
        const data = doc.data();
        let details = "";
        if (colName === "checkTypes") {
          details = `(slug: ${data.slug}, name: ${data.name})`;
        } else if (colName === "users") {
          details = `(email: ${data.email}, role: ${data.role})`;
        } else if (colName === "payments") {
          details = `(paymentId: ${data.paymentId}, userId: ${data.userId}, status: ${data.status})`;
        } else if (colName === "submissions") {
          details = `(submissionId: ${data.submissionId}, userId: ${data.userId}, checkTypeId: ${data.checkTypeId})`;
        } else if (colName === "settings") {
          details = `(bankName: ${data.bankName})`;
        } else if (colName === "notifications") {
          details = `(title: ${data.title})`;
        } else if (colName === "creditTransactions") {
          details = `(type: ${data.type}, userId: ${data.userId}, amount: ${data.amount})`;
        }
        console.log(`- ID: ${doc.id} ${details}`);
      });
    } catch (err) {
      console.error(`Gagal list ${colName}:`, err.message);
    }
  }
}

listAllDocs();
