(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const PLANTS_KEY = "agro_app_plants";
  const defaultPlants = [
    {
      id: "ficus-lyrata",
      name: "Ficus Lyrata",
      location: "Sala de Estar",
      watering: "Rega em 2 dias",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=85",
      favorite: true
    },
    {
      id: "echeveria",
      name: "Echeveria Blue",
      location: "Varanda",
      watering: "Regar hoje",
      image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=85",
      favorite: true
    }
  ];
  const currentUser = readJson(CURRENT_USER_KEY, null);
  const gardenerName = document.getElementById("gardenerName");
  const plantCarousel = document.getElementById("plantCarousel");
  const emptyPlants = document.getElementById("emptyPlants");
  const toast = document.getElementById("gardenToast");
  const tipDialog = document.getElementById("tipDialog");
  let toastTimer;

  if (!currentUser) {
    window.location.replace("menu.html");
    return;
  }

  const firstName = String(currentUser.name || "").trim().split(/\s+/)[0];
  if (gardenerName && firstName) gardenerName.textContent = firstName;

  let plants = readJson(PLANTS_KEY, null);
  if (!Array.isArray(plants)) {
    plants = defaultPlants;
    savePlants();
  }

  function readJson(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage:`, error);
      return fallback;
    }
  }

  function savePlants() {
    try {
      localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
    } catch (error) {
      console.error("Unable to save plants:", error);
      showToast("Não foi possível guardar as alterações neste dispositivo.");
    }
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function renderPlants() {
    const favorites = plants.filter((plant) => plant.favorite);
    plantCarousel.replaceChildren();
    emptyPlants.hidden = favorites.length > 0;

    favorites.forEach((plant) => {
      const card = document.createElement("article");
      card.className = "favorite-plant";
      const image = document.createElement("img");
      image.className = "favorite-plant-image";
      image.src = plant.image || defaultPlants[0].image;
      image.alt = plant.name;
      image.loading = "lazy";

      const favoriteButton = document.createElement("button");
      favoriteButton.className = "favorite-toggle";
      favoriteButton.type = "button";
      favoriteButton.setAttribute("aria-label", `Remover ${plant.name} dos favoritos`);
      favoriteButton.setAttribute("aria-pressed", "true");
      favoriteButton.textContent = "♡";
      favoriteButton.addEventListener("click", () => {
        plant.favorite = false;
        savePlants();
        renderPlants();
        showToast(`${plant.name} removida dos favoritos.`);
      });

      const details = document.createElement("div");
      details.className = "favorite-plant-details";
      const title = document.createElement("h3");
      title.textContent = plant.name;
      const description = document.createElement("p");
      description.textContent = `${plant.location} · ${plant.watering || "Cuidados a definir"}`;

      card.append(image, favoriteButton);
      details.append(title, description);
      card.append(details);
      plantCarousel.append(card);
    });
  }

  document.getElementById("notificationsButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    showToast(expanded ? "Notificações fechadas." : "Tens 3 plantas para regar e 2 tarefas de poda.");
  });

  document.getElementById("readTipButton").addEventListener("click", () => tipDialog.showModal());
  document.getElementById("viewAllPlants").addEventListener("click", () => {
    window.location.href = "plants.html";
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  tipDialog.addEventListener("click", (event) => {
    if (event.target === tipDialog) tipDialog.close();
  });

  renderPlants();
})();
