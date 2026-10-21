const CURRENT_USER_KEY = "agro_app_current_user";

const USERS_KEY = "agro_app_users";
const BOOTSTRAP_ADMIN_EMAIL = "admin@agroapp.pt";
const BOOTSTRAP_ADMIN_SALT = "0a972577f74b21317eb0f51b9fd34edf";
const BOOTSTRAP_ADMIN_PASSWORD_HASH = "e82210eef1919d54933c5f99c758056654cbc3f2b00fb8493144b574ee820e03";
const PASSWORD_ITERATIONS = 120000;

function readUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored === null) return null;

  const users = JSON.parse(stored);
  if (!Array.isArray(users)) {
    throw new Error("A lista de contas guardada neste dispositivo é inválida.");
  }
  return users;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hasValidPasswordRecord(user) {
  return typeof user.salt === "string" &&
    /^[\da-f]{32}$/i.test(user.salt) &&
    typeof user.passwordHash === "string" &&
    /^[\da-f]{64}$/i.test(user.passwordHash);
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password, salt) {
  if (!crypto.subtle) {
    throw new Error("A autenticação local requer um contexto seguro (HTTPS ou localhost).");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt,
    iterations: PASSWORD_ITERATIONS,
    hash: "SHA-256"
  }, key, 256);
  return toHex(new Uint8Array(bits));
}

async function createStoredUser({ name, email, password, role }) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    salt: toHex(salt),
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };
}

async function initializeLocalAccounts() {
  let users = readUsers() || [];
  let admin = users.find(
    (user) => user.role === "admin" &&
      user.email.toLocaleLowerCase("pt-PT") === BOOTSTRAP_ADMIN_EMAIL
  );

  if (!admin || !hasValidPasswordRecord(admin)) {
    users = users.filter(
      (user) => user.role !== "admin" &&
        user.email.toLocaleLowerCase("pt-PT") !== BOOTSTRAP_ADMIN_EMAIL
    );
    admin = {
      id: crypto.randomUUID(),
      name: "Administrador",
      email: BOOTSTRAP_ADMIN_EMAIL,
      role: "admin",
      salt: BOOTSTRAP_ADMIN_SALT,
      passwordHash: BOOTSTRAP_ADMIN_PASSWORD_HASH,
      createdAt: new Date().toISOString()
    };
    users.push(admin);
    saveUsers(users);
  }

  const session = localStorage.getItem(CURRENT_USER_KEY);
  if (session) {
    const currentUser = JSON.parse(session);
    if (!(readUsers() || []).some((user) => user.id === currentUser.id)) {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
}

async function signIn(email, password) {
  const users = readUsers();
  if (!users) throw new Error("As contas ainda não foram inicializadas. Atualiza a página e tenta novamente.");

  const normalizedEmail = email.trim().toLocaleLowerCase("pt-PT");
  const user = users.find((account) => account.email.toLocaleLowerCase("pt-PT") === normalizedEmail);
  if (!user) throw new Error("E-mail ou palavra-passe incorretos.");
  if (!hasValidPasswordRecord(user)) {
    throw new Error("Os dados locais desta conta estão incompletos. Usa a conta de administrador configurada ou limpa os dados deste site e regista a conta novamente.");
  }

  const salt = Uint8Array.from(user.salt.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
  if (await hashPassword(password, salt) !== user.passwordHash) {
    throw new Error("E-mail ou palavra-passe incorretos.");
  }

  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
  return session;
}

function getSignedInAccount() {
  const storedSession = localStorage.getItem(CURRENT_USER_KEY);
  if (!storedSession) return null;

  const session = JSON.parse(storedSession);
  const users = readUsers() || [];
  const account = users.find((user) => user.id === session.id);
  return account ? { ...session, role: account.role } : null;
}

async function createAccount({ name, email, password, role }) {
  const users = readUsers() || [];
  if (!name.trim() || !email.trim() || password.length < 8) {
    throw new Error("Indica o nome, um e-mail e uma palavra-passe com pelo menos 8 caracteres.");
  }
  const normalizedEmail = email.trim().toLocaleLowerCase("pt-PT");
  if (users.some((user) => user.email.toLocaleLowerCase("pt-PT") === normalizedEmail)) {
    throw new Error("Já existe uma conta com esse e-mail.");
  }

  const account = await createStoredUser({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role
  });
  users.push(account);
  saveUsers(users);
  return { id: account.id, name: account.name, email: account.email, role: account.role, createdAt: account.createdAt };
}

async function createUserAccount({ name, email, password }) {
  return createAccount({ name, email, password, role: "worker" });
}

async function createWorkerAccount({ name, email, password }) {
  const session = getSignedInAccount();
  if (!session || session.role !== "admin") {
    throw new Error("Só o administrador pode criar contas de trabalhadores.");
  }

  return createAccount({ name, email, password, role: "worker" });
}

function listAccounts() {
  const session = getSignedInAccount();
  if (!session || session.role !== "admin") {
    throw new Error("Só o administrador pode consultar as contas.");
  }

  return (readUsers() || []).map(({ id, name, email, role, createdAt }) => ({
    id,
    name,
    email,
    role,
    createdAt
  }));
}

window.LocalAuth = {
  initializeLocalAccounts,
  signIn,
  getSignedInAccount,
  createUserAccount,
  createWorkerAccount,
  listAccounts
};
