

const savedChoice = sessionStorage.getItem("skarmpaus-val");
const savedActivity = sessionStorage.getItem("skarmpaus-aktivitet");

let minutes = 15;
let customDurationSeconds = null;

if (savedChoice) {
  try {
    const choice = JSON.parse(savedChoice);

    const selectedMinutes = Number(choice.duration);

    if ([15, 30, 60, 120].includes(selectedMinutes)) {
      minutes = selectedMinutes;
    }

    const customSeconds = Number(choice.customSeconds);

    if (
      choice.customSeconds !== null &&
      choice.customSeconds !== undefined &&
      Number.isInteger(customSeconds) &&
      customSeconds > 0 &&
      customSeconds <= 7200
    ) {
      customDurationSeconds = customSeconds;
    }
  } catch (error) {
    console.warn("Kunde inte läsa paustiden.", error);
  }
}



if (savedChoice) {
    try {
      const choice = JSON.parse(savedChoice);
  
      const selectedMinutes = Number(choice.duration);
  
      if ([15, 30, 60, 120].includes(selectedMinutes)) {
        minutes = selectedMinutes;
      }
  
      if (
        Number.isInteger(choice.customSeconds) &&
        choice.customSeconds > 0 &&
        choice.customSeconds <= 7200
      ) {
        customDurationSeconds = choice.customSeconds;
      }
  
    } catch (error) {
      console.warn("Kunde inte läsa paustiden.", error);
    }
  }
  

const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("timer-status");
const headingEl = document.getElementById("timer-heading");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
const activityEl = document.getElementById("activity-name");

if (savedActivity) {
  try {
    const activity = JSON.parse(savedActivity);
    if (activity.title) {
      activityEl.textContent = activity.title;
    }
  } catch (error) {
    console.warn("Kunde inte läsa aktiviteten.");
  }
}

let remainingSeconds = customDurationSeconds ?? minutes * 60;
const totalSeconds = remainingSeconds;
const progressRing = document.getElementById("progress-ring");
const circumference = 2 * Math.PI * 100;
let isPaused = false;
let isFinished = false;
let endTime = Date.now() + remainingSeconds * 1000;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}


function updateDisplay() {
    timerEl.textContent = formatTime(remainingSeconds);
  
    const progress = remainingSeconds / totalSeconds;
  
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset =
      circumference * (1 - progress);
  }
  

function finishPause() {
  isFinished = true;
  remainingSeconds = 0;
  updateDisplay();

  headingEl.textContent = "Bra gjort!";
  statusEl.textContent = "Din skärmpaus är klar.";
  pauseButton.disabled = true;
  pauseButton.hidden = true;
  stopButton.textContent = "Till startsidan";
}

function tick() {
  if (isPaused || isFinished) return;

  remainingSeconds = Math.max(
    0,
    Math.ceil((endTime - Date.now()) / 1000)
  );

  updateDisplay();

  if (remainingSeconds === 0) {
    finishPause();
  }
}

pauseButton.addEventListener("click", () => {
  if (isFinished) return;

  if (isPaused) {
    endTime = Date.now() + remainingSeconds * 1000;
    isPaused = false;
    pauseButton.textContent = "Pausa";
    statusEl.textContent = "Din paus fortsätter.";
  } else {
    tick();
    isPaused = true;
    pauseButton.textContent = "Fortsätt";
    statusEl.textContent = "Pausklockan är pausad.";
  }
});

stopButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

updateDisplay();
setInterval(tick, 250);
