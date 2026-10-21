(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const PLANTS_KEY = "agro_app_plants";
  const TASKS_KEY = "agro_app_care_tasks";
  const fallbackImage = "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=500&q=85";
  const form = document.getElementById("addPlantForm");
  const photoInput = document.getElementById("plantPhoto");
  const photoPreview = document.getElementById("plantPhotoPreview");
  const photoPrompt = document.querySelector(".plant-photo-prompt");
  const locationSelect = document.getElementById("plantLocation");
  const customLocationField = document.getElementById("customLocationField");
  const errorMessage = document.getElementById("addPlantError");
  const saveButton = form.querySelector(".add-plant-save");
  const notificationsButton = document.getElementById("notificationsButton");
  let selectedPhoto = null;
  let previewUrl = null;

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage:`, error);
      return fallback;
    }
  }

  if (!readJson(CURRENT_USER_KEY, null)) {
    window.location.replace("menu.html");
    return;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function clearError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }

  function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function wateringDays(frequency) {
    return {
      daily: 1,
      "twice-weekly": 3,
      weekly: 7,
      biweekly: 15,
      monthly: 30
    }[frequency] || 7;
  }

  function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Não foi possível processar a fotografia."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Não foi possível abrir a fotografia escolhida."));
      };
      image.src = objectUrl;
    });
  }

  photoInput.addEventListener("change", () => {
    clearError();
    const [file] = photoInput.files;
    if (!file) {
      selectedPhoto = null;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      photoPreview.hidden = true;
      photoPrompt.hidden = false;
      return;
    }
    if (!file.type.startsWith("image/")) {
      photoInput.value = "";
      selectedPhoto = null;
      photoPreview.hidden = true;
      photoPrompt.hidden = false;
      showError("Escolhe um ficheiro de imagem válido.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      photoInput.value = "";
      selectedPhoto = null;
      photoPreview.hidden = true;
      photoPrompt.hidden = false;
      showError("A fotografia tem de ter menos de 8 MB.");
      return;
    }
    selectedPhoto = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    photoPreview.src = previewUrl;
    photoPreview.hidden = false;
    photoPrompt.hidden = true;
  });

  locationSelect.addEventListener("change", () => {
    const needsCustomLocation = locationSelect.value === "Outra";
    customLocationField.hidden = !needsCustomLocation;
    document.getElementById("customLocation").required = needsCustomLocation;
  });

  document.querySelectorAll(".care-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const selected = chip.getAttribute("aria-pressed") !== "true";
      chip.setAttribute("aria-pressed", String(selected));
      chip.classList.toggle("is-selected", selected);
    });
  });

  notificationsButton.addEventListener("click", () => {
    const expanded = notificationsButton.getAttribute("aria-expanded") === "true";
    notificationsButton.setAttribute("aria-expanded", String(!expanded));
    showError(expanded ? "Notificações fechadas." : "As notificações do teu jardim estão atualizadas.");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();
    saveButton.disabled = true;
    saveButton.setAttribute("aria-busy", "true");

    try {
      const name = document.getElementById("plantName").value.trim();
      const species = document.getElementById("plantSpecies").value.trim();
      const location = locationSelect.value === "Outra"
        ? document.getElementById("customLocation").value.trim()
        : locationSelect.value;
      if (!name || !location) {
        showError("Preenche o nome da planta e a localização.");
        return;
      }

      const frequency = document.getElementById("wateringFrequency").value;
      const nextWatering = getDateAfterDays(wateringDays(frequency));
      const care = [...document.querySelectorAll(".care-chip[aria-pressed='true']")]
        .map((chip) => chip.dataset.care);
      const previousPlants = readJson(PLANTS_KEY, []);
      if (!Array.isArray(previousPlants)) {
        showError("Não foi possível ler as plantas guardadas. Atualiza a página e tenta novamente.");
        return;
      }
      const plants = [...previousPlants];
      const plant = {
        id: `plant-${Date.now()}`,
        name,
        species,
        location,
        category: /echeveria|suculent/.test(`${name} ${species}`.toLocaleLowerCase("pt-PT"))
          ? "suculenta"
          : /varanda|jardim|exterior/.test(location.toLocaleLowerCase("pt-PT")) ? "exterior" : "interior",
        status: "Saudável",
        image: selectedPhoto ? await compressPhoto(selectedPhoto) : fallbackImage,
        favorite: true,
        wateringFrequency: frequency,
        watering: {
          daily: "Rega diária",
          "twice-weekly": "Rega 2x por semana",
          weekly: "Rega 1x por semana",
          biweekly: "Rega quinzenal",
          monthly: "Rega mensal"
        }[frequency],
        nextWatering,
        care
      };
      plants.unshift(plant);

      const previousTasks = readJson(TASKS_KEY, []);
      if (!Array.isArray(previousTasks)) {
        showError("Não foi possível ler o calendário de cuidados. Atualiza a página e tenta novamente.");
        return;
      }
      const initialTasks = localStorage.getItem(TASKS_KEY) === null ? [
        {
          id: "sample-water-monstera",
          title: "Regar a Monstera",
          plantName: "Monstera",
          description: "250 ml · Manhã",
          date: getDateAfterDays(0),
          image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=180&q=80",
          type: "water",
          done: false
        },
        {
          id: "sample-fertilize-lavender",
          title: "Fertilizar a Lavanda",
          plantName: "Lavanda",
          description: "Fertilizante NPK · Quinzenal",
          date: getDateAfterDays(1),
          image: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=180&q=80",
          type: "care",
          done: false
        },
        {
          id: "sample-prune-ficus",
          title: "Podar o Ficus",
          plantName: "Ficus",
          description: "Manutenção · Folhas secas",
          date: getDateAfterDays(2),
          image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=180&q=80",
          type: "care",
          done: false
        }
      ] : previousTasks;
      const tasks = [...initialTasks, {
        id: `watering-${plant.id}`,
        title: `Regar ${name}`,
        plantName: name,
        description: `Rega · ${plant.watering}`,
        date: nextWatering,
        image: plant.image,
        type: "water",
        done: false
      }];

      const previousPlantsValue = localStorage.getItem(PLANTS_KEY);
      const previousTasksValue = localStorage.getItem(TASKS_KEY);
      try {
        localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Unable to save the new plant:", error);
        if (previousPlantsValue === null) localStorage.removeItem(PLANTS_KEY);
        else localStorage.setItem(PLANTS_KEY, previousPlantsValue);
        if (previousTasksValue === null) localStorage.removeItem(TASKS_KEY);
        else localStorage.setItem(TASKS_KEY, previousTasksValue);
        showError("Não foi possível guardar a planta neste dispositivo. Liberta espaço e tenta novamente.");
        return;
      }

      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Unable to add plant:", error);
      showError(error instanceof Error ? error.message : "Não foi possível adicionar a planta. Tenta novamente.");
    } finally {
      saveButton.disabled = false;
      saveButton.removeAttribute("aria-busy");
    }
  });
})();
