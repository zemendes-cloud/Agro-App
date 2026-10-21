(() => {
const { createUserAccount, initializeLocalAccounts, signIn } = window.LocalAuth;

const message = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
let initializationError;

function showMessage(text, isSuccess = false) {
  if (!message) return;
  message.textContent = text;
  message.hidden = false;
  message.classList.toggle("auth-message-success", isSuccess);
  message.classList.toggle("auth-message-error", !isSuccess);
}

function clearMessage() {
  if (!message) return;
  message.textContent = "";
  message.hidden = true;
  message.classList.remove("auth-message-success", "auth-message-error");
}

const initialization = initializeLocalAccounts().catch((error) => {
  console.error("Unable to initialize local accounts:", error);
  initializationError = error;
  showMessage(error.message || "Não foi possível inicializar as contas neste dispositivo.");
});

document.querySelectorAll(".eye-button").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.closest(".password-box")?.querySelector("input");
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    button.setAttribute("aria-label", input.type === "password" ? "Mostrar senha" : "Ocultar senha");
  });
});

if (loginForm) {
  const submitButton = loginForm.querySelector("button[type='submit']");
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
    await initialization;
    if (initializationError) {
      showMessage(initializationError.message || "Não foi possível inicializar as contas.");
      return;
    }

    if (submitButton) submitButton.disabled = true;
    try {
      await signIn(
        document.getElementById("loginEmail").value,
        document.getElementById("loginPassword").value
      );
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Local sign-in failed:", error);
      showMessage(error.message || "Não foi possível iniciar sessão.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

if (registerForm) {
  const submitButton = registerForm.querySelector("button[type='submit']");
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
    await initialization;
    if (initializationError) {
      showMessage(initializationError.message || "Não foi possível inicializar as contas.");
      return;
    }

    const password = document.getElementById("registerPassword").value;
    if (password !== document.getElementById("registerPasswordConfirm").value) {
      showMessage("As palavras-passe não coincidem.");
      return;
    }

    if (submitButton) submitButton.disabled = true;
    let registrationSucceeded = false;
    try {
      await createUserAccount({
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password
      });
      registrationSucceeded = true;
      registerForm.reset();
      showMessage("Conta criada com sucesso!", true);
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      console.error("Unable to create account:", error);
      showMessage(error.message || "Não foi possível criar a conta.");
    } finally {
      if (submitButton && !registrationSucceeded) submitButton.disabled = false;
    }
  });
}
})();
