const form = document.querySelector("#pause-form");
const statusEl = document.querySelector("#form-status");
const storageKey = "skarmpaus-val";

const labels = {
  duration: {
    15: "15 minuter",
    30: "30 minuter",
    60: "1 timme",
    120: "2 timmar",
  },
  place: {
    inne: "inne",
    ute: "ute",
  },
  company: {
    ensam: "ensam",
    tillsammans: "tillsammans",
  },
};


function readChoice() {
  const data = new FormData(form);

  const customMinutesEl = document.getElementById("custom-minutes");
  const customSecondsEl = document.getElementById("custom-seconds");

  const hasCustomTime =
    customMinutesEl.value !== "" ||
    customSecondsEl.value !== "";

  const customMinutes = Number(customMinutesEl.value || 0);
  const customSeconds = Number(customSecondsEl.value || 0);

  if (
    hasCustomTime &&
    (!Number.isInteger(customMinutes) ||
      !Number.isInteger(customSeconds) ||
      customMinutes < 0 ||
      customMinutes > 120 ||
      customSeconds < 0 ||
      customSeconds > 59 ||
      customMinutes * 60 + customSeconds === 0)
  ) {
    throw new Error("Ange en giltig paustid.");
  }

  return {
    duration: Number(data.get("duration")),
    customSeconds: hasCustomTime
      ? customMinutes * 60 + customSeconds
      : null,
    place: data.get("place"),
    company: data.get("company"),
  };
}


function restoreChoice() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (!saved) return;

    const duration = form.querySelector(`[name="duration"][value="${saved.duration}"]`);
    const place = form.querySelector(`[name="place"][value="${saved.place}"]`);
    const company = form.querySelector(`[name="company"][value="${saved.company}"]`);

    if (duration) duration.checked = true;
    if (place) place.checked = true;
    if (company) company.checked = true;
  } catch {
    sessionStorage.removeItem(storageKey);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const choice = readChoice();
  sessionStorage.setItem(storageKey, JSON.stringify(choice));

  
  const timeLabel = choice.customSeconds !== null
  ? `${Math.floor(choice.customSeconds / 60)} min ${choice.customSeconds % 60} sek`
  : labels.duration[choice.duration];
const placeLabel = labels.place[choice.place];
const companyLabel = labels.company[choice.company];

statusEl.textContent = `Valt: ${timeLabel}, ${placeLabel}, ${companyLabel}. Aktivitetsförslaget kommer i nästa steg.`;

window.location.href = "Aktivitetsforslag.html";
});

restoreChoice();

const durationRadios = document.querySelectorAll(
  'input[name="duration"]'
);

const customMinutesInput = document.getElementById("custom-minutes");
const customSecondsInput = document.getElementById("custom-seconds");

// När användaren skriver en egen tid:
// avmarkera snabbvalen.
function activateCustomTime() {
  if (
    customMinutesInput.value !== "" ||
    customSecondsInput.value !== ""
  ) {
    durationRadios.forEach(radio => {
      radio.checked = false;
    });
  }
}

customMinutesInput.addEventListener("input", activateCustomTime);
customSecondsInput.addEventListener("input", activateCustomTime);

// När användaren väljer ett snabbval:
// töm den anpassade tiden.
durationRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.checked) {
      customMinutesInput.value = "";
      customSecondsInput.value = "";
    }
  });
});

