const statistik = JSON.parse(
    localStorage.getItem("skarmPausStatistik") || "[]"
  );
  
  // Datum i lokal tid
  function datumNyckel(datum) {
    const d = new Date(datum);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  
  const idag = datumNyckel(new Date());
  
  // Totalt antal genomförda pauser
  const antalPauser = statistik.length;
  
  // Totala pausminuter
  const pausminuter = statistik.reduce(
    (summa, paus) => summa + paus.minuter, 0
  );
  
  // Pauser idag
  const pauserIdag = statistik.filter(
    paus => datumNyckel(paus.datum) === idag
  ).length;
  
  // Dagar i följd
  const aktivaDagar = new Set(
    statistik.map(paus => datumNyckel(paus.datum))
  );
  
  let dagarIFoljd = 0;
  const dag = new Date();
  dag.setHours(12, 0, 0, 0);
  
  if (!aktivaDagar.has(datumNyckel(dag))) {
    dag.setDate(dag.getDate() - 1);
  }
  
  while (aktivaDagar.has(datumNyckel(dag))) {
    dagarIFoljd++;
    dag.setDate(dag.getDate() - 1);
  }
  
  // Visa statistiken
  document.getElementById("total-pauses").textContent = antalPauser;
  document.getElementById("total-minutes").textContent = pausminuter;
  document.getElementById("today-pauses").textContent = pauserIdag;
  document.getElementById("streak-days").textContent = dagarIFoljd;
  // Visa genomförda pauser denna vecka
const veckodiagram = document.querySelectorAll(
    "#weekly-chart .day .bar"
  );
  
  const idagVecka = new Date();
  const veckostart = new Date(idagVecka);
  const veckodag = (idagVecka.getDay() + 6) % 7;
  
  veckostart.setDate(idagVecka.getDate() - veckodag);
  veckostart.setHours(0, 0, 0, 0);
  
  const pauserPerDag = Array(7).fill(0);
  
  statistik.forEach(paus => {
    const datum = new Date(paus.datum);
  
    if (datum >= veckostart && datum <= idagVecka) {
      const index = (datum.getDay() + 6) % 7;
      pauserPerDag[index]++;
    }
  });
  
  const maxPauser = Math.max(1, ...pauserPerDag);
  
  veckodiagram.forEach((stapel, index) => {
    const antal = pauserPerDag[index];
  
    stapel.style.height =
      antal === 0 ? "0%" :
      `${Math.max(10, antal / maxPauser * 100)}%`;
  
    stapel.title = `${antal} genomförda pauser`;
  });

  const weekBtn = document.getElementById("week-btn");
const monthBtn = document.getElementById("month-btn");
const chartTitle = document.getElementById("chart-title");
const chart = document.getElementById("weekly-chart");

let valdPeriod = "week";
let visatDatum = new Date ();


function visaPeriod(period) {

    valdPeriod = period ;
    chart.classList.toggle("month-view", period === "month");

  weekBtn.classList.toggle("active", period === "week");
  monthBtn.classList.toggle("active", period === "month");

  if (period === "week") {
    const start = new Date(visatDatum);
    const veckodag = (start.getDay() + 6) % 7;
  
    start.setDate(start.getDate() - veckodag);
  
    const slut = new Date(start);
    slut.setDate(start.getDate() + 6);
  
    chartTitle.textContent =
      `${start.getDate()}/${start.getMonth() + 1} – ${slut.getDate()}/${slut.getMonth() + 1}`;
  
      const statistik = JSON.parse(
        localStorage.getItem("skarmPausStatistik") || "[]"
      );
      
      chart.innerHTML = "";
      
      const dagar = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
      
      for (let i = 0; i < 7; i++) {
        const datum = new Date(start);
        datum.setDate(start.getDate() + i);
      
        const antal = statistik.filter(paus => {
          const pausDatum = new Date(paus.datum);
      
          return (
            pausDatum.getFullYear() === datum.getFullYear() &&
            pausDatum.getMonth() === datum.getMonth() &&
            pausDatum.getDate() === datum.getDate()
          );
        }).length;
      
        const kolumn = document.createElement("div");
        kolumn.className = "day";
      
        const stapel = document.createElement("div");
        stapel.className = "bar";
        stapel.style.height = antal > 0
          ? `${Math.min(antal * 25, 150)}px`
          : "0px";
      
        stapel.title = `${antal} genomförda pauser`;
      
        kolumn.appendChild(stapel);
        kolumn.appendChild(
          document.createTextNode(dagar[i])
        );
      
        chart.appendChild(kolumn);
      }
      
    return;
  }

  chartTitle.textContent =
  visatDatum.toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric"
  });

 
  const ar = visatDatum.getFullYear();
  const manad = visatDatum.getMonth();
const antalDagar = new Date(ar, manad + 1, 0).getDate();


  const statistik = JSON.parse(
    localStorage.getItem("skarmPausStatistik") || "[]"
  );

  chart.innerHTML = "";

  for (let dag = 1; dag <= antalDagar; dag++) {
    const antal = statistik.filter(paus => {
      const datum = new Date(paus.datum);
      return datum.getFullYear() === ar &&
        datum.getMonth() === manad &&
        datum.getDate() === dag;
    }).length;

    const kolumn = document.createElement("div");
    kolumn.className = "day";

    const stapel = document.createElement("div");
    stapel.className = "bar";
    stapel.style.height = antal > 0
      ? `${Math.min(antal * 25, 150)}px`
      : "0px";

    kolumn.appendChild(stapel);
    kolumn.appendChild(document.createTextNode(dag));
    chart.appendChild(kolumn);
  }
}

monthBtn.addEventListener("click", () => visaPeriod("month"));
weekBtn.addEventListener("click", () => visaPeriod("week"));

const prevBtn = document.getElementById("prev-period");
const nextBtn = document.getElementById("next-period");

prevBtn.addEventListener("click", () => {
  if (valdPeriod === "week") {
    visatDatum.setDate(visatDatum.getDate() - 7);
  } else {
    visatDatum.setDate(1);
    visatDatum.setMonth(visatDatum.getMonth() - 1);
  }

  visaPeriod(valdPeriod);
});

nextBtn.addEventListener("click", () => {
  if (valdPeriod === "week") {
    visatDatum.setDate(visatDatum.getDate() + 7);
  } else {
    visatDatum.setDate(1);
    visatDatum.setMonth(visatDatum.getMonth() + 1);
  }

  visaPeriod(valdPeriod);
});