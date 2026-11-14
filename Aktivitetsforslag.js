
const savedChoice = sessionStorage.getItem("skarmpaus-val");

let choice = {
  duration: "15",
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

const activities = [
  {
    title: "Ta en liten promenad",
    description: "Lämna mobilen och upptäck något fint i din omgivning.",
    place: "ute",
    company: "ensam"
  },
  {
    title: "Njut av frisk luft tillsammans",
    description: "Ta en promenad och prata med någon du tycker om.",
    place: "ute",
    company: "tillsammans"
  },
  {
    title: "Läs några sidor",
    description: "Lägg undan mobilen och försvinn in i en bok.",
    place: "inne",
    company: "ensam"
  },
  {
    title: "Ta en lugn fikastund",
    description: "Sätt er tillsammans och prata utan skärmar.",
    place: "inne",
    company: "tillsammans"
  },
  {
    title: "Gör några enkla stretchövningar",
    description: "Sträck på kroppen och slappna av en stund.",
    place: "inne",
    company: "ensam"
  },
  {
    title: "Utforska naturen",
    description: "Gå ut och lägg märke till ljuden och färgerna omkring dig.",
    place: "ute",
    company: "ensam"
  }
];

const titleEl = document.getElementById("activity-title");
const descriptionEl = document.getElementById("activity-description");
const summaryEl = document.getElementById("choice-summary");


if (choice.customSeconds !== null &&
    Number.isInteger(choice.customSeconds) &&
    choice.customSeconds > 0) {

  const minutes = Math.floor(choice.customSeconds / 60);
  const seconds = choice.customSeconds % 60;

  summaryEl.textContent =
    `Din paus: ${minutes} min ${seconds} sek`;

} else {
  summaryEl.textContent =
    `Din paus: ${choice.duration} minuter`;
}


const matchingActivities = activities.filter(activity =>
  activity.place === choice.place &&
  activity.company === choice.company
);

const suggestions = matchingActivities.length
  ? matchingActivities
  : activities;

let currentIndex = -1;

function showActivity() {
  if (suggestions.length === 1) {
    currentIndex = 0;
  } else {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * suggestions.length);
    } while (nextIndex === currentIndex);
    currentIndex = nextIndex;
  }

  const activity = suggestions[currentIndex];
  titleEl.textContent = activity.title;
  descriptionEl.textContent = activity.description;
}


document.getElementById("start-break").addEventListener("click", () => {
    sessionStorage.setItem(
      "skarmpaus-aktivitet",
      JSON.stringify(suggestions[currentIndex])
    );
  
    window.location.href = "pausklocka.html";
  });
  
  showActivity();
  
