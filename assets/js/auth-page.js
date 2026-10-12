import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const CURRENT_USER_KEY = "agro_app_current_user";
const configValues = Object.values(firebaseConfig);
const isConfigured = configValues.every((value) => value && !value.startsWith("YOUR_"));
const message = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authButtons = document.querySelectorAll(".social-auth-btn, .create-btn[type='submit']");
let auth;

if (isConfigured) {
  try {
    auth = getAuth(initializeApp(firebaseConfig));
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    showMessage("A configuração Firebase é inválida. Confirma os valores em assets/js/firebase-config.js.");
  }
} else {
  showMessage("A autenticação ainda não está configurada. Segue o ficheiro FIREBASE_SETUP.md para ligar o Firebase.");
}

function showMessage(text) {
  if (!message) return;
  message.textContent = text;
  message.hidden = false;
}

function clearMessage() {
  if (!message) return;
  message.textContent = "";
  message.hidden = true;
}

function getErrorMessage(error) {
  const messages = {
    "auth/account-exists-with-different-credential": "Já existe uma conta com este e-mail. Entra usando o método original.",
    "auth/email-already-in-use": "Este e-mail já está registado. Experimenta iniciar sessão.",
    "auth/invalid-credential": "As credenciais são inválidas. Verifica o e-mail e a palavra-passe.",
    "auth/invalid-email": "O endereço de e-mail não é válido.",
    "auth/operation-not-allowed": "Este método ainda não está ativado no Firebase Authentication.",
    "auth/popup-blocked": "O navegador bloqueou a janela de autenticação. Permite pop-ups e tenta novamente.",
    "auth/popup-closed-by-user": "A janela de autenticação foi fechada antes de concluir.",
    "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase Authentication.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Não existe uma conta com este e-mail.",
    "auth/weak-password": "A palavra-passe tem de ter pelo menos 6 caracteres.",
    "auth/wrong-password": "Palavra-passe incorreta."
  };

  return messages[error.code] || "Não foi possível autenticar. Confirma a configuração do Firebase e tenta novamente.";
}

function saveSignedInUser(user) {
  const name = user.displayName || user.email?.split("@")[0] || "Utilizador";
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    uid: user.uid,
    name,
    email: user.email || "",
    provider: user.providerData[0]?.providerId || "password"
  }));
  window.location.href = "menu.html";
}

async function runAuth(action) {
  clearMessage();
  if (!auth) {
    showMessage("A autenticação ainda não está configurada. Segue o ficheiro FIREBASE_SETUP.md.");
    return;
  }

  authButtons.forEach((button) => { button.disabled = true; });

  try {
    await setPersistence(auth, browserLocalPersistence);
    const user = await action();
    saveSignedInUser(user);
  } catch (error) {
    console.error("Authentication failed:", error.code || error.message);
    showMessage(getErrorMessage(error));
  } finally {
    authButtons.forEach((button) => { button.disabled = false; });
  }
}

document.querySelectorAll(".eye-button").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.closest(".password-box")?.querySelector("input");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    button.setAttribute("aria-label", input.type === "password" ? "Mostrar senha" : "Ocultar senha");
  });
});

document.querySelectorAll("[data-provider]").forEach((button) => {
  button.addEventListener("click", () => {
    if (registerForm && !document.getElementById("acceptTerms")?.checked) {
      showMessage("Aceita os Termos e Condições antes de criar a conta.");
      return;
    }

    const provider = button.dataset.provider === "apple"
      ? new OAuthProvider("apple.com")
      : new GoogleAuthProvider();

    if (button.dataset.provider === "apple") {
      provider.addScope("email");
      provider.addScope("name");
    } else {
      provider.setCustomParameters({ prompt: "select_account" });
    }

    runAuth(async () => (await signInWithPopup(auth, provider)).user);
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runAuth(async () => {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      return (await signInWithEmailAndPassword(auth, email, password)).user;
    });
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = document.getElementById("registerPasswordConfirm").value;

    if (password !== passwordConfirm) {
      showMessage("As palavras-passe não coincidem.");
      return;
    }

    if (!document.getElementById("acceptTerms").checked) {
      showMessage("Aceita os Termos e Condições antes de criar a conta.");
      return;
    }

    runAuth(async () => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return credential.user;
    });
  });
}
