
export let taskList = JSON.parse(localStorage.getItem("taskList")) || [
  {
    id: `csc229-hw-1`,
    title: `CSC229 HW`,
    desc: `Algorithm Analysis / Big-O Notation`,
    estPomos: 8,
    actPomos: 7,
    isCurrent: false
  },
  {
    id: `bcs378-hw-2`,
    title: `BCS378 HW`,
    desc: `Cryptography / Public Key Infrastructure`,
    estPomos: 10,
    actPomos: 1,
    isCurrent: false
  },
];

export let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];

export let currentTask = JSON.parse(localStorage.getItem("currentTask")) || {};

export let creationIncrement = JSON.parse(localStorage.getItem("creationIncrement")) || 0;  // Used for unique ids if titles are the same

const taskListHtmlContainer = document.querySelector(".task-list-container");
const addTaskBtn = document.querySelector(".add-task-btn");
const clearTasksBtn = document.querySelector(".clear-tasks-btn");
const addTaskForm = document.querySelector(".add-task-container");
const taskTitleInput = document.querySelector(".task-title-input");
const taskDescInput = document.querySelector(".task-desc-input");
const estPomosInput = document.querySelector(".est-pomos-input");
const createTaskBtn = document.querySelector(".create-task-btn");
const cancelTaskAddBtn = document.querySelector(".cancel-task-add-btn");
const currentTaskDisplay = document.querySelector(".current-task-display");
const completedTaskListDisplay = document.querySelector(".completed-tasks-container");

document.addEventListener("DOMContentLoaded", () => {
  renderTaskList();
});

export function renderTaskList() {

  currentTaskDisplay.innerHTML = currentTask.title ? currentTaskDisplay.innerHTML = `
    <p class="task-title">${currentTask.title}</p>
    <p class="task-description">${currentTask.desc}</p>
    <p class="task-pomos">Pomos: <span>${currentTask.actPomos}/${currentTask.estPomos}</span></p>
    <div class="task-progress-bar">
      <div class="task-progress" style="width: ${(currentTask.actPomos / currentTask.estPomos) * 100}%;"></div>
    </div>
    ` : "No current task data";

  let taskListHTML = "";

  taskList.forEach(task => {

    let {actPomos, estPomos} = task;
    let taskProgress = (actPomos / estPomos) * 100;

    taskListHTML += `
      <div class="task-container task-${task.id}">  
        <div class="task">
          <p class="task-title">${task.title}</p>
          <p class="task-description">${task.desc}</p>
          <p class="task-pomos">Pomos: <span>${task.actPomos}/${task.estPomos}</span></p>
          <div class="task-progress-bar">
            <div class="task-progress" style="width: ${taskProgress}%;"></div>
          </div>
        </div>
        <div class="task-controls">
          <button class="edit-task-btn" data-id="${task.id}">Edit</button>
          <button class="delete-task-btn" data-id="${task.id}">Delete</button>
          <button 
            onmouseover="this.style.border='2px solid white'; this.style.boxShadow='inset 0 0 10px white'" 
            onmouseout="this.style.border='2px solid ${task.isCurrent ? `var(--primary-color)` : `hsl(0, 0%, 25%)`}'; this.style.boxShadow='inset 0 0 10px ${task.isCurrent ? `var(--primary-color)` : `hsl(0, 0%, 25%)`}'" 
            style="border: 2px solid ${task.isCurrent ? `var(--primary-color)` : `hsl(0, 0%, 25%)`}; box-shadow: inset 0 0 10px ${task.isCurrent ? `var(--primary-color)` : `hsl(0, 0%, 25%)`}; color: ${task.isCurrent ? `var(--primary-color)` : `white`};" 
            class="mark-as-current-btn" 
            data-id="${task.id}">Current
          </button>
        </div>
      </div>
    `;
  });

  taskListHtmlContainer.innerHTML = taskListHTML;

  let completedTaskHTML = "";

  completedTasks.forEach(task => {

    completedTaskHTML += `
      <div class="completed-task">
        <div class="completed-task-title">${task.title}</div>
        <div class="completed-task-desc">${task.desc}</div>
        <div class="completed-task-pomos">Total Pomos: <span>${task.pomos}</span></div>
        <div class="completed-task-date">Completed: <span>${task.completionDate}</span></div>
      </div>
    `;
  });

  completedTaskListDisplay.innerHTML = completedTaskHTML;

  // Delete Task Functionality
  removeTask();

  // Edit Task Functionality
  editTask();

  // Mark a task as current functionality
  markTaskAsCurrent();

  console.log(taskList);
}

