
const savedChoice = sessionStorage.getItem("skarmpaus-val");

let choice = {
  duration: "30",
  customSeconds: null,
  place: "inne",
  company: "ensam"
};

if (savedChoice) {
  try {
    choice = { ...choice, ...JSON.parse(savedChoice) };
  } catch (error) {
    console.warn("Kunde inte läsa sparade val.");
  }
}

// Aktiviteter

const activities = [
  // INNE + ENSAM
  { title: "📖 Läs några sidor", description: "Koppla av med en bok.", place: "inne", company: "ensam" },
  { title: "🧘 Gör stretchövningar", description: "Mjuka upp kroppen.", place: "inne", company: "ensam" },
  { title: "🎨 Rita eller måla", description: "Skapa något kreativt.", place: "inne", company: "ensam" },
  { title: "☕ Njut av en kopp te", description: "Ta en lugn stund.", place: "inne", company: "ensam" },
  { title: "🎵 Lyssna på musik", description: "Koppla av med musik.", place: "inne", company: "ensam" },
  { title: "✍️ Skriv dagbok", description: "Skriv ner dina tankar.", place: "inne", company: "ensam" },
  { title: "🧩 Lägg ett pussel", description: "Utmana hjärnan utan skärm.", place: "inne", company: "ensam" },
  { title: "🌿 Andningsövning", description: "Andas lugnt en stund.", place: "inne", company: "ensam" },
  { title: "🪴 Ordna en liten yta", description: "Gör fint omkring dig.", place: "inne", company: "ensam" },
  { title: "🥗 Gör ett mellanmål", description: "Förbered något gott.", place: "inne", company: "ensam" },

  // INNE + TILLSAMMANS
  { title: "☕ Fika tillsammans", description: "Prata utan mobiler.", place: "inne", company: "tillsammans" },
  { title: "🎲 Spela sällskapsspel", description: "Ha roligt tillsammans.", place: "inne", company: "tillsammans" },
  { title: "🥗 Laga något gott", description: "Laga mat tillsammans.", place: "inne", company: "tillsammans" },
  { title: "🧩 Lägg ett pussel", description: "Samarbeta kring ett pussel.", place: "inne", company: "tillsammans" },
  { title: "🎨 Måla tillsammans", description: "Skapa något kreativt.", place: "inne", company: "tillsammans" },
  { title: "💬 Prata om dagen", description: "Dela dagens upplevelser.", place: "inne", company: "tillsammans" },
  { title: "🎵 Lyssna på musik", description: "Njut av musik tillsammans.", place: "inne", company: "tillsammans" },
  { title: "📖 Läs högt", description: "Läs en berättelse tillsammans.", place: "inne", company: "tillsammans" },
  { title: "🃏 Spela kort", description: "Spela ett enkelt kortspel.", place: "inne", company: "tillsammans" },
  { title: "🧁 Baka tillsammans", description: "Gör något gott i köket.", place: "inne", company: "tillsammans" },

  // UTE + ENSAM
  { title: "🚶 Ta en promenad", description: "Upptäck din omgivning.", place: "ute", company: "ensam" },
  { title: "🌿 Utforska naturen", description: "Upptäck naturens detaljer.", place: "ute", company: "ensam" },
  { title: "🌤️ Sitt på en bänk", description: "Njut av frisk luft.", place: "ute", company: "ensam" },
  { title: "🚲 Ta en cykeltur", description: "Rör på dig utomhus.", place: "ute", company: "ensam" },
  { title: "🌳 Besök en park", description: "Ta en stund bland träden.", place: "ute", company: "ensam" },
  { title: "👀 Upptäck detaljer", description: "Hitta tre vackra saker.", place: "ute", company: "ensam" },
  { title: "🌅 Se på himlen", description: "Stanna upp och njut.", place: "ute", company: "ensam" },
  { title: "🏃 Ta en lätt joggingtur", description: "Rör på dig i egen takt.", place: "ute", company: "ensam" },
  { title: "🪴 Sköt om växter", description: "Ta hand om växter utomhus.", place: "ute", company: "ensam" },
  { title: "🧘 Koppla av utomhus", description: "Sitt stilla och andas lugnt.", place: "ute", company: "ensam" },

  // UTE + TILLSAMMANS
  { title: "🚶 Promenera tillsammans", description: "Prata under promenaden.", place: "ute", company: "tillsammans" },
  { title: "☕ Fika utomhus", description: "Njut av en trevlig fikastund.", place: "ute", company: "tillsammans" },
  { title: "⚽ Spela boll", description: "Rör på er tillsammans.", place: "ute", company: "tillsammans" },
  { title: "🌳 Besök en park", description: "Upptäck en grön plats.", place: "ute", company: "tillsammans" },
  { title: "🧭 Gör en liten utflykt", description: "Upptäck en plats i närheten.", place: "ute", company: "tillsammans" },
  { title: "🌿 Njut av naturen", description: "Lyssna på naturens ljud.", place: "ute", company: "tillsammans" },
  { title: "🚲 Cykla tillsammans", description: "Ta en lugn cykeltur.", place: "ute", company: "tillsammans" },
  { title: "🧺 Ha en liten picknick", description: "Ät något gott utomhus.", place: "ute", company: "tillsammans" },
  { title: "🏸 Spela badminton", description: "Ha roligt och rör på er.", place: "ute", company: "tillsammans" },
  { title: "🌅 Titta på solnedgången", description: "Njut av en lugn stund.", place: "ute", company: "tillsammans" }
];


