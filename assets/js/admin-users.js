(() => {
const { initializeLocalAccounts, getSignedInAccount, listAccounts, createWorkerAccount } = window.LocalAuth;

const form = document.getElementById("workerForm");
const message = document.getElementById("adminMessage");
const accountList = document.getElementById("accountList");
const submitButton = form.querySelector("button[type='submit']");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.hidden = false;
  message.classList.toggle("auth-message-error", isError);
  message.classList.toggle("auth-message-success", !isError);
}

function renderAccounts() {
  accountList.replaceChildren();
  for (const account of listAccounts()) {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const email = document.createElement("span");
    const role = document.createElement("span");
    name.textContent = account.name;
    email.textContent = account.email;
    role.className = "account-role";
    role.textContent = account.role === "admin" ? "Administrador" : "Trabalhador";
    details.append(name, email);
    item.append(details, role);
    accountList.append(item);
  }
}

async function initialize() {
  await initializeLocalAccounts();
  const account = getSignedInAccount();
  if (!account || account.role !== "admin") {
    window.location.replace("login.html");
    return;
  }
  renderAccounts();
}

initialize().catch((error) => {
  console.error("Unable to open account management:", error);
  showMessage(error.message || "Não foi possível carregar as contas.", true);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.hidden = true;
  const name = document.getElementById("workerName").value.trim();
  const email = document.getElementById("workerEmail").value.trim();
  const password = document.getElementById("workerPassword").value;
  const passwordConfirm = document.getElementById("workerPasswordConfirm").value;

  if (password !== passwordConfirm) {
    showMessage("As palavras-passe não coincidem.", true);
    return;
  }

  submitButton.disabled = true;
  try {
    await createWorkerAccount({ name, email, password });
    form.reset();
    showMessage("Conta de trabalhador criada com sucesso.");
    renderAccounts();
  } catch (error) {
    console.error("Unable to create worker account:", error);
    showMessage(error.message || "Não foi possível criar a conta.", true);
  } finally {
    submitButton.disabled = false;
  }
});
})();
