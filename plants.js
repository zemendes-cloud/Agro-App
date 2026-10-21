(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const PLANTS_KEY = "agro_app_plants";
  const demoPlants = [
    {
      id: "monstera",
      name: "Monstera",
      species: "Monstera deliciosa",
      location: "Sala de estar",
      category: "interior",
      status: "Saudável",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=500&q=85",
      favorite: true
    },
    {
      id: "lavanda",
      name: "Lavanda",
      species: "Lavandula angustifolia",
      location: "Varanda",
      category: "exterior",
      status: "Precisa de água",
      image: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=500&q=85",
      favorite: false
    },
    {
      id: "ficus",
      name: "Ficus",
      species: "Ficus lyrata",
      location: "Sala de estar",
      category: "interior",
      status: "Cuidado pendente",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=85",
      favorite: true
    },
    {
      id: "echeveria",
      name: "Echeveria",
      species: "Echeveria elegans",
      location: "Varanda",
      category: "suculenta",
      status: "Saudável",
      image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=500&q=85",
      favorite: true
    }
  ];
  const currentUser = readJson(CURRENT_USER_KEY, null);
  const plantList = document.getElementById("plantList");
  const plantsEmpty = document.getElementById("plantsEmpty");
  const searchInput = document.getElementById("plantSearch");
  const toast = document.getElementById("gardenToast");
  const detailDialog = document.getElementById("plantDetailDialog");
  let activeCategory = "all";
  let toastTimer;

  if (!currentUser) {
    window.location.replace("menu.html");
    return;
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

  function loadPlants() {
    const storedPlants = readJson(PLANTS_KEY, null);
    if (!Array.isArray(storedPlants)) return demoPlants;

    const normalizedPlants = storedPlants.map((plant) => {
      const searchName = `${plant.name || ""} ${plant.species || ""}`.toLocaleLowerCase("pt-PT");
      const category = plant.category || (
        /echeveria|suculent/.test(searchName) ? "suculenta" :
          /lavand|exterior|alecrim/.test(searchName) ? "exterior" : "interior"
      );

      return {
        ...plant,
        category,
        species: plant.species || "",
        status: plant.status || "Saudável",
        location: plant.location || "Por definir"
      };
    });
    const storedIds = new Set(normalizedPlants.map((plant) => plant.id));
    return [...normalizedPlants, ...demoPlants.filter((plant) => !storedIds.has(plant.id))];
  }

  let plants = loadPlants();

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

  function statusClass(status) {
    if (status === "Precisa de água") return "status-water";
    if (status === "Cuidado pendente") return "status-pending";
    return "status-healthy";
  }

  function renderPlants() {
    const query = searchInput.value.trim().toLocaleLowerCase("pt-PT");
    const filteredPlants = plants.filter((plant) => {
      const matchesCategory = activeCategory === "all" || plant.category === activeCategory;
      const searchable = `${plant.name} ${plant.species || ""} ${plant.location || ""}`.toLocaleLowerCase("pt-PT");
      return matchesCategory && searchable.includes(query);
    });

    plantList.replaceChildren();
    plantsEmpty.hidden = filteredPlants.length > 0;

    filteredPlants.forEach((plant) => {
      const card = document.createElement("article");
      card.className = "plant-row";
      const image = document.createElement("img");
      image.className = "plant-row-image";
      image.src = plant.image || demoPlants[0].image;
      image.alt = plant.name;
      image.loading = "lazy";

      const details = document.createElement("div");
      details.className = "plant-row-details";
      const title = document.createElement("h2");
      title.textContent = plant.name;
      const species = document.createElement("p");
      species.className = "plant-species";
      species.textContent = plant.species || "Espécie por identificar";

      const status = document.createElement("span");
      status.className = `plant-status ${statusClass(plant.status)}`;
      const statusDot = document.createElement("span");
      statusDot.setAttribute("aria-hidden", "true");
      const statusText = document.createElement("span");
      statusText.textContent = plant.status || "Saudável";
      status.append(statusDot, statusText);
      details.append(title, species, status);

      const openButton = document.createElement("button");
      openButton.className = "plant-open-button";
      openButton.type = "button";
      openButton.setAttribute("aria-label", `Ver detalhes de ${plant.name}`);
      openButton.textContent = "›";
      openButton.addEventListener("click", () => openPlantDetails(plant));
      card.append(image, details, openButton);
      plantList.append(card);
    });

    savePlants();
  }

  function openPlantDetails(plant) {
    document.getElementById("plantDetailImage").src = plant.image || demoPlants[0].image;
    document.getElementById("plantDetailImage").alt = plant.name;
    document.getElementById("plantDetailStatus").textContent = plant.status || "Saudável";
    document.getElementById("plantDetailTitle").textContent = plant.name;
    document.getElementById("plantDetailSpecies").textContent = plant.species || "Espécie por identificar";
    document.getElementById("plantDetailLocation").textContent = `Localização: ${plant.location || "Por definir"}`;
    detailDialog.showModal();
  }

  searchInput.addEventListener("input", renderPlants);

  document.querySelectorAll(".plant-filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll(".plant-filter").forEach((filter) => {
        const selected = filter === button;
        filter.classList.toggle("is-active", selected);
        filter.setAttribute("aria-pressed", String(selected));
      });
      renderPlants();
    });
  });

  document.getElementById("notificationsButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    showToast(expanded ? "Notificações fechadas." : "Tens plantas a precisar de cuidados.");
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  [detailDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  renderPlants();
})();