export function saveToStorage() { // Saves tasks to browser storage
  localStorage.setItem("taskList", JSON.stringify(taskList));
  localStorage.setItem("creationIncrement", JSON.stringify(creationIncrement));
  localStorage.setItem("currentTask", JSON.stringify(currentTask));
  localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
}

function removeTask() {
  document.querySelectorAll(".delete-task-btn").forEach((button, index) => {
    button.addEventListener("click", () => {

      const modalWrapper = document.createElement("div");
      const modal = document.createElement("div");
      const modalQuestion = document.createElement("p");
      const yesBtn = document.createElement("button");
      const noBtn = document.createElement("button");

      modalQuestion.textContent = `Are you sure you would like to delete "${taskList[index].title}"?`;
      yesBtn.textContent = "Yes";
      noBtn.textContent = "No";

      modal.appendChild(modalQuestion);
      modal.appendChild(yesBtn);
      modal.appendChild(noBtn);

      modalWrapper.classList.add("modal-wrapper");
      modal.classList.add("clear-task-list-modal");
      modalQuestion.classList.add("clear-task-list-modal-q");

      document.body.appendChild(modalWrapper);
      document.body.appendChild(modal);

      yesBtn.addEventListener("click", () => {
        if (taskList[index].isCurrent) {
          currentTask = {};
        }
        taskList.splice(index, 1);
        renderTaskList();
        saveToStorage();
        document.body.removeChild(modal);
        document.body.removeChild(modalWrapper);
      });

      noBtn.addEventListener("click", () => {
        document.body.removeChild(modal);
        document.body.removeChild(modalWrapper);
      });
    });
  });
}