const titleEl = document.getElementById("activity-title");
const descriptionEl = document.getElementById("activity-description");
const summaryEl = document.getElementById("choice-summary");
const activitySelect = document.getElementById("activity-select");
const startButton = document.getElementById("start-break");

// Visa paustid
const customSeconds = Number(choice.customSeconds);

if (
  choice.customSeconds != null &&
  Number.isInteger(customSeconds) &&
  customSeconds > 0
) {
  const minutes = Math.floor(customSeconds / 60);
  const seconds = customSeconds % 60;

  summaryEl.textContent =
    `Din paus: ${minutes} min ${seconds} sek`;
} else {
  summaryEl.textContent =
    `Din paus: ${choice.duration} minuter`;
}

// Filtrera aktiviteter efter användarens val
const matchingActivities = activities.filter(activity =>
  activity.place === choice.place &&
  activity.company === choice.company
);

const suggestions = matchingActivities.length
  ? matchingActivities
  : activities;

let currentIndex = 0;

// Lägg aktiviteterna i rullistan
suggestions.forEach((activity, index) => {
  const option = document.createElement("option");

  option.value = index;
  option.textContent = activity.title;

  activitySelect.appendChild(option);
});

// Visa vald aktivitet
function showActivity(index) {
  currentIndex = index;

  const activity = suggestions[currentIndex];

  titleEl.textContent = activity.title;
  descriptionEl.textContent = activity.description;
}

// Visa första aktivitetsförslaget
showActivity(0);

// Välj en annan aktivitet
activitySelect.addEventListener("change", () => {
  const index = Number(activitySelect.value);
  showActivity(index);
});

// Starta pausen
startButton.addEventListener("click", () => {
  const selectedActivity = suggestions[currentIndex];

  sessionStorage.setItem(
    "skarmpaus-aktivitet",
    JSON.stringify(selectedActivity)
  );

  window.location.href = "pausklocka.html";
});

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

    const halsning = document.getElementById("user-greeting");

    if (namn && halsning) {
      halsning.textContent = `Hej ${namn}! 👋`;
      halsning.hidden = false;
    }
  } catch (error) {
    console.error("Kunde inte visa namnet:", error);
  }
}

visaAnvandarnamn();
