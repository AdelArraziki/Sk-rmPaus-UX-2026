
const savedChoice = sessionStorage.getItem("skarmpaus-val");
const savedActivity = sessionStorage.getItem("skarmpaus-aktivitet");

const aktivFunktionKey = "skarmfrid-aktiv-funktion";

let minutes = 30;
let customDurationSeconds = null;

// Läs vald paustid
if (savedChoice) {
  try {
    const choice = JSON.parse(savedChoice);
    const selectedMinutes = Number(choice.duration);

    if ([15, 30, 60, 120].includes(selectedMinutes)) {
      minutes = selectedMinutes;
    }

    const customSeconds = Number(choice.customSeconds);

    if (
      choice.customSeconds != null &&
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

// Hämta element
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("timer-status");
const headingEl = document.getElementById("timer-heading");
const pauseButton = document.getElementById("pause-button");
const stopButton = document.getElementById("stop-button");
const activityEl = document.getElementById("activity-name");
const progressRing = document.getElementById("progress-ring");

// Visa vald aktivitet
if (savedActivity && activityEl) {
  try {
    const activity = JSON.parse(savedActivity);

    if (activity.title) {
      activityEl.textContent = activity.title;
    }
  } catch (error) {
    console.warn("Kunde inte läsa aktiviteten.");
  }
}

// Inställningar för pausklockan
let remainingSeconds = customDurationSeconds ?? minutes * 60;
const totalSeconds = remainingSeconds;
const circumference = 2 * Math.PI * 100;

let isPaused = false;
let isFinished = false;
let endTime = Date.now() + remainingSeconds * 1000;
let timerInterval = null;

// Kontrollera om Påminnelse redan är aktiv
const annanFunktionAktiv =
  localStorage.getItem(aktivFunktionKey) === "paminnelse";

if (annanFunktionAktiv) {
  isPaused = true;

  if (pauseButton) {
    pauseButton.disabled = true;
  }

  if (statusEl) {
    statusEl.textContent =
      "Stoppa påminnelsen innan du startar Skärmpaus.";
  }
} else {
  // Markera Skärmpaus som aktiv
  localStorage.setItem(
    aktivFunktionKey,
    "skarmPaus"
  );
}

// Formatera tiden
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

// Uppdatera klockan
function updateDisplay() {
  if (timerEl) {
    timerEl.textContent = formatTime(remainingSeconds);
  }

  if (progressRing) {
    const progress = totalSeconds > 0
      ? remainingSeconds / totalSeconds
      : 0;

    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset =
      circumference * (1 - progress);
  }
}

// Lås upp funktionerna
function frigoraSkarmPaus() {
  if (
    localStorage.getItem(aktivFunktionKey) === "skarmPaus"
  ) {
    localStorage.removeItem(aktivFunktionKey);
  }
}

// Spara genomförd paus
function sparaStatistik() {
  const genomfordaSekunder = Math.max(
    0,
    totalSeconds - remainingSeconds
  );

  // Registrera endast om någon tid har gått
  if (genomfordaSekunder === 0) return;

  try {
    const statistik = JSON.parse(
      localStorage.getItem("skarmPausStatistik") || "[]"
    );

    statistik.push({
      datum: new Date().toISOString(),
      minuter: genomfordaSekunder / 60
    });

    localStorage.setItem(
      "skarmPausStatistik",
      JSON.stringify(statistik)
    );
  } catch (error) {
    console.error("Kunde inte spara statistik:", error);
  }
}

// Avsluta pausen
function finishPause() {
  if (isFinished) return;

  isFinished = true;

  clearInterval(timerInterval);

  sparaStatistik();
  frigoraSkarmPaus();

  remainingSeconds = 0;
  updateDisplay();

  if (headingEl) {
    headingEl.textContent = "Bra gjort!";
  }

  if (statusEl) {
    statusEl.textContent = "Din skärmpaus är klar.";
  }

  if (pauseButton) {
    pauseButton.disabled = true;
    pauseButton.hidden = true;
  }

  if (stopButton) {
    stopButton.textContent = "Till startsidan";
  }
}

// Nedräkning
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

// Pausa eller fortsätt
if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    if (isFinished || annanFunktionAktiv) return;

    if (isPaused) {
      endTime = Date.now() + remainingSeconds * 1000;
      isPaused = false;

      pauseButton.textContent = "Pausa";

      if (statusEl) {
        statusEl.textContent = "Din paus fortsätter.";
      }
    } else {
      tick();
      isPaused = true;

      pauseButton.textContent = "Fortsätt";

      if (statusEl) {
        statusEl.textContent = "Pausklockan är pausad.";
      }
    }
  });
}

// Avsluta och gå till startsidan
if (stopButton) {
  stopButton.addEventListener("click", () => {
    if (!isFinished) {
      if (!isPaused) {
        tick();
      }

      finishPause();
    }

    window.location.href = "index.html";
  });
}

// Starta nedräkningen
updateDisplay();

if (!annanFunktionAktiv) {
  timerInterval = setInterval(tick, 250);
}

// Visa användarnamn
function visaAnvandarnamn() {
  try {
    const sparad = localStorage.getItem("skarmPausProfil");
    if (!sparad) return;

    const profil = JSON.parse(sparad);
    const namn = (
      profil.smeknamn ||
      profil.namn ||
      ""
    ).trim();

    const halsning =
      document.getElementById("user-greeting");

    if (namn && halsning) {
      halsning.textContent = `Hej ${namn}! 👋`;
      halsning.hidden = false;
    }
  } catch (error) {
    console.error("Kunde inte visa namnet:", error);
  }
}

visaAnvandarnamn();