function editTask() {
  document.querySelectorAll(".edit-task-btn").forEach((button, index) => {
    button.addEventListener("click", () => {

      const modalWrapper = document.createElement("div");
      modalWrapper.classList.add("modal-wrapper");
      document.body.appendChild(modalWrapper);
      
      const taskId = button.dataset.id;
      const taskContainer = document.querySelector(`.task-${taskId}`);

      taskContainer.style.display = "none";
      addTaskForm.style.display = "flex";

      const formBtns = document.querySelector(".add-task-form-btns");
      formBtns.removeChild(createTaskBtn);
      formBtns.removeChild(cancelTaskAddBtn);
      
      const saveEditBtn = document.createElement("button");
      saveEditBtn.textContent = "Save Changes";
      formBtns.prepend(saveEditBtn);

      const cancelEditBtn = document.createElement("button");
      cancelEditBtn.textContent = "Cancel Changes";
      formBtns.appendChild(cancelEditBtn);

      taskTitleInput.value = taskList[index].title;
      taskDescInput.value = taskList[index].desc;
      estPomosInput.value = taskList[index].estPomos;

      saveEditBtn.addEventListener("click", () => {
        if (!taskTitleInput.value) {
          alert("Please enter a title.");
          return;
        }

        if (taskList[index].actPomos > Number(estPomosInput.value)) {
          alert("Error: less estimated pomodoros than actual.");
          return;
        }

        if (taskList[index].actPomos === Number(estPomosInput.value)) {

          if (taskList[index].isCurrent) {
            currentTask.title = taskTitleInput.value;
            currentTask.desc = taskDescInput.value;
            currentTask.estPomos = Number(estPomosInput.value);
          }

          taskList[index].title = taskTitleInput.value;
          taskList[index].desc = taskDescInput.value;
          taskList[index].estPomos = Number(estPomosInput.value);
          renderTaskList();
          saveToStorage();

          completeTask(taskList[index], index);

          taskContainer.style.display = "flex";
          addTaskForm.style.display = "none";
          formBtns.prepend(createTaskBtn);
          formBtns.removeChild(saveEditBtn);
          formBtns.appendChild(cancelTaskAddBtn);
          formBtns.removeChild(cancelEditBtn);
          taskTitleInput.value = "";
          taskDescInput.value = "";
          estPomosInput.value = 1;
          document.body.removeChild(modalWrapper);
        }
        else {
          if (taskList[index].isCurrent) {
            currentTask.title = taskTitleInput.value;
            currentTask.desc = taskDescInput.value;
            currentTask.estPomos = Number(estPomosInput.value);
          }

          taskList[index].title = taskTitleInput.value;
          taskList[index].desc = taskDescInput.value;
          taskList[index].estPomos = Number(estPomosInput.value);
          taskContainer.style.display = "flex";
          addTaskForm.style.display = "none";
          formBtns.prepend(createTaskBtn);
          formBtns.removeChild(saveEditBtn);
          formBtns.appendChild(cancelTaskAddBtn);
          formBtns.removeChild(cancelEditBtn);
          taskTitleInput.value = "";
          taskDescInput.value = "";
          estPomosInput.value = 1;
          document.body.removeChild(modalWrapper);
          renderTaskList();
          saveToStorage();
        }
        
      });

      cancelEditBtn.addEventListener("click", () => {

        // Ensures that the task has previous values
        taskTitleInput.value = taskList[index].title;
        taskDescInput.value = taskList[index].desc;
        estPomosInput.value = taskList[index].estPomos;

        taskContainer.style.display = "flex";
        addTaskForm.style.display = "none";
        formBtns.prepend(createTaskBtn);
        formBtns.removeChild(saveEditBtn);
        formBtns.appendChild(cancelTaskAddBtn);
        formBtns.removeChild(cancelEditBtn);
        taskTitleInput.value = "";
        taskDescInput.value = "";
        estPomosInput.value = 1;
        document.body.removeChild(modalWrapper);
      });
    });
  });
}

function markTaskAsCurrent() {
  document.querySelectorAll(".mark-as-current-btn").forEach((button, index) => {
    button.addEventListener("click", () => {

      const currentTaskIndex = taskList.findIndex(task => task.isCurrent);

      if (currentTaskIndex !== -1 && currentTaskIndex !== index) {
        taskList[currentTaskIndex].isCurrent = false;
      }

      // If current is clicked again, toggle it off
      if (currentTaskIndex !== -1 && currentTaskIndex === index) {
        taskList[index].isCurrent = false;
        currentTask = {};
        renderTaskList();
        saveToStorage();
        return;
      }

      taskList[index].isCurrent = true;

      currentTask = {
        id: taskList[index].id,
        title: taskList[index].title,
        desc: taskList[index].desc,
        estPomos: taskList[index].estPomos,
        actPomos: taskList[index].actPomos,
        isCurrent: true
      };

      renderTaskList();
      saveToStorage();

    });
  });
}

function createTask() {
  const title = taskTitleInput.value;
  // Desc is optional, if value is present, set desc value to the value, otherwise set to empty string
  const desc = taskDescInput.value ? taskDescInput.value : "";
  const estimatedPomos = Number(estPomosInput.value);

  if (!title) {
    alert("Please enter a title.");
    return;
  }
  if (isNaN(estimatedPomos)) {
    alert("Please enter a number. (estimated pomos)");
    return;
  }
  creationIncrement = creationIncrement < 10 ? `0${creationIncrement}` : creationIncrement;

  const id = `${title.toLowerCase().replace(/\s+/g, "-")}-${creationIncrement}`;

  taskList.push({
    id,
    title,
    desc,
    estPomos: estimatedPomos,
    actPomos: 0,
    isCurrent: false
  });

  taskTitleInput.value = "";
  taskDescInput.value = "";
  estPomosInput.value = 1;

  creationIncrement++;

  renderTaskList();
  saveToStorage();
}

