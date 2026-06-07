import { auth, isFirebaseEnabled } from "./firebase";
import { dbService } from "./dbService";
import {
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup
} from "firebase/auth";

// --- SOCIAL MOCK PROFILES ---
const MOCK_PROFILES = {
  google: {
    name: "Google User Demo",
    email: "google.user@example.com",
    photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=google"
  },
  microsoft: {
    name: "Microsoft Work Demo",
    email: "ms.user@example.com",
    photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=microsoft"
  },
  facebook: {
    name: "Facebook Social Demo",
    email: "fb.user@example.com",
    photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=facebook"
  },
  apple: {
    name: "Apple Secure Demo",
    email: "apple.user@example.com",
    photoURL: "https://api.dicebear.com/7.x/pixel-art/svg?seed=apple"
  }
};

export const authService = {
  // 1. Sign In with Email & Password
  async signIn(email, password) {
    if (isFirebaseEnabled) {
      const cred = await fbSignIn(auth, email, password);
      // Fetch user role from firestore
      const userProfile = await dbService.getDocument("users", cred.user.uid);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: userProfile?.name || cred.user.displayName,
        photoURL: cred.user.photoURL,
        role: userProfile?.role || "user",
        credits: userProfile?.credits || 0,
        status: userProfile?.status || "active"
      };
    } else {
      // Sandbox implementation
      const users = await dbService.getDocuments("users");
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error("Pengguna tidak ditemukan. Silakan mendaftar.");
      }
      
      if (foundUser.status === "suspended") {
        throw new Error("Akun Anda ditangguhkan. Silakan hubungi admin.");
      }
      
      // Simulate successful login, store session in localStorage
      localStorage.setItem("turnitin_auth_session", JSON.stringify({ uid: foundUser.id }));
      // Trigger update
      window.dispatchEvent(new CustomEvent("mock_auth_update"));
      return foundUser;
    }
  },

  // 2. Sign Up with Email & Password
  async signUp(email, password, name) {
    if (isFirebaseEnabled) {
      const cred = await fbCreateUser(auth, email, password);
      const profile = {
        id: cred.user.uid,
        name,
        email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
        role: "user", // default role
        credits: 5,   // give 5 free credits on signup
        status: "active"
      };
      // Save user profile directly to Firestore
      await dbService.addDocument("users", profile, cred.user.uid);
      
      // Create a credit transaction for the signup bonus
      await dbService.addDocument("creditTransactions", {
        userId: cred.user.uid,
        type: "bonus",
        amount: 5,
        beforeBalance: 0,
        afterBalance: 5,
        referenceId: "signup-bonus",
        description: "Bonus pendaftaran pengguna baru"
      });

      return {
        uid: cred.user.uid,
        email,
        displayName: name,
        ...profile
      };
    } else {
      // Sandbox implementation
      const users = await dbService.getDocuments("users");
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (exists) {
        throw new Error("Email sudah terdaftar.");
      }

      const userId = `USR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const newProfile = {
        id: userId,
        name,
        email,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
        role: "user",
        credits: 5,
        status: "active"
      };

      // Add user to mock DB
      await dbService.addDocument("users", newProfile, userId);

      // Create initial credit transaction
      await dbService.addDocument("creditTransactions", {
        userId: userId,
        type: "bonus",
        amount: 5,
        beforeBalance: 0,
        afterBalance: 5,
        referenceId: "signup-bonus",
        description: "Bonus pendaftaran pengguna baru"
      });

      localStorage.setItem("turnitin_auth_session", JSON.stringify({ uid: userId }));
      window.dispatchEvent(new CustomEvent("mock_auth_update"));
      return newProfile;
    }
  },

  // 3. Sign Out
  async signOut() {
    if (isFirebaseEnabled) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem("turnitin_auth_session");
      window.dispatchEvent(new CustomEvent("mock_auth_update"));
    }
    return true;
  },

  // 4. Social Logins (Google, Microsoft, Facebook, Apple)
  async signInSocial(providerId) {
    if (isFirebaseEnabled) {
      let provider;
      if (providerId === "google") provider = new GoogleAuthProvider();
      else if (providerId === "facebook") provider = new FacebookAuthProvider();
      else if (providerId === "microsoft") provider = new OAuthProvider("microsoft.com");
      else if (providerId === "apple") provider = new OAuthProvider("apple.com");
      else throw new Error("Unsupported social provider");

      const res = await signInWithPopup(auth, provider);
      const uid = res.user.uid;
      const email = res.user.email;
      const displayName = res.user.displayName || providerId + " User";

      // Check if user profile already exists
      let profile = await dbService.getDocument("users", uid);
      if (!profile) {
        profile = {
          id: uid,
          name: displayName,
          email,
          photoURL: res.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${providerId}`,
          role: "user",
          credits: 5,
          status: "active"
        };
        await dbService.addDocument("users", profile, uid);
        await dbService.addDocument("creditTransactions", {
          userId: uid,
          type: "bonus",
          amount: 5,
          beforeBalance: 0,
          afterBalance: 5,
          referenceId: "social-signup-bonus",
          description: "Bonus pendaftaran pengguna baru via " + providerId
        });
      }
      return { uid, email, displayName, ...profile };
    } else {
      // Sandbox implementation
      const mockProfile = MOCK_PROFILES[providerId] || MOCK_PROFILES.google;
      const users = await dbService.getDocuments("users");
      let foundUser = users.find(u => u.email.toLowerCase() === mockProfile.email.toLowerCase());

      if (!foundUser) {
        const userId = `USR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        foundUser = {
          id: userId,
          name: mockProfile.name,
          email: mockProfile.email,
          photoURL: mockProfile.photoURL,
          role: "user",
          credits: 5,
          status: "active"
        };
        await dbService.addDocument("users", foundUser, userId);
        await dbService.addDocument("creditTransactions", {
          userId: userId,
          type: "bonus",
          amount: 5,
          beforeBalance: 0,
          afterBalance: 5,
          referenceId: `social-${providerId}`,
          description: "Bonus pendaftaran pengguna baru via " + providerId
        });
      }

      localStorage.setItem("turnitin_auth_session", JSON.stringify({ uid: foundUser.id }));
      window.dispatchEvent(new CustomEvent("mock_auth_update"));
      return foundUser;
    }
  },

  // 5. Auth State Changed Listener
  onAuthStateChanged(callback) {
    if (isFirebaseEnabled) {
      return auth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          // Listen to the user document in real-time to reflect changes to credits/status immediately
          const unsub = dbService.subscribeCollection("users", (usersList) => {
            const profile = usersList.find(u => u.id === fbUser.uid);
            if (profile) {
              callback({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: profile.name,
                photoURL: profile.photoURL,
                role: profile.role,
                credits: profile.credits,
                status: profile.status
              });
            } else {
              callback(null);
            }
          }, [{ field: "id", operator: "==", value: fbUser.uid }]);
          
          return unsub;
        } else {
          callback(null);
        }
      });
    } else {
      // Sandbox listener
      let unsubUser = null;
      
      const checkSession = () => {
        const sessionStr = localStorage.getItem("turnitin_auth_session");
        if (sessionStr) {
          try {
            const { uid } = JSON.parse(sessionStr);
            if (unsubUser) unsubUser();
            
            // Subscribe to this specific user profile changes (realtime listener)
            unsubUser = dbService.subscribeCollection("users", (usersList) => {
              const profile = usersList.find(u => u.id === uid);
              if (profile) {
                callback(profile);
              } else {
                callback(null);
              }
            });
          } catch (e) {
            callback(null);
          }
        } else {
          if (unsubUser) unsubUser();
          callback(null);
        }
      };

      // Initial check
      checkSession();

      const handleUpdate = () => {
        checkSession();
      };

      window.addEventListener("mock_auth_update", handleUpdate);
      window.addEventListener("mock_db_update", handleUpdate);

      return () => {
        window.removeEventListener("mock_auth_update", handleUpdate);
        window.removeEventListener("mock_db_update", handleUpdate);
        if (unsubUser) unsubUser();
      };
    }
  }
};
