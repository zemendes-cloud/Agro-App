(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const PLANTS_KEY = "agro_app_plants";
  const TASKS_KEY = "agro_app_care_tasks";
  const NOTIFICATIONS_KEY = "agro_app_notifications_enabled";

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage:`, error);
      return fallback;
    }
  }

  const user = readJson(CURRENT_USER_KEY, null);
  if (!user) {
    window.location.replace("menu.html");
    return;
  }

  const nameHeading = document.getElementById("profileName");
  const roleHeading = document.getElementById("profileRole");
  const adminManagement = document.getElementById("adminManagement");
  const avatarFallback = document.getElementById("profileAvatarFallback");
  const editDialog = document.getElementById("profileEditDialog");
  const settingsDialog = document.getElementById("settingsDialog");
  const helpDialog = document.getElementById("helpDialog");
  const toast = document.getElementById("gardenToast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  function displayName() {
    return String(user.name || user.email?.split("@")[0] || "Jardineiro").trim() || "Jardineiro";
  }

  function refreshName() {
    const name = displayName();
    nameHeading.textContent = name;
    avatarFallback.textContent = name.slice(0, 1).toLocaleUpperCase("pt-PT");
  }

  const plants = readJson(PLANTS_KEY, null);
  const tasks = readJson(TASKS_KEY, null);
  document.getElementById("plantCount").textContent = String(Array.isArray(plants) ? plants.length : 4);
  document.getElementById("taskCount").textContent = String(Array.isArray(tasks) ? tasks.length : 3);
  refreshName();
  roleHeading.textContent = user.role === "admin" ? "Administrador" : "Trabalhador";
  adminManagement.hidden = user.role !== "admin";

  document.getElementById("editProfileButton").addEventListener("click", () => {
    document.getElementById("profileNameInput").value = displayName();
    editDialog.showModal();
    document.getElementById("profileNameInput").focus();
  });

  document.getElementById("profileEditForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("profileNameInput").value.trim();
    if (!name) return;
    const previousName = user.name;
    user.name = name;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Unable to update the profile name:", error);
      user.name = previousName;
      showToast("Não foi possível guardar o nome neste dispositivo.");
      return;
    }
    refreshName();
    editDialog.close();
    showToast("O teu nome foi atualizado.");
  });

  document.getElementById("settingsButton").addEventListener("click", () => settingsDialog.showModal());
  document.getElementById("helpButton").addEventListener("click", () => helpDialog.showModal());
  document.getElementById("notificationsSetting").addEventListener("click", () => {
    const enabled = localStorage.getItem(NOTIFICATIONS_KEY) !== "false";
    const updated = !enabled;
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, String(updated));
      showToast(updated ? "Notificações ativadas." : "Notificações desativadas.");
    } catch (error) {
      console.error("Unable to update notification preference:", error);
      showToast("Não foi possível guardar esta preferência.");
    }
  });
  document.getElementById("notificationsButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    showToast(expanded ? "Notificações fechadas." : "As notificações do teu jardim estão atualizadas.");
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });
  [editDialog, settingsDialog, helpDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
  });
})();
