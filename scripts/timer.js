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

const POMODORO_TIME = 25;
const SHORT_BREAK_TIME = 5;
const LONG_BREAK_TIME = 15;

const timerState = {
  currTimeSelection: "pomodoro", // default to pomodoro
  pomodoroIndex: 1, // to track the number of pomodoros completed
  shortBreakIndex: 1, // to track the number of short breaks taken
  timerRunning: false, // to check if the timer is running
  progress: 0, // to track the progress of the timer
  intervalId: null, // to store the interval ID for the timer
}

renderTaskList();

let startingMins = POMODORO_TIME;
let time = (startingMins * 60) - 1;

if (startingMins < 10) {
  timerElement.textContent = `0${startingMins}:00`;
} else {
  timerElement.textContent = `${startingMins}:00`;
}

progressBar.style.width = `${timerState.progress}%`;
timerMsg.textContent = `Time to focus #${timerState.pomodoroIndex}`;

function initializeTimer(mins) {
  timerState.timerRunning = false;
  clearInterval(timerState.intervalId);
  startingMins = mins;
  time = (startingMins * 60) - 1;
  timerState.progress = 0;
  if (mins < 10) {
    timerElement.textContent = `0${startingMins}:00`;
  } else {
    timerElement.textContent = `${startingMins}:00`;
  }
  progressBar.style.width = `${timerState.progress}%`;
  startTimerBtn.style.display = "block";
  pauseTimerBtn.style.display = "none";
  displayTimerMsg();
}

function displayTimerMsg() {
  switch (timerState.currTimeSelection) {
    case 'pomodoro':
      timerMsg.textContent = `Time to focus #${timerState.pomodoroIndex}`;
      break;
    case 's-break':
      timerMsg.textContent = `Time for a short break #${timerState.shortBreakIndex}`;
      break;
    case 'l-break':
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
  timerState.currTimeSelection = "pomodoro";
  deactivatePrevSelection(timerState.currTimeSelection);
  initializeTimer(POMODORO_TIME);
  pomodoroBtn.classList.add("active");
});
shortBreakBtn.addEventListener("click", () => {
  timerState.currTimeSelection = "s-break";
  deactivatePrevSelection(timerState.currTimeSelection);
  initializeTimer(SHORT_BREAK_TIME);
  shortBreakBtn.classList.add("active");
});
longBreakBtn.addEventListener("click", () => {
  timerState.currTimeSelection = "l-break";
  deactivatePrevSelection(timerState.currTimeSelection);
  initializeTimer(LONG_BREAK_TIME);
  longBreakBtn.classList.add("active");
});

function timerEnds() {
  timerState.timerRunning = false;

  if (timerState.currTimeSelection === 'pomodoro') { // Was a pomodoro timer

    if (timerState.pomodoroIndex <= 3) { // First 3 pomos followed by a short break

      timerState.currTimeSelection = "s-break";
      shortBreakBtn.classList.add("active");
      updatePomodoroProgress();
      deactivatePrevSelection(timerState.currTimeSelection);
      initializeTimer(SHORT_BREAK_TIME);
      timerState.pomodoroIndex++;

    } else { // 4th pomo followed by a long break; process then resets

      timerState.currTimeSelection = "l-break";
      longBreakBtn.classList.add("active");
      updatePomodoroProgress();
      deactivatePrevSelection(timerState.currTimeSelection);
      initializeTimer(LONG_BREAK_TIME);
      timerState.pomodoroIndex = 1;
      timerState.shortBreakIndex = 1;

    }

  } else if (timerState.currTimeSelection === 's-break') { // Was a short break timer

    timerState.currTimeSelection = "pomodoro";
    pomodoroBtn.classList.add("active");
    deactivatePrevSelection(timerState.currTimeSelection);
    initializeTimer(POMODORO_TIME);
    timerState.shortBreakIndex++;

  } else if (timerState.currTimeSelection === 'l-break') { // Was a long break timer

    timerState.currTimeSelection = "pomodoro";
    pomodoroBtn.classList.add("active");
    deactivatePrevSelection(timerState.currTimeSelection);
    initializeTimer(POMODORO_TIME);

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

  timerState.progress += progressIncrement;
  if (timerState.progress > 100) {
    timerState.progress = 100;
  }

  seconds = seconds < 10 ? '0' + seconds : seconds;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  timerElement.textContent = `${minutes}:${seconds}`;
  progressBar.style.width = `${timerState.progress}%`;
  time--;

  if (time < 0) {
    timerEnds();
  }
}

startTimerBtn.addEventListener('click', () => {
  timerState.intervalId = setInterval(runTimer, 1000);
  timerState.timerRunning = true;
  startTimerBtn.style.display = "none";
  pauseTimerBtn.style.display = "block";
});

pauseTimerBtn.addEventListener('click', () => {
  clearInterval(timerState.intervalId);
  timerState.timerRunning = false;
  startTimerBtn.style.display = "block";
  pauseTimerBtn.style.display = "none";
});
