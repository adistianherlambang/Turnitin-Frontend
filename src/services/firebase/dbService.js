import { db, isFirebaseEnabled } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

// --- SEED DATA FOR SANDBOX ---
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
const SEED_DATA = {
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
      seoDescription: "Jasa cek plagiasi Turnitin no-repository murah, cepat dan aman. Terpercaya untuk skripsi, tesis, dan jurnal."
    }
  },
  checkTypes: {
    "turnitin-no-repo": {
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
    },
    "turnitin-repo": {
      id: "turnitin-repo",
      name: "Turnitin Repository (Final Check)",
      slug: "turnitin-repo",
      description: "Pengecekan final dengan mencocokkan dokumen ke database institusi nasional & internasional.",
      creditCost: 3,
      unitType: "fixed",
      unitValue: 1,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
    },
    "turnitin-per-page": {
      id: "turnitin-per-page",
      name: "Turnitin Premium (Per 250 Kata)",
      slug: "turnitin-per-page",
      description: "Pengecekan fleksibel untuk artikel pendek, abstrak, atau per bab. Lebih hemat biaya.",
      creditCost: 1,
      unitType: "per_word",
      unitValue: 250,
      isActive: true,
      sortOrder: 3,
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    }
  },
  notifications: {
    "notif-1": {
      id: "notif-1",
      title: "Promo Awal Bulan: Bonus 5 Kredit Top-Up!",
      message: "Setiap pembelian minimal 20 kredit akan mendapatkan bonus tambahan 5 kredit secara otomatis. Berlaku hingga akhir minggu ini.",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      createdBy: "admin-system"
    },
    "notif-2": {
      id: "notif-2",
      title: "Server Pemeliharaan Selesai",
      message: "Pemeliharaan rutin server pengecekan Turnitin telah selesai. Semua proses pengecekan kini berjalan lebih cepat.",
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      createdBy: "admin-system"
    }
  },
  users: {
    "admin-user-id": {
      id: "admin-user-id",
      name: "Super Admin",
      email: "admin@turnitin.com",
      passwordHash: "959acb5d71cd3a21f075f034d598e50c65e849b2d230f9a5e42522a24b3cf0d1",
      photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
      role: "admin",
      credits: 9999,
      status: "active",
      createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString()
    },
    "regular-user-id": {
      id: "regular-user-id",
      name: "John Doe",
      email: "user@turnitin.com",
      passwordHash: "69437277f8d3047503b89905b30218cdebdf345dfb0216a7b26e9770f965c314",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      role: "user",
      credits: 15,
      status: "active",
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    }
  },
  payments: {
    "pay-1": {
      id: "pay-1",
      paymentId: "PAY-10029",
      userId: "regular-user-id",
      amount: 100000,
      credits: 20,
      proofFile: "",
      status: "approved",
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      verifiedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
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
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  },
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
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 8 * 24 * 3600 * 950).toISOString()
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
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 200 * 1000).toISOString()
    }
  },
  creditTransactions: [
    {
      id: "txn-2",
      userId: "regular-user-id",
      type: "topup",
      amount: 20,
      beforeBalance: 0,
      afterBalance: 20,
      referenceId: "pay-1",
      description: "Pembelian kredit via transfer bank (Approved)",
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "txn-3",
      userId: "regular-user-id",
      type: "usage",
      amount: -2,
      beforeBalance: 20,
      afterBalance: 18,
      referenceId: "sub-1",
      description: "Penggunaan kredit untuk Cek Turnitin No-Repository",
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
    }
  ]
};

// Initialize LocalStorage Database if not exists
const initMockDB = () => {
  if (typeof window === "undefined") return;

  const storedData = localStorage.getItem("turnitin_mock_db");
  if (!storedData) {
    localStorage.setItem("turnitin_mock_db", JSON.stringify(SEED_DATA));
  }
};

const getMockDB = () => {
  if (typeof window === "undefined") return SEED_DATA;
  initMockDB();
  return JSON.parse(localStorage.getItem("turnitin_mock_db"));
};

const saveMockDB = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("turnitin_mock_db", JSON.stringify(data));
  // Trigger custom event to notify listeners
  window.dispatchEvent(new CustomEvent("mock_db_update"));
};

// Simulated Database Update Listeners
const mockListeners = [];

