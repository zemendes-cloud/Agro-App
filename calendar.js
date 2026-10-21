(() => {
  const CURRENT_USER_KEY = "agro_app_current_user";
  const TASKS_KEY = "agro_app_care_tasks";
  const imageByPlant = {
    monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=180&q=80",
    lavanda: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=180&q=80",
    ficus: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=180&q=80"
  };
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
    const storedTasks = readJson(TASKS_KEY, null);
    if (Array.isArray(storedTasks)) return storedTasks;

    const examples = [
      { id: "sample-water-monstera", title: "Regar a Monstera", plantName: "Monstera", description: "250 ml · Manhã", date: toDateKey(today), type: "water", done: false },
      { id: "sample-fertilize-lavender", title: "Fertilizar a Lavanda", plantName: "Lavanda", description: "Fertilizante NPK · Quinzenal", date: addDays(today, 1), type: "care", done: false },
      { id: "sample-prune-ficus", title: "Podar o Ficus", plantName: "Ficus", description: "Manutenção · Folhas secas", date: addDays(today, 2), type: "care", done: false }
    ].map((task) => ({ ...task, image: imageByPlant[task.plantName.toLocaleLowerCase("pt-PT")] }));

    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(examples));
    } catch (error) {
      console.error("Unable to initialize care tasks:", error);
      showToast("Não foi possível guardar o calendário neste dispositivo.");
    }
    return examples;
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
      image.src = task.image || imageByPlant[(task.plantName || "").toLocaleLowerCase("pt-PT")] || imageByPlant.monstera;
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
