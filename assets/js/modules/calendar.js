(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const TASKS_KEY = "agro_app_care_tasks";
  const PLANTS_KEY = "agro_app_plants";
  const SAMPLE_TASKS_MIGRATED_KEY = "agro_app_sample_tasks_migrated";
  const CARE_SCHEDULE_MIGRATED_KEY = "agro_app_care_schedule_migrated";
  const MONTH_END_SCHEDULE_MIGRATED_KEY = "agro_app_month_end_schedule_migrated";
  const fallbackPlants = [
    {
      id: "monstera",
      name: "Monstera",
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=500&q=85"
    },
    {
      id: "lavanda",
      name: "Lavanda",
      image: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=500&q=85"
    },
    {
      id: "ficus",
      name: "Ficus",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=85"
    },
    {
      id: "echeveria",
      name: "Echeveria Blue",
      image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=500&q=85"
    },
    {
      id: "ficus-lyrata",
      name: "Ficus Lyrata",
      image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=85"
    }
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = toDateKey(today);
  const toast = document.getElementById("gardenToast");
  let toastTimer;

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return toDateKey(next);
  }

  function createPlantsByName(storedPlants) {
    const plantsByName = new Map(
      fallbackPlants.map((plant) => [
        plant.name.trim().toLocaleLowerCase("pt-PT"),
        plant
      ])
    );
    for (const plant of storedPlants) {
      plantsByName.set(
        String(plant.name || "").trim().toLocaleLowerCase("pt-PT"),
        plant
      );
    }
    return plantsByName;
  }

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

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3000);
  }

  function loadTasks() {
    const storedPlants = readJson(PLANTS_KEY, []);
    if (!Array.isArray(storedPlants)) {
      throw new Error("A lista de plantas guardada neste dispositivo é inválida.");
    }

    const storedTasks = readJson(TASKS_KEY, null);
    let tasks = Array.isArray(storedTasks)
      ? storedTasks
      : [
        ...storedPlants
          .filter((plant) => plant.nextWatering)
          .map((plant) => ({
          id: `watering-${plant.id}-${plant.nextWatering}`,
          plantId: plant.id,
          title: `Regar ${plant.name}`,
          plantName: plant.name,
          description: `Rega · ${plant.watering || "Cuidados a definir"}`,
          date: plant.nextWatering,
          image: plant.image,
          type: "water",
          done: false
          })),
        ...storedPlants
          .filter((plant) =>
            String(plant.name || "").trim().toLocaleLowerCase("pt-PT") === "monstera" &&
            !plant.nextWatering
          )
          .map((plant) => ({
            id: `sample-water-${plant.id}`,
            plantId: plant.id,
            title: `Regar a ${plant.name}`,
            plantName: plant.name,
            description: "250 ml · Manhã",
            date: toDateKey(today),
            image: plant.image,
            type: "water",
            done: false
          }))
      ];

    if (localStorage.getItem(SAMPLE_TASKS_MIGRATED_KEY) !== "true") {
      const sampleTasks = [
        {
          id: "sample-fertilize-lavanda",
          plantName: "Lavanda",
          title: "Fertilizar a Lavanda",
          description: "Fertilizante NPK · Quinzenal",
          date: addDays(today, 1),
          type: "care"
        },
        {
          id: "sample-prune-ficus",
          plantName: "Ficus",
          title: "Podar o Ficus",
          description: "Manutenção · Folhas secas",
          date: addDays(today, 2),
          type: "care"
        }
      ];
      const plantsByName = createPlantsByName(storedPlants);
      const existingIds = new Set(tasks.map((task) => task.id));

      for (const sampleTask of sampleTasks) {
        const plant = plantsByName.get(sampleTask.plantName.toLocaleLowerCase("pt-PT"));
        if (!plant || existingIds.has(sampleTask.id)) continue;
        tasks.push({
          ...sampleTask,
          plantId: plant.id,
          image: plant.image,
          done: false
        });
        existingIds.add(sampleTask.id);
      }

      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        localStorage.setItem(SAMPLE_TASKS_MIGRATED_KEY, "true");
      } catch (error) {
        console.error("Unable to restore the example care tasks:", error);
        showToast("Não foi possível guardar as tarefas de exemplo neste dispositivo.");
      }
    }

    if (localStorage.getItem(CARE_SCHEDULE_MIGRATED_KEY) !== "true") {
      const sampleTasks = [
        {
          plantName: "Monstera",
          title: "Limpar as folhas da Monstera",
          description: "Manutenção · Pano húmido",
          daysFromToday: 3
        },
        {
          plantName: "Echeveria Blue",
          title: "Verificar a humidade da Echeveria",
          description: "Verificar o substrato antes de regar",
          daysFromToday: 4
        },
        {
          plantName: "Ficus Lyrata",
          title: "Rodar o vaso do Ficus Lyrata",
          description: "Manutenção · Rodar para exposição uniforme à luz",
          daysFromToday: 5
        },
        {
          plantName: "Lavanda",
          title: "Retirar folhas secas da Lavanda",
          description: "Manutenção · Remover folhas secas",
          daysFromToday: 6
        },
        {
          plantName: "Ficus",
          title: "Verificar as folhas do Ficus",
          description: "Inspecionar folhas e caules",
          daysFromToday: 7
        },
        {
          plantName: "Monstera",
          title: "Inspecionar novas folhas da Monstera",
          description: "Manutenção · Verificar o crescimento",
          daysFromToday: 8
        },
        {
          plantName: "Echeveria Blue",
          title: "Verificar a drenagem da Echeveria",
          description: "Manutenção · Confirmar que o vaso escoa bem",
          daysFromToday: 9
        }
      ];
      const plantsByName = createPlantsByName(storedPlants);
      const monstera = plantsByName.get("monstera");
      const todayKey = toDateKey(today);
      const hasMonsteraWateringToday = monstera && tasks.some((task) =>
        String(task.plantId) === String(monstera.id) &&
        task.date === todayKey &&
        (task.type === "water" || /regar/i.test(task.title))
      );

      if (monstera && !hasMonsteraWateringToday) {
        tasks.push({
          id: `sample-water-${monstera.id}-${todayKey}`,
          plantId: monstera.id,
          title: `Regar a ${monstera.name}`,
          plantName: monstera.name,
          description: "250 ml · Manhã",
          date: todayKey,
          image: monstera.image,
          type: "water",
          done: false
        });
      }

      for (const [index, sampleTask] of sampleTasks.entries()) {
        const plant = plantsByName.get(sampleTask.plantName.toLocaleLowerCase("pt-PT"));
        if (!plant) continue;
        const date = addDays(today, sampleTask.daysFromToday);
        const alreadyExists = tasks.some((task) =>
          String(task.plantId) === String(plant.id) &&
          task.date === date &&
          task.title === sampleTask.title
        );
        if (alreadyExists) continue;
        tasks.push({
          title: sampleTask.title,
          description: sampleTask.description,
          id: `sample-schedule-${index + 1}`,
          plantId: plant.id,
          plantName: plant.name,
          date,
          image: plant.image,
          type: "care",
          done: false
        });
      }

      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        localStorage.setItem(CARE_SCHEDULE_MIGRATED_KEY, "true");
      } catch (error) {
        console.error("Unable to extend the example care schedule:", error);
        showToast("Não foi possível guardar as novas tarefas neste dispositivo.");
      }
    }

    if (localStorage.getItem(MONTH_END_SCHEDULE_MIGRATED_KEY) !== "true") {
      const dailyCareTasks = [
        {
          plantName: "Monstera",
          title: "Verificar a humidade do substrato da Monstera",
          description: "Verificar a terra antes da próxima rega"
        },
        {
          plantName: "Lavanda",
          title: "Inspecionar as folhas da Lavanda",
          description: "Verificar se há folhas secas ou danificadas"
        },
        {
          plantName: "Ficus Lyrata",
          title: "Rodar o vaso do Ficus Lyrata",
          description: "Rodar ligeiramente para uma exposição uniforme à luz"
        },
        {
          plantName: "Echeveria Blue",
          title: "Verificar a drenagem da Echeveria",
          description: "Confirmar que o vaso não retém água"
        },
        {
          plantName: "Ficus",
          title: "Inspecionar as folhas do Ficus",
          description: "Verificar folhas e caules"
        },
        {
          plantName: "Monstera",
          title: "Limpar as folhas da Monstera",
          description: "Limpar cuidadosamente com um pano húmido"
        },
        {
          plantName: "Lavanda",
          title: "Retirar folhas secas da Lavanda",
          description: "Manutenção · Remover folhas secas"
        }
      ];
      const extraCareTasks = [
        {
          plantName: "Ficus Lyrata",
          title: "Limpar as folhas do Ficus Lyrata",
          description: "Limpar o pó com um pano macio"
        },
        {
          plantName: "Echeveria Blue",
          title: "Inspecionar a roseta da Echeveria",
          description: "Verificar se as folhas estão firmes e saudáveis"
        },
        {
          plantName: "Ficus",
          title: "Retirar folhas secas do Ficus",
          description: "Manutenção · Remover folhas caídas"
        },
        {
          plantName: "Monstera",
          title: "Verificar o crescimento da Monstera",
          description: "Inspecionar folhas novas e tutor"
        },
        {
          plantName: "Lavanda",
          title: "Verificar a terra da Lavanda",
          description: "Confirmar que o substrato não está encharcado"
        }
      ];
      const plantsByName = createPlantsByName(storedPlants);
      const daysUntilMonthEnd = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate() - today.getDate();
      const extraTaskOffsets = new Set([1, 2, 7, 12, 17, 22]);
      let scheduleChanged = false;

      function addScheduledTask(taskDetails, date, sequence) {
        const plant = plantsByName.get(taskDetails.plantName.toLocaleLowerCase("pt-PT"));
        if (!plant) return;
        const alreadyExists = tasks.some((task) =>
          String(task.plantId) === String(plant.id) &&
          task.date === date &&
          task.title === taskDetails.title
        );
        if (alreadyExists) return;

        tasks.push({
          id: `month-end-care-${date}-${sequence}`,
          plantId: plant.id,
          plantName: plant.name,
          title: taskDetails.title,
          description: taskDetails.description,
          date,
          image: plant.image,
          type: "care",
          done: false
        });
        scheduleChanged = true;
      }

      const monstera = plantsByName.get("monstera");
      const todayKey = toDateKey(today);
      const hasMonsteraWateringToday = monstera && tasks.some((task) =>
        String(task.plantId) === String(monstera.id) &&
        task.date === todayKey &&
        (task.type === "water" || /regar/i.test(task.title))
      );
      if (monstera && !hasMonsteraWateringToday) {
        tasks.push({
          id: `month-end-water-${monstera.id}-${todayKey}`,
          plantId: monstera.id,
          plantName: monstera.name,
          title: `Regar a ${monstera.name}`,
          description: "250 ml · Manhã",
          date: todayKey,
          image: monstera.image,
          type: "water",
          done: false
        });
        scheduleChanged = true;
      }

      for (let dayOffset = 0; dayOffset <= daysUntilMonthEnd; dayOffset += 1) {
        const date = addDays(today, dayOffset);
        addScheduledTask(
          dailyCareTasks[dayOffset % dailyCareTasks.length],
          date,
          "daily"
        );

        if (extraTaskOffsets.has(dayOffset)) {
          addScheduledTask(
            extraCareTasks[Math.floor(dayOffset / 5) % extraCareTasks.length],
            date,
            "extra"
          );
        }
      }

      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        localStorage.setItem(MONTH_END_SCHEDULE_MIGRATED_KEY, "true");
      } catch (error) {
        console.error("Unable to extend the care schedule through month end:", error);
        showToast("Não foi possível guardar as tarefas até ao fim do mês.");
      }
    }

    if (!Array.isArray(storedTasks)) {
      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Unable to synchronize care tasks with plants:", error);
        showToast("Não foi possível atualizar o calendário neste dispositivo.");
      }
    }
    return tasks;
  }

  let tasks = loadTasks();
  const monthHeading = document.getElementById("calendarMonth");
  const daysContainer = document.getElementById("calendarDays");
  const taskList = document.getElementById("taskList");
  const noTasks = document.getElementById("noTasks");
  const pendingCount = document.getElementById("pendingCount");
  const tasksHeading = document.getElementById("tasksHeading");

  function saveTasks() {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error("Unable to save care tasks:", error);
      showToast("Não foi possível guardar esta alteração neste dispositivo.");
      return false;
    }
  }

  function getTasksForDate(dateKey) {
    return tasks.filter((task) => task.date === dateKey);
  }

  function renderCalendar() {
    const formattedMonth = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(monthDate);
    monthHeading.textContent = formattedMonth.replace(/^./, (letter) => letter.toLocaleUpperCase("pt-PT"));
    daysContainer.replaceChildren();
    const firstWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    for (let index = 0; index < totalCells; index += 1) {
      const dayNumber = index - firstWeekday + 1;
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        const emptyCell = document.createElement("span");
        emptyCell.className = "calendar-day-empty";
        emptyCell.setAttribute("aria-hidden", "true");
        daysContainer.append(emptyCell);
        continue;
      }

      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber);
      const dateKey = toDateKey(date);
      const dayTasks = getTasksForDate(dateKey);
      const day = document.createElement("button");
      day.className = "calendar-day";
      day.type = "button";
      day.textContent = String(dayNumber);
      day.setAttribute("aria-label", new Intl.DateTimeFormat("pt-PT", { dateStyle: "full" }).format(date));
      day.setAttribute("aria-pressed", String(dateKey === selectedDate));
      if (dateKey === selectedDate) day.classList.add("is-selected");
      if (dateKey === toDateKey(today)) day.classList.add("is-today");
      if (dayTasks.some((task) => task.type === "water" || /regar/i.test(task.title))) day.classList.add("has-water");
      if (dayTasks.some((task) => task.type !== "water" && !/regar/i.test(task.title))) day.classList.add("has-care");
      day.addEventListener("click", () => {
        selectedDate = dateKey;
        renderCalendar();
        renderTasks();
      });
      daysContainer.append(day);
    }
  }

  function renderTasks() {
    const selectedTasks = getTasksForDate(selectedDate);
    const pending = selectedTasks.filter((task) => !task.done).length;
    pendingCount.textContent = `${pending} PENDENTE${pending === 1 ? "" : "S"}`;
    tasksHeading.textContent = selectedDate === toDateKey(today)
      ? "Tarefas de Hoje"
      : `Tarefas de ${new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long" }).format(new Date(`${selectedDate}T00:00:00`))}`;
    taskList.replaceChildren();
    noTasks.hidden = selectedTasks.length > 0;

    selectedTasks.forEach((task) => {
      const card = document.createElement("article");
      card.className = `care-task${task.done ? " is-done" : ""}`;
      const image = document.createElement("img");
      image.className = "care-task-image";
      if (task.image) image.src = task.image;
      image.alt = task.plantName || "Planta";
      image.loading = "lazy";

      const copy = document.createElement("div");
      copy.className = "care-task-copy";
      const title = document.createElement("h3");
      title.textContent = task.title;
      const description = document.createElement("p");
      description.textContent = task.description || "Cuidados agendados";
      copy.append(title, description);

      const completeButton = document.createElement("button");
      completeButton.className = "task-complete";
      completeButton.type = "button";
      completeButton.setAttribute("aria-label", task.done ? `Reabrir tarefa: ${task.title}` : `Concluir tarefa: ${task.title}`);
      completeButton.setAttribute("aria-pressed", String(Boolean(task.done)));
      if (task.done) {
        const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        check.setAttribute("viewBox", "0 0 24 24");
        check.setAttribute("aria-hidden", "true");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "m5 12 4 4L19 6");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "2.5");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        check.append(path);
        completeButton.append(check);
      }
      completeButton.addEventListener("click", () => {
        const previousState = task.done;
        task.done = !task.done;
        if (!saveTasks()) {
          task.done = previousState;
          return;
        }
        renderCalendar();
        renderTasks();
        showToast(task.done ? "Tarefa concluída. Muito bem!" : "Tarefa marcada como pendente.");
      });
      card.append(image, copy, completeButton);
      taskList.append(card);
    });
  }

  document.getElementById("previousMonth").addEventListener("click", () => {
    monthDate.setMonth(monthDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("nextMonth").addEventListener("click", () => {
    monthDate.setMonth(monthDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById("notificationsButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    showToast(expanded ? "Notificações fechadas." : "Tens tarefas de cuidado no calendário.");
  });

  renderCalendar();
  renderTasks();
})();
