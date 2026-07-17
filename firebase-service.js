import { firebaseConfig, hasFirebaseConfig, isAdminEmail } from "./firebase-config.js";

let auth;
let db;
let authApi;
let firestoreApi;

export function isFirebaseReady() {
  return hasFirebaseConfig();
}

export async function startFirebaseAuth(onChange) {
  if (!hasFirebaseConfig()) return false;
  const appApi = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  authApi = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  firestoreApi = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");

  const { initializeApp } = appApi;
  const { getAuth, onAuthStateChanged } = authApi;
  const { getFirestore } = firestoreApi;
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, onChange);
  return true;
}

export async function createAccount(name, email, password) {
  const credential = await authApi.createUserWithEmailAndPassword(auth, email, password);
  await authApi.updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function signIn(email, password) {
  const credential = await authApi.signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function sendPasswordReset(email) {
  await authApi.sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  if (!auth) return;
  await authApi.signOut(auth);
}

export async function loadCloudState(uid) {
  const snapshot = await firestoreApi.getDoc(firestoreApi.doc(db, "users", uid, "app", "state"));
  return snapshot.exists() ? snapshot.data().state : null;
}

export async function saveCloudState(uid, state) {
  await firestoreApi.setDoc(
    firestoreApi.doc(db, "users", uid, "app", "state"),
    {
      state,
      updatedAt: firestoreApi.serverTimestamp()
    },
    { merge: true }
  );
}

export async function loadCommunityPosts() {
  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(
      firestoreApi.collection(db, "public", "community", "posts"),
      firestoreApi.orderBy("createdAt", "desc"),
      firestoreApi.limit(40)
    )
  );
  return snapshot.docs.map((document) => document.data());
}

export async function addCommunityPost(user, post) {
  if (!user) {
    throw new Error("Sign in to post.");
  }
  await firestoreApi.addDoc(firestoreApi.collection(db, "public", "community", "posts"), {
    ...post,
    uid: user.uid,
    email: user.email,
    createdAt: firestoreApi.serverTimestamp()
  });
}

export async function loadPublicSettings() {
  const snapshot = await firestoreApi.getDoc(firestoreApi.doc(db, "public", "settings"));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function savePublicSettings(user, settings) {
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Admin access only.");
  }
  await firestoreApi.setDoc(
    firestoreApi.doc(db, "public", "settings"),
    {
      ...settings,
      updatedAt: firestoreApi.serverTimestamp(),
      updatedBy: user.email
    },
    { merge: true }
  );
}

export async function saveAdminSettings(user, settings) {
  if (!user || !isAdminEmail(user.email)) {
    throw new Error("Admin access only.");
  }
  await firestoreApi.setDoc(
    firestoreApi.doc(db, "admin", "settings"),
    {
      ...settings,
      updatedAt: firestoreApi.serverTimestamp(),
      updatedBy: user.email
    },
    { merge: true }
  );
}