function clearTaskList() {

  const modalWrapper = document.createElement("div");
  const modal = document.createElement("div");
  const modalQuestion = document.createElement("p");
  const yesBtn = document.createElement("button");
  const noBtn = document.createElement("button");

  modalQuestion.innerHTML = "Are you sure you would like to clear your task list? <br> <b>Your current task will also be lost.</b>";
  yesBtn.textContent = "Yes";
  noBtn.textContent = "No";

  modal.appendChild(modalQuestion);
  modal.appendChild(yesBtn);
  modal.appendChild(noBtn);

  modalWrapper.classList.add("modal-wrapper");
  modal.classList.add("clear-task-list-modal");
  modalQuestion.classList.add("clear-task-list-modal-q");

  document.body.appendChild(modalWrapper);
  document.body.appendChild(modal);

  yesBtn.addEventListener("click", () => {
    taskList = [];
    currentTask = {};
    localStorage.removeItem("creationIncrement");
    creationIncrement = 0;
    renderTaskList();
    saveToStorage();
    document.body.removeChild(modal);
    document.body.removeChild(modalWrapper);
  });

  noBtn.addEventListener("click", () => {
    document.body.removeChild(modal);
    document.body.removeChild(modalWrapper);
  });
}

const modalWrapper = document.createElement("div");
modalWrapper.classList.add("modal-wrapper");

addTaskBtn.addEventListener("click", () => {
  addTaskForm.style.display = "flex";
  document.body.appendChild(modalWrapper);
});

clearTasksBtn.addEventListener("click", () => {
  clearTaskList();
});

createTaskBtn.addEventListener("click", () => {
  createTask();
  addTaskForm.style.display = "none";
  document.body.removeChild(modalWrapper);
});

cancelTaskAddBtn.addEventListener("click", () => {
  addTaskForm.style.display = "none";
  document.body.removeChild(modalWrapper);
});

addTaskForm.addEventListener("submit", e => {
  e.preventDefault();
});

export function completeTask(task, index) {

  const modalWrapper = document.createElement("div");
  const completeTaskModal = document.createElement("div");
  const completeTaskPrompt = document.createElement("p");
  const yesBtn = document.createElement("button");
  const noBtn = document.createElement("button");

  completeTaskPrompt.textContent = `Would you like to mark "${task.title}" as complete?`;
  yesBtn.textContent = "Yes";
  noBtn.textContent = "No";

  completeTaskModal.appendChild(completeTaskPrompt);
  completeTaskModal.appendChild(yesBtn);
  completeTaskModal.appendChild(noBtn);

  modalWrapper.classList.add("modal-wrapper");
  completeTaskModal.classList.add("complete-task-modal");
  completeTaskPrompt.classList.add("complete-task-prompt");

  document.body.appendChild(modalWrapper);
  document.body.appendChild(completeTaskModal);

  yesBtn.addEventListener("click", () => {

    taskList.splice(index, 1);
    currentTask = {};

    const today = new Date();
    const completionYear = today.getFullYear();
    const completionMonth = String(today.getMonth() + 1).padStart(2, '0');
    const completionDay = String(today.getDate()).padStart(2, '0');
    const formattedCompletionDate = `${completionMonth}/${completionDay}/${completionYear}`;
    
    completedTasks.unshift(
      {
        title: task.title,
        desc: task.desc,
        pomos: task.estPomos,
        completionDate: formattedCompletionDate
      }
    );

    renderTaskList();
    saveToStorage();
    document.body.removeChild(completeTaskModal);
    document.body.removeChild(modalWrapper);
  });

  noBtn.addEventListener("click", () => {
    task.estPomos++;
    currentTask.estPomos = task.estPomos;
    renderTaskList();
    saveToStorage();
    document.body.removeChild(completeTaskModal);
    document.body.removeChild(modalWrapper);
  });
}

console.log(completedTasks);