import { db } from "./firebase";
import { dbService } from "./dbService";

// ─────────────────────────────────────────────
// Password hashing menggunakan Web Crypto API
// (built-in browser, tidak butuh library tambahan)
// ─────────────────────────────────────────────
const SALT = "turnitin-checker-2026";

async function hashPassword(password) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // SSR fallback: pakai simple hash (tidak aman, hanya untuk SSR)
    return btoa(password + SALT);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────
// Session helpers (localStorage)
// ─────────────────────────────────────────────
const SESSION_KEY = "turnitin_auth_session";

function setSession(uid) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ uid }));
  window.dispatchEvent(new CustomEvent("mock_auth_update"));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("mock_auth_update"));
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Auth Service — Firestore-based, no Firebase Auth
// ─────────────────────────────────────────────
export const authService = {

  // 1. Login dengan Email & Password
  async signIn(email, password) {
    const normalEmail = email.trim().toLowerCase();
    const hashedPwd = await hashPassword(password);

    // Cari user di Firestore berdasarkan email
    const users = await dbService.getDocuments("users", [
      { field: "email", operator: "==", value: normalEmail }
    ]);

    if (!users || users.length === 0) {
      throw new Error("Email tidak terdaftar. Silakan daftar terlebih dahulu.");
    }

    const user = users[0];

    if (user.status === "suspended") {
      throw new Error("Akun Anda ditangguhkan. Silakan hubungi admin.");
    }

    // Verifikasi password
    if (user.passwordHash !== hashedPwd) {
      throw new Error("Password salah. Silakan coba lagi.");
    }

    setSession(user.id);
    return user;
  },

  // 2. Daftar Akun Baru
  async signUp(email, password, name) {
    const normalEmail = email.trim().toLowerCase();
    const hashedPwd = await hashPassword(password);

    // Cek apakah email sudah terdaftar
    const existing = await dbService.getDocuments("users", [
      { field: "email", operator: "==", value: normalEmail }
    ]);

    if (existing && existing.length > 0) {
      throw new Error("Email sudah terdaftar. Silakan masuk atau gunakan email lain.");
    }

    // Buat ID unik
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const profile = {
      id: userId,
      name: name.trim(),
      email: normalEmail,
      passwordHash: hashedPwd,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.replace(/\s+/g, ""))}`,
      role: "user",
      credits: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };

    // Simpan ke Firestore
    await dbService.addDocument("users", profile, userId);

    setSession(userId);
    return profile;
  },

  // 3. Logout
  async signOut() {
    clearSession();
    return true;
  },

  // 4. Social Login — tidak tersedia (pakai email/password saja)
  async signInSocial(providerId) {
    throw new Error(
      `Login dengan ${providerId} tidak tersedia. Silakan gunakan email dan password.`
    );
  },

  // 5. Auth State Listener — subscribe ke Firestore user secara realtime
  onAuthStateChanged(callback) {
    if (typeof window === "undefined") {
      callback(null);
      return () => {};
    }

    let unsubUser = null;

    const checkSession = () => {
      const session = getSession();

      if (session?.uid) {
        // Berlangganan perubahan realtime dari Firestore untuk user ini
        if (unsubUser) unsubUser();
        unsubUser = dbService.subscribeCollection("users", (usersList) => {
          const profile = usersList.find((u) => u.id === session.uid);
          if (profile) {
            callback(profile);
          } else {
            // User dihapus dari Firestore
            clearSession();
            callback(null);
          }
        });
      } else {
        if (unsubUser) {
          unsubUser();
          unsubUser = null;
        }
        callback(null);
      }
    };

    // Cek sesi saat pertama kali
    checkSession();

    // Dengarkan perubahan sesi
    window.addEventListener("mock_auth_update", checkSession);
    window.addEventListener("mock_db_update", checkSession);

    // Return fungsi unsubscribe
    return () => {
      window.removeEventListener("mock_auth_update", checkSession);
      window.removeEventListener("mock_db_update", checkSession);
      if (unsubUser) unsubUser();
    };
  }
};