// --- DATABASE SERVICE LAYER ---
export const dbService = {
  // 1. Get all documents from a collection
  async getDocuments(collectionName, queryFilters = []) {
    if (isFirebaseEnabled) {
      let colRef = collection(db, collectionName);
      let q = colRef;

      // Apply filters if provided
      if (queryFilters.length > 0) {
        const clauses = queryFilters.map(f => where(f.field, f.operator, f.value));
        q = query(colRef, ...clauses);
      }

      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const dbData = getMockDB();
      const colData = dbData[collectionName];

      if (!colData) return [];

      // If array (like creditTransactions)
      if (Array.isArray(colData)) {
        let list = [...colData];
        // Apply filters
        queryFilters.forEach(f => {
          list = list.filter(item => {
            if (f.operator === "==") return item[f.field] === f.value;
            if (f.operator === "!=") return item[f.field] !== f.value;
            return true;
          });
        });
        return list;
      }

      // If object
      let list = Object.values(colData);
      queryFilters.forEach(f => {
        list = list.filter(item => {
          if (f.operator === "==") return item[f.field] === f.value;
          if (f.operator === "!=") return item[f.field] !== f.value;
          return true;
        });
      });
      return list;
    }
  },

  // 2. Get single document
  async getDocument(collectionName, docId) {
    if (isFirebaseEnabled) {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } else {
      const dbData = getMockDB();
      const colData = dbData[collectionName];
      if (!colData) return null;

      if (Array.isArray(colData)) {
        return colData.find(item => item.id === docId) || null;
      }
      return colData[docId] || null;
    }
  },

  // 3. Add a document
  /**
   * @param {string} collectionName
   * @param {any} data
   * @param {string|null} [customId=null]
   */
  async addDocument(collectionName, data, customId = null) {
    if (isFirebaseEnabled) {
      let finalId = customId;
      if (!finalId && collectionName === "creditTransactions") {
        finalId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      }

      if (finalId) {
        const docRef = doc(db, collectionName, finalId);
        await setDoc(docRef, { ...data, id: finalId, createdAt: new Date().toISOString() });
        return { id: finalId, ...data };
      } else {
        const colRef = collection(db, collectionName);
        const docRef = doc(colRef);
        const generatedId = docRef.id;
        await setDoc(docRef, { ...data, id: generatedId, createdAt: new Date().toISOString() });
        return { id: generatedId, ...data };
      }
    } else {
      const dbData = getMockDB();
      if (!dbData[collectionName]) {
        dbData[collectionName] = Array.isArray(SEED_DATA[collectionName]) ? [] : {};
      }

      const id = customId || `${collectionName.substring(0, 3)}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const newDoc = {
        id,
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };

      if (Array.isArray(dbData[collectionName])) {
        dbData[collectionName].push(newDoc);
      } else {
        dbData[collectionName][id] = newDoc;
      }

      saveMockDB(dbData);
      return newDoc;
    }
  },

  // 4. Update a document
  async updateDocument(collectionName, docId, data) {
    if (isFirebaseEnabled) {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      return { id: docId, ...data };
    } else {
      const dbData = getMockDB();
      const colData = dbData[collectionName];
      if (!colData) throw new Error(`Collection ${collectionName} does not exist`);

      if (Array.isArray(colData)) {
        const index = colData.findIndex(item => item.id === docId);
        if (index !== -1) {
          colData[index] = { ...colData[index], ...data, updatedAt: new Date().toISOString() };
        } else {
          throw new Error(`Document ${docId} not found`);
        }
      } else {
        if (colData[docId]) {
          colData[docId] = { ...colData[docId], ...data, updatedAt: new Date().toISOString() };
        } else {
          throw new Error(`Document ${docId} not found`);
        }
      }

      saveMockDB(dbData);
      return { id: docId, ...data };
    }
  },

  // 5. Delete a document
  async deleteDocument(collectionName, docId) {
    if (isFirebaseEnabled) {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return docId;
    } else {
      const dbData = getMockDB();
      const colData = dbData[collectionName];
      if (!colData) return docId;

      if (Array.isArray(colData)) {
        dbData[collectionName] = colData.filter(item => item.id !== docId);
      } else {
        delete colData[docId];
      }

      saveMockDB(dbData);
      return docId;
    }
  },

  // 6. Subscribe to real-time collection changes (Snapshots)
  subscribeCollection(collectionName, callback, queryFilters = []) {
    if (isFirebaseEnabled) {
      let colRef = collection(db, collectionName);
      let q = colRef;

      if (queryFilters.length > 0) {
        const clauses = queryFilters.map(f => where(f.field, f.operator, f.value));
        q = query(colRef, ...clauses);
      }

      return onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      }, (err) => {
        console.error(`Firestore subscription error on ${collectionName}:`, err);
      });
    } else {
      // Mock Real-time Listener using local window events
      const runCallback = () => {
        const dbData = getMockDB();
        let colData = dbData[collectionName];
        if (!colData) {
          callback([]);
          return;
        }

        let list = Array.isArray(colData) ? [...colData] : Object.values(colData);

        // Apply filters
        queryFilters.forEach(f => {
          list = list.filter(item => {
            if (f.operator === "==") return item[f.field] === f.value;
            if (f.operator === "!=") return item[f.field] !== f.value;
            return true;
          });
        });

        // Sort order by createdAt descending by default if applicable
        if (list.length > 0 && list[0].createdAt) {
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (list.length > 0 && list[0].sortOrder !== undefined) {
          list.sort((a, b) => a.sortOrder - b.sortOrder);
        }

        callback(list);
      };

      // Initial trigger
      runCallback();

      // Register event listener
      const handleUpdate = () => {
        runCallback();
      };

      window.addEventListener("mock_db_update", handleUpdate);

      // Return unsubscribe function
      return () => {
        window.removeEventListener("mock_db_update", handleUpdate);
      };
    }
  }
};
