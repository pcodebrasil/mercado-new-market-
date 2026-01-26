import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "mercado-c3e95.firebaseapp.com",
  projectId: "mercado-c3e95",
  storageBucket: "mercado-c3e95.firebasestorage.app",
  messagingSenderId: "883539091925",
  appId: "1:883539091925:web:d8bb6b99548e59beaa5d5c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const GERENTES = ["adriano@newmarket.com", "adrielle@newmarket.com"];
export const PAULO_ADM = "paulo@newmarket.com";
