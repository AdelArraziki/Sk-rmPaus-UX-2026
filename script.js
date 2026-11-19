
const form = document.querySelector("#pause-form");
const statusEl = document.querySelector("#form-status");
const storageKey = "skarmpaus-val";

const durationSelect = document.getElementById("pause-duration");
const customTimeBox = document.getElementById("pause-custom-time");
const customMinutesInput = document.getElementById("custom-minutes");
const customSecondsInput = document.getElementById("custom-seconds");

// Gemensamma nycklar för Påminnelse och Skärmpaus
const aktivFunktionKey = "skarmfrid-aktiv-funktion";
const paminnelseSlutKey = "skarmfrid-paminnelse-sluttid";

const labels = {
  duration: {
    15: "15 minuter",
    30: "30 minuter",
    60: "1 timme",
    120: "2 timmar"
  },
  place: {
    inne: "inne",
    ute: "ute"
  },
  company: {
    ensam: "ensam",
    tillsammans: "tillsammans"
  }
};

// Visa minuter och sekunder endast vid Valfri tid
function updateCustomTime() {
  if (!durationSelect || !customTimeBox) return;

  const isCustom = durationSelect.value === "custom";

  customTimeBox.hidden = !isCustom;
  customTimeBox.classList.toggle("is-visible", isCustom);

  if (!isCustom) {
    if (customMinutesInput) customMinutesInput.value = "";
    if (customSecondsInput) customSecondsInput.value = "";
  }
}

// Läs användarens val
function readChoice() {
  const data = new FormData(form);
  const isCustom = durationSelect.value === "custom";

  let duration = Number(durationSelect.value);
  let customSeconds = null;

  if (isCustom) {
    const minutes = Number(customMinutesInput.value || 0);
    const seconds = Number(customSecondsInput.value || 0);

    if (
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      minutes < 0 ||
      minutes > 120 ||
      seconds < 0 ||
      seconds > 59 ||
      minutes * 60 + seconds === 0
    ) {
      throw new Error(
        "Ange en giltig paustid mellan 1 sekund och 120 minuter."
      );
    }

    customSeconds = minutes * 60 + seconds;

    // Behåll standardvärde för övriga sidor
    duration = 30;
  }

  return {
    duration,
    customSeconds,
    place: data.get("place"),
    company: data.get("company")
  };
}

// Starta alltid med 30 minuter på startsidan
function setDefaultChoice() {
  if (!durationSelect) return;

  durationSelect.value = "30";

  if (customMinutesInput) customMinutesInput.value = "";
  if (customSecondsInput) customSecondsInput.value = "";

  updateCustomTime();
}

// Kontrollera om Påminnelse är aktiv
function paminnelseArAktiv() {
  const sparadSluttid = localStorage.getItem(paminnelseSlutKey);
  const slutTid = sparadSluttid === null
    ? 0
    : Number(sparadSluttid);

  return (
    localStorage.getItem(aktivFunktionKey) === "paminnelse" ||
    (Number.isFinite(slutTid) && slutTid > Date.now())
  );
}

// Uppdatera Skärmpaus-panelen
function uppdateraSkarmPausStatus() {
  if (!form) return;

  const arLast = paminnelseArAktiv();

  form.querySelectorAll("input, select, button").forEach((element) => {
    element.disabled = arLast;
  });

  if (statusEl) {
    statusEl.textContent = arLast
      ? "🔔 Stoppa påminnelsen innan du startar Skärmpaus."
      : "";
  }
}

// När användaren klickar på Ta en paus
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Tillåt inte Skärmpaus när Påminnelse är aktiv
    if (paminnelseArAktiv()) {
      if (statusEl) {
        statusEl.textContent =
          "🔔 Stoppa påminnelsen innan du startar Skärmpaus.";
      }

      uppdateraSkarmPausStatus();
      return;
    }

    try {
      const choice = readChoice();

      sessionStorage.setItem(
        storageKey,
        JSON.stringify(choice)
      );

      const timeLabel = choice.customSeconds !== null
        ? `${Math.floor(choice.customSeconds / 60)} min ${choice.customSeconds % 60} sek`
        : labels.duration[choice.duration];

      const placeLabel = labels.place[choice.place];
      const companyLabel = labels.company[choice.company];

      if (statusEl) {
        statusEl.textContent =
          `Valt: ${timeLabel}, ${placeLabel}, ${companyLabel}.`;
      }

      window.location.href = "Aktivitetsforslag.html";

    } catch (error) {
      if (statusEl) {
        statusEl.textContent = error.message;
      }
    }
  });
}

// Visa användarnamn från profilen
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

    const halsning = document.getElementById("user-greeting");

    if (namn && halsning) {
      halsning.textContent = `Hej ${namn}! 👋`;
      halsning.hidden = false;
    }

  } catch (error) {
    console.error("Kunde inte visa namnet:", error);
  }
}

// Initiera startsidan
if (durationSelect && customTimeBox) {
  durationSelect.addEventListener("change", updateCustomTime);
  setDefaultChoice();
}

uppdateraSkarmPausStatus();
visaAnvandarnamn();

// Uppdatera om status ändras i en annan flik
window.addEventListener("storage", (event) => {
  if (
    event.key === aktivFunktionKey ||
    event.key === paminnelseSlutKey
  ) {
    uppdateraSkarmPausStatus();
  }
});

// Kontrollera status när användaren återvänder till sidan
window.addEventListener("pageshow", () => {
  uppdateraSkarmPausStatus();
});
