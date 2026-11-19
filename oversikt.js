
const statistikKey = "skarmPausStatistik";

// Hämta sparade pauser
function hamtaStatistik() {
  try {
    const sparad = JSON.parse(
      localStorage.getItem(statistikKey) || "[]"
    );

    if (!Array.isArray(sparad)) return [];

    return sparad.filter(paus =>
      paus &&
      paus.datum &&
      !Number.isNaN(new Date(paus.datum).getTime())
    );
  } catch (error) {
    console.warn("Kunde inte läsa pausstatistiken.", error);
    return [];
  }
}

// Datum i lokal tid
function datumNyckel(datum) {
  const d = new Date(datum);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

// Antal minuter för en paus
function minuterForPaus(paus) {
  const minuter = Number(paus.minuter);

  return Number.isFinite(minuter)
    ? Math.max(0, minuter)
    : 0;
}

// ISO-veckonummer enligt svensk standard
function hamtaVeckonummer(datum) {
  const d = new Date(Date.UTC(
    datum.getFullYear(),
    datum.getMonth(),
    datum.getDate()
  ));

  d.setUTCDate(
    d.getUTCDate() + 4 - (d.getUTCDay() || 7)
  );

  const arStart = new Date(
    Date.UTC(d.getUTCFullYear(), 0, 1)
  );

  return Math.ceil(
    (((d - arStart) / 86400000) + 1) / 7
  );
}

// Läs statistik
const statistik = hamtaStatistik();

// Element
const chart = document.getElementById("weekly-chart");
const chartTitle = document.getElementById("chart-title");

const dayBtn = document.getElementById("day-btn");
const weekBtn = document.getElementById("week-btn");
const monthBtn = document.getElementById("month-btn");

const prevBtn = document.getElementById("prev-period");
const nextBtn = document.getElementById("next-period");

const statsPeriodTitle =
  document.getElementById("stats-period-title");

const totalPausesEl =
  document.getElementById("total-pauses");

const totalMinutesEl =
  document.getElementById("total-minutes");

const activeDaysEl =
  document.getElementById("active-days");

const streakDaysEl =
  document.getElementById("streak-days");

const periodPausesEl =
  document.getElementById("period-pauses");

const emptyMessage =
  document.getElementById("chart-empty");

let valdPeriod = "week";
let visatDatum = new Date();

// Beräkna antal dagar i följd
function beraknaDagarIFoljd() {
  const aktivaDagar = new Set(
    statistik.map(paus => datumNyckel(paus.datum))
  );

  let dagarIFoljd = 0;

  const dag = new Date();
  dag.setHours(12, 0, 0, 0);

  // Om ingen paus idag, börja från igår
  if (!aktivaDagar.has(datumNyckel(dag))) {
    dag.setDate(dag.getDate() - 1);
  }

  while (aktivaDagar.has(datumNyckel(dag))) {
    dagarIFoljd++;
    dag.setDate(dag.getDate() - 1);
  }

  return dagarIFoljd;
}

// Hämta statistik för en lista med datum
function hamtaPeriodStatistik(datumLista) {
  const valdaDatum = new Set(
    datumLista.map(datum => datumNyckel(datum))
  );

  const periodensPauser = statistik.filter(
    paus => valdaDatum.has(datumNyckel(paus.datum))
  );

  const periodensMinuter = periodensPauser.reduce(
    (summa, paus) => summa + minuterForPaus(paus),
    0
  );

  const aktivaDagar = new Set(
    periodensPauser.map(paus => datumNyckel(paus.datum))
  ).size;

  return {
    periodensPauser,
    periodensMinuter,
    aktivaDagar
  };
}

// Uppdatera statistikkorten
function uppdateraStatistik(datumLista) {
  const resultat = hamtaPeriodStatistik(datumLista);

  totalPausesEl.textContent =
    resultat.periodensPauser.length;

  totalMinutesEl.textContent =
    Number(
      resultat.periodensMinuter.toFixed(1)
    ).toLocaleString("sv-SE");

  activeDaysEl.textContent =
    resultat.aktivaDagar;

  // Visar aktuell pausserie
  streakDaysEl.textContent =
    beraknaDagarIFoljd();

  if (periodPausesEl) {
    periodPausesEl.textContent =
      resultat.periodensPauser.length;
  }

  if (emptyMessage) {
    emptyMessage.hidden =
      resultat.periodensPauser.length > 0;
  }
}

// Pausminuter på ett visst datum
function minuterPaDatum(datum) {
  const nyckel = datumNyckel(datum);

  return statistik
    .filter(
      paus => datumNyckel(paus.datum) === nyckel
    )
    .reduce(
      (summa, paus) => summa + minuterForPaus(paus),
      0
    );
}

// Skapa diagram för vecka och månad
function skapaStaplar(datumLista, etiketter) {
  chart.innerHTML = "";

  const minuterPerDag =
    datumLista.map(minuterPaDatum);

  const maxMinuter =
    Math.max(1, ...minuterPerDag);

  minuterPerDag.forEach((minuter, index) => {
    const kolumn = document.createElement("div");
    kolumn.className = "day";

    const stapel = document.createElement("div");
    stapel.className = "bar";

    const hojd = minuter > 0
      ? Math.max(5, minuter / maxMinuter * 100)
      : 0;

    stapel.style.height = `${hojd}%`;

    stapel.title =
      `${Number(minuter.toFixed(1)).toLocaleString("sv-SE")} pausminuter`;

    const etikett = document.createElement("span");
    etikett.className = "day-label";
    etikett.textContent = etiketter[index];

    kolumn.append(stapel, etikett);
    chart.appendChild(kolumn);
  });
}

// Visa vald period
function visaPeriod(period) {
  valdPeriod = period;

  // En enda rubrik ovanför statistiken
  if (statsPeriodTitle) {
    statsPeriodTitle.textContent = "Din statistik";
  }

  // Markera rätt knapp
  dayBtn.classList.toggle("active", period === "day");
  weekBtn.classList.toggle("active", period === "week");
  monthBtn.classList.toggle("active", period === "month");

  dayBtn.setAttribute(
    "aria-pressed",
    String(period === "day")
  );

  weekBtn.setAttribute(
    "aria-pressed",
    String(period === "week")
  );

  monthBtn.setAttribute(
    "aria-pressed",
    String(period === "month")
  );

  chart.classList.toggle(
    "day-view",
    period === "day"
  );

  chart.classList.toggle(
    "month-view",
    period === "month"
  );

  // DAG
  if (period === "day") {
    chartTitle.textContent =
      visatDatum.toLocaleDateString("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });

    const datumLista = [new Date(visatDatum)];

    chart.innerHTML = "";
    uppdateraStatistik(datumLista);

    return;
  }

  // VECKA
  if (period === "week") {
    const start = new Date(visatDatum);
    start.setHours(12, 0, 0, 0);

    const veckodag = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - veckodag);

    const datumLista = [];
    const etiketter = [
      "Mån", "Tis", "Ons", "Tor",
      "Fre", "Lör", "Sön"
    ];

    for (let i = 0; i < 7; i++) {
      const datum = new Date(start);
      datum.setDate(start.getDate() + i);
      datumLista.push(datum);
    }

    chartTitle.textContent =
      `Vecka ${hamtaVeckonummer(visatDatum)}`;

    skapaStaplar(datumLista, etiketter);
    uppdateraStatistik(datumLista);

    return;
  }

  // MÅNAD
  const ar = visatDatum.getFullYear();
  const manad = visatDatum.getMonth();

  chartTitle.textContent =
    visatDatum.toLocaleDateString("sv-SE", {
      month: "long",
      year: "numeric"
    });

  const antalDagar =
    new Date(ar, manad + 1, 0).getDate();

  const datumLista = [];
  const etiketter = [];

  for (let dag = 1; dag <= antalDagar; dag++) {
    datumLista.push(
      new Date(ar, manad, dag, 12)
    );

    etiketter.push(String(dag));
  }

  skapaStaplar(datumLista, etiketter);
  uppdateraStatistik(datumLista);
}

// Knappar för Dag, Vecka och Månad
dayBtn.addEventListener("click", () => {
  visatDatum = new Date();
  visaPeriod("day");
});

weekBtn.addEventListener("click", () => {
  visatDatum = new Date();
  visaPeriod("week");
});

monthBtn.addEventListener("click", () => {
  visatDatum = new Date();
  visaPeriod("month");
});

// Föregående period
prevBtn.addEventListener("click", () => {
  if (valdPeriod === "day") {
    visatDatum.setDate(visatDatum.getDate() - 1);
  } else if (valdPeriod === "week") {
    visatDatum.setDate(visatDatum.getDate() - 7);
  } else {
    visatDatum.setDate(1);
    visatDatum.setMonth(visatDatum.getMonth() - 1);
  }

  visaPeriod(valdPeriod);
});

// Nästa period
nextBtn.addEventListener("click", () => {
  if (valdPeriod === "day") {
    visatDatum.setDate(visatDatum.getDate() + 1);
  } else if (valdPeriod === "week") {
    visatDatum.setDate(visatDatum.getDate() + 7);
  } else {
    visatDatum.setDate(1);
    visatDatum.setMonth(visatDatum.getMonth() + 1);
  }

  visaPeriod(valdPeriod);
});

// Visa användarnamn från profilen
function visaAnvandarnamn() {
  try {
    const sparad =
      localStorage.getItem("skarmPausProfil");

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
    console.error(
      "Kunde inte visa namnet:",
      error
    );
  }
}

// Starta översikten
visaPeriod("week");
visaAnvandarnamn();
