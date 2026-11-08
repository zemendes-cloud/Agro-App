(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const PLANTS_KEY = "agro_app_plants";
  const TASKS_KEY = "agro_app_care_tasks";
  const DEMO_PLANTS_MIGRATED_KEY = "agro_app_demo_plants_migrated";
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

    const plants = storedPlants.map((plant) => {
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

    if (
      localStorage.getItem(DEMO_PLANTS_MIGRATED_KEY) !== "true" &&
      plants.some((plant) => plant.id === "ficus-lyrata") &&
      plants.some((plant) => plant.id === "echeveria")
    ) {
      const knownIds = new Set(plants.map((plant) => String(plant.id)));
      const knownNames = new Set(plants.map((plant) =>
        String(plant.name || "").trim().toLocaleLowerCase("pt-PT")
      ));
      for (const demoPlant of demoPlants) {
        const normalizedName = demoPlant.name.trim().toLocaleLowerCase("pt-PT");
        if (knownIds.has(String(demoPlant.id)) || knownNames.has(normalizedName)) continue;
        plants.push({ ...demoPlant });
        knownIds.add(String(demoPlant.id));
        knownNames.add(normalizedName);
      }

      try {
        localStorage.setItem(DEMO_PLANTS_MIGRATED_KEY, "true");
        localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
      } catch (error) {
        console.error("Unable to add the initial example plants:", error);
      }
    }

    const tasks = readJson(TASKS_KEY, []);
    if (!Array.isArray(tasks)) return plants;

    let tasksChanged = false;
    for (const task of tasks) {
      if (typeof task.plantName !== "string") continue;
      const taskPlantName = task.plantName.trim().toLocaleLowerCase("pt-PT");
      const existingPlant = plants.find((plant) =>
        (task.plantId !== undefined && task.plantId !== null &&
          String(plant.id) === String(task.plantId)) ||
        String(plant.name || "").trim().toLocaleLowerCase("pt-PT") === taskPlantName
      );
      if (existingPlant) {
        if (String(task.plantId) !== String(existingPlant.id)) {
          task.plantId = existingPlant.id;
          tasksChanged = true;
        }
        continue;
      }

      const knownPlant = demoPlants.find((plant) =>
        plant.name.trim().toLocaleLowerCase("pt-PT") === taskPlantName
      );
      if (!knownPlant) continue;

      const restoredPlant = {
        ...knownPlant,
        favorite: false,
        nextWatering: task.date,
        watering: task.description || "Cuidados a definir"
      };
      plants.push(restoredPlant);
      task.plantId = restoredPlant.id;
      tasksChanged = true;
    }

    if (tasksChanged) {
      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Unable to link existing care tasks to plants:", error);
      }
    }

    return plants;
  }

  let plants = loadPlants();

  function savePlants() {
    try {
      localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
      return true;
    } catch (error) {
      console.error("Unable to save plants:", error);
      showToast("Não foi possível guardar as alterações neste dispositivo.");
      return false;
    }
  }

  function getRelatedTasks(plant) {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored === null) return [];
    const tasks = JSON.parse(stored);
    if (!Array.isArray(tasks)) {
      throw new Error("A lista de tarefas do calendário é inválida.");
    }

    const plantName = String(plant.name || "").trim().toLocaleLowerCase("pt-PT");
    return tasks.map((task, index) => {
      const matchesId = task.plantId !== undefined && String(task.plantId) === String(plant.id);
      const matchesLegacyName = (task.plantId === undefined || task.plantId === null) &&
        typeof task.plantName === "string" &&
        task.plantName.trim().toLocaleLowerCase("pt-PT") === plantName;
      return matchesId || matchesLegacyName ? index : -1;
    }).filter((index) => index >= 0);
  }

  function updateRelatedTasks(plant, updatedPlant) {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored === null) return;
    const tasks = JSON.parse(stored);
    if (!Array.isArray(tasks)) {
      throw new Error("A lista de tarefas do calendário é inválida.");
    }

    const oldName = String(plant.name || "");
    const oldNameLower = oldName.trim().toLocaleLowerCase("pt-PT");
    const updatedTasks = tasks.map((task) => {
      const matchesId = task.plantId !== undefined && String(task.plantId) === String(plant.id);
      const matchesLegacyName = (task.plantId === undefined || task.plantId === null) &&
        typeof task.plantName === "string" &&
        task.plantName.trim().toLocaleLowerCase("pt-PT") === oldNameLower;
      if (!matchesId && !matchesLegacyName) return task;

      return {
        ...task,
        plantId: updatedPlant.id,
        plantName: updatedPlant.name,
        title: typeof task.title === "string" ? task.title.replace(oldName, updatedPlant.name) : task.title,
        image: updatedPlant.image || task.image
      };
    });
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  }

  function removeRelatedTasks(plant) {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored === null) return;
    const tasks = JSON.parse(stored);
    if (!Array.isArray(tasks)) {
      throw new Error("A lista de tarefas do calendário é inválida.");
    }

    const relatedIndexes = new Set(getRelatedTasks(plant));
    const remainingTasks = tasks.filter((task, index) => !relatedIndexes.has(index));
    localStorage.setItem(TASKS_KEY, JSON.stringify(remainingTasks));
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
    document.getElementById("plantDetailsView").hidden = false;
    document.getElementById("editPlantForm").hidden = true;
    document.getElementById("plantEditError").hidden = true;
    detailDialog.dataset.plantId = String(plant.id);
    detailDialog.showModal();
  }

  function startEditingPlant() {
    const plant = plants.find((item) => String(item.id) === detailDialog.dataset.plantId);
    if (!plant) return;

    document.getElementById("editPlantName").value = plant.name || "";
    document.getElementById("editPlantSpecies").value = plant.species || "";
    document.getElementById("editPlantLocation").value = plant.location || "";
    document.getElementById("editPlantCategory").value = plant.category || "interior";
    document.getElementById("editPlantStatus").value = plant.status || "Saudável";
    document.getElementById("plantEditError").hidden = true;
    document.getElementById("plantDetailsView").hidden = true;
    document.getElementById("editPlantForm").hidden = false;
    document.getElementById("editPlantName").focus();
  }

  function savePlantEdits(event) {
    event.preventDefault();
    const plantIndex = plants.findIndex((item) => String(item.id) === detailDialog.dataset.plantId);
    const errorMessage = document.getElementById("plantEditError");
    if (plantIndex < 0) {
      errorMessage.textContent = "Não foi possível encontrar esta planta.";
      errorMessage.hidden = false;
      return;
    }

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const previousPlant = plants[plantIndex];
    const updatedPlant = {
      ...plants[plantIndex],
      name: document.getElementById("editPlantName").value.trim(),
      species: document.getElementById("editPlantSpecies").value.trim(),
      location: document.getElementById("editPlantLocation").value.trim(),
      category: document.getElementById("editPlantCategory").value,
      status: document.getElementById("editPlantStatus").value
    };

    if (!updatedPlant.name || !updatedPlant.location) {
      errorMessage.textContent = "Preenche o nome e a localização da planta.";
      errorMessage.hidden = false;
      return;
    }

    plants[plantIndex] = updatedPlant;
    if (!savePlants()) {
      plants[plantIndex] = previousPlant;
      return;
    }
    let taskSyncFailed = false;
    try {
      updateRelatedTasks(previousPlant, updatedPlant);
    } catch (error) {
      console.error("Unable to update related care tasks:", error);
      taskSyncFailed = true;
    }
    detailDialog.close();
    renderPlants();
    showToast(taskSyncFailed
      ? "A planta foi guardada, mas não foi possível atualizar as tarefas do calendário."
      : `${updatedPlant.name} foi atualizada.`);
  }

  function confirmPlantDeletion() {
    const plant = plants.find((item) => String(item.id) === detailDialog.dataset.plantId);
    if (!plant) return;
    document.getElementById("deletePlantName").textContent = plant.name;
    document.getElementById("deletePlantDialog").showModal();
  }

  function deleteSelectedPlant() {
    const plantIndex = plants.findIndex((item) => String(item.id) === detailDialog.dataset.plantId);
    if (plantIndex < 0) return;

    const [deletedPlant] = plants.splice(plantIndex, 1);
    if (!savePlants()) {
      plants.splice(plantIndex, 0, deletedPlant);
      return;
    }
    let taskSyncFailed = false;
    try {
      removeRelatedTasks(deletedPlant);
    } catch (error) {
      console.error("Unable to remove related care tasks:", error);
      taskSyncFailed = true;
    }
    document.getElementById("deletePlantDialog").close();
    detailDialog.close();
    renderPlants();
    showToast(taskSyncFailed
      ? "A planta foi eliminada, mas não foi possível atualizar as tarefas do calendário."
      : `${deletedPlant.name} foi eliminada do teu jardim.`);
  }

  searchInput.addEventListener("input", renderPlants);
  document.getElementById("editPlantButton").addEventListener("click", startEditingPlant);
  document.getElementById("editPlantForm").addEventListener("submit", savePlantEdits);
  document.getElementById("cancelEditPlantButton").addEventListener("click", () => {
    document.getElementById("editPlantForm").hidden = true;
    document.getElementById("plantDetailsView").hidden = false;
  });
  document.getElementById("deletePlantButton").addEventListener("click", confirmPlantDeletion);
  document.getElementById("cancelDeletePlantButton").addEventListener("click", () => {
    document.getElementById("deletePlantDialog").close();
  });
  document.getElementById("confirmDeletePlantButton").addEventListener("click", deleteSelectedPlant);

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
