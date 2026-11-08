// Configuração e inicialização do Firebase (projeto agro-app-cde1c).
// Os valores da configuração web não são segredos: a segurança vem das
// regras do Firestore, não de esconder esta chave.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyB1ECnZJR2Ab4AvC77yt4hnzP-F2n9dk_A",
  authDomain: "agro-app-cde1c.firebaseapp.com",
  projectId: "agro-app-cde1c",
  storageBucket: "agro-app-cde1c.firebasestorage.app",
  messagingSenderId: "974578951915",
  appId: "1:974578951915:web:a2f336c4623555b1a640ae"
};

export const app = initializeApp(firebaseConfig);

// Cache local: as plantas continuam visíveis quando o telemóvel está sem rede.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
