import { currentTask, saveToStorage, renderTaskList, taskList, completedTasks, completeTask } from "./task.js";

const timerContainer = document.querySelector(".timer-container");
const timerElement = document.querySelector(".timer");
const progressBar = document.querySelector(".progress");
const startTimerBtn = document.querySelector(".start-btn");
const pauseTimerBtn = document.querySelector(".pause-btn");
const pomodoroBtn = document.querySelector(".pomodoro-btn");
const shortBreakBtn = document.querySelector(".s-break-btn");
const longBreakBtn = document.querySelector(".l-break-btn");
const timerMsg = document.querySelector(".timer-msg");
const currentTaskDisplay = document.querySelector(".current-task-display");

renderTaskList();

let startingMins = 25;
let time = (startingMins * 60) - 1;
let timerRunning = false;
let intervalId = null;
let progress = 0;
let pomodoroIndex = 1;
let shortBreakIndex = 1;
timerElement.textContent = `${startingMins}:00`;
progressBar.style.width = `${progress}%`;
timerMsg.textContent = `Time to focus #${pomodoroIndex}`;

function initializeTimer(mins) {
  timerRunning = false;
  clearInterval(intervalId);
  startingMins = mins;
  time = (startingMins * 60) - 1;
  progress = 0;
  if (mins < 10) {
    timerElement.textContent = `0${startingMins}:00`;
  } else {
    timerElement.textContent = `${startingMins}:00`;
  }
  progressBar.style.width = `${progress}%`;
  startTimerBtn.style.display = "block";
  pauseTimerBtn.style.display = "none";
  displayTimerMsg(mins);
}

function displayTimerMsg(mins) {
  switch (true) {
    case (mins === 25):
      timerMsg.textContent = `Time to focus #${pomodoroIndex}`;
      break;
    case (mins === 5):
      timerMsg.textContent = `Time for a short break #${shortBreakIndex}`;
      break;
    case (mins === 15):
      timerMsg.textContent = "Time for a long break";
      break;
  }
}

pomodoroBtn.classList.add("active");

function deactivatePrevSelection(type) {
  switch (type) {
    case "pomodoro":
      if (shortBreakBtn.classList.contains("active")) {
        shortBreakBtn.classList.remove("active");
      } 
      else if (longBreakBtn.classList.contains("active")) {
        longBreakBtn.classList.remove("active");
      }
      break;
    case "s-break":
      if (pomodoroBtn.classList.contains("active")) {
        pomodoroBtn.classList.remove("active");
      } 
      else if (longBreakBtn.classList.contains("active")) {
        longBreakBtn.classList.remove("active");
      }
      break;
    case "l-break":
      if (shortBreakBtn.classList.contains("active")) {
        shortBreakBtn.classList.remove("active");
      } 
      else if (pomodoroBtn.classList.contains("active")) {
        pomodoroBtn.classList.remove("active");
      }
      break;
  }
}

pomodoroBtn.addEventListener("click", () => {
  deactivatePrevSelection("pomodoro");
  initializeTimer(25);
  pomodoroBtn.classList.add("active");
});
shortBreakBtn.addEventListener("click", () => {
  deactivatePrevSelection("s-break");
  initializeTimer(5);
  shortBreakBtn.classList.add("active");
});
longBreakBtn.addEventListener("click", () => {
  deactivatePrevSelection("l-break");
  initializeTimer(15);
  longBreakBtn.classList.add("active");
});

function timerEnds() {
  timerRunning = false;

  if (startingMins === 25) { // Was a pomodoro timer
    if (pomodoroIndex <= 3) { // First 3 pomos followed by a short break
      shortBreakBtn.classList.add("active");
      updatePomodoroProgress();
      deactivatePrevSelection("s-break");
      initializeTimer(5);
      pomodoroIndex++;
    } else { // 4th pomo followed by a long break; process then resets
      longBreakBtn.classList.add("active");
      deactivatePrevSelection("l-break");
      initializeTimer(15);
      pomodoroIndex = 1;
      shortBreakIndex = 1;
    }
  } else if (startingMins === 5) {
    pomodoroBtn.classList.add("active");
    deactivatePrevSelection("pomodoro");
    initializeTimer(25);
    shortBreakIndex++;
  } else if (startingMins === 15) {
    pomodoroBtn.classList.add("active");
    deactivatePrevSelection("pomodoro");
    initializeTimer(25);
  }
}

function updatePomodoroProgress() {
  taskList.forEach((task, index) => {
    if (task.isCurrent) {
      if (task.actPomos < task.estPomos) {
        task.actPomos++;
        currentTask.actPomos = task.actPomos;

        if (task.actPomos === task.estPomos) {
          completeTask(task, index);
        }

        renderTaskList();
        saveToStorage();
      } 
    }
  });
}

function runTimer() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  const progressIncrement = (100 / (startingMins * 60));

  progress += progressIncrement;
  if (progress > 100) {
    progress = 100;
  }

  seconds = seconds < 10 ? '0' + seconds : seconds;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  timerElement.textContent = `${minutes}:${seconds}`;
  progressBar.style.width = `${progress}%`;
  time--;

  if (time < 0) {
    timerEnds();
  }
}

startTimerBtn.addEventListener('click', () => {
  intervalId = setInterval(runTimer, 1000);
  timerRunning = true;
  startTimerBtn.style.display = "none";
  pauseTimerBtn.style.display = "block";
});

pauseTimerBtn.addEventListener('click', () => {
  clearInterval(intervalId);
  timerRunning = false;
  startTimerBtn.style.display = "block";
  pauseTimerBtn.style.display = "none";
});
