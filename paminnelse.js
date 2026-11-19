
/* SKÄRMFRID – PÅMINNELSE MED LJUDALARM */

(() => {
  const paminnelseSlutKey = "skarmfrid-paminnelse-sluttid";
  const aktivKey = "skarmfrid-aktiv-funktion";

  const reminderTime = document.getElementById("reminder-time");
  const customMinutes = document.getElementById("reminder-custom-minutes");
  const startBtn = document.getElementById("start-reminder");
  const statusText = document.getElementById("reminder-status");

  if (!reminderTime || !startBtn || !statusText) {
    console.warn("Påminnelsens HTML-element saknas.");
    return;
  }

  let nedrakningTimer = null;
  let slutTid = null;
  let paminnelseAktiv = false;
  let alarmAudioContext = null;

  function aktivFunktion() {
    return localStorage.getItem(aktivKey);
  }

  function forberedAlarmLjud() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!alarmAudioContext) {
        alarmAudioContext = new AudioContextClass();
      }

      if (alarmAudioContext.state === "suspended") {
        alarmAudioContext.resume().catch(console.warn);
      }
    } catch (error) {
      console.warn("Ljudet kunde inte förberedas:", error);
    }
  }

  function spelaAlarm() {
    try {
      if (!alarmAudioContext ||
          alarmAudioContext.state !== "running") {
        return;
      }

      const start = alarmAudioContext.currentTime;

      for (let i = 0; i < 3; i++) {
        const oscillator = alarmAudioContext.createOscillator();
        const gain = alarmAudioContext.createGain();
        const tid = start + i * 0.45;

        oscillator.type = "sine";
        oscillator.frequency.value = 660;

        gain.gain.setValueAtTime(0.0001, tid);
        gain.gain.exponentialRampToValueAtTime(
          0.12, tid + 0.04
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001, tid + 0.30
        );

        oscillator.connect(gain);
        gain.connect(alarmAudioContext.destination);

        oscillator.start(tid);
        oscillator.stop(tid + 0.31);
      }
    } catch (error) {
      console.warn("Ljudalarmet kunde inte spelas:", error);
    }
  }

  function formateraTid(sekunder) {
    const timmar = Math.floor(sekunder / 3600);
    const minuter = Math.floor((sekunder % 3600) / 60);
    const sek = sekunder % 60;

    const tva = tal => String(tal).padStart(2, "0");

    if (timmar > 0) {
      return `${tva(timmar)}:${tva(minuter)}:${tva(sek)}`;
    }

    return `${tva(minuter)}:${tva(sek)}`;
  }

  function hamtaValfriTid() {
    if (!customMinutes) return null;

    const match = customMinutes.value.trim()
      .match(/^(\d{1,4}):([0-5]\d)$/);

    if (!match) return null;

    const sekunder =
      Number(match[1]) * 60 + Number(match[2]);

    return sekunder >= 1 && sekunder <= 86400
      ? sekunder
      : null;
  }

  function uppdateraValfriTid() {
    if (!customMinutes) return;

    const valfri = reminderTime.value === "custom";
    customMinutes.hidden = !valfri;
    customMinutes.disabled = !valfri;
  }

  function uppdateraKnapp() {
    startBtn.textContent = paminnelseAktiv
      ? "Stoppa"
      : "Starta";

    startBtn.classList.toggle(
      "is-stopping",
      paminnelseAktiv
    );

    startBtn.setAttribute(
      "aria-pressed",
      String(paminnelseAktiv)
    );

    // Säkerställ röd färg även om annan CSS skriver över den.
    startBtn.style.backgroundColor =
      paminnelseAktiv ? "#b83b3b" : "";

    startBtn.style.borderColor =
      paminnelseAktiv ? "#b83b3b" : "";

    startBtn.style.color =
      paminnelseAktiv ? "#ffffff" : "";
  }

  function uppdateraSkarmPaus() {
    const pausForm = document.getElementById("pause-form");
    if (!pausForm) return;

    const last = aktivFunktion() === "paminnelse";

    pausForm.querySelectorAll(
      "input, select, button"
    ).forEach(element => {
      element.disabled = last;
    });

    const pausStatus =
      document.getElementById("form-status");

    if (pausStatus) {
      pausStatus.textContent = last
        ? "🔔 Stoppa påminnelsen innan du startar Skärmpaus."
        : "";
    }
  }

  function rensaTimer() {
    if (nedrakningTimer !== null) {
      clearInterval(nedrakningTimer);
      nedrakningTimer = null;
    }
  }

  function frigoraPaminnelse() {
    localStorage.removeItem(paminnelseSlutKey);

    if (aktivFunktion() === "paminnelse") {
      localStorage.removeItem(aktivKey);
    }
  }

  function stoppaPaminnelse() {
    rensaTimer();
    paminnelseAktiv = false;
    slutTid = null;

    frigoraPaminnelse();
    uppdateraKnapp();
    uppdateraSkarmPaus();

    statusText.textContent = "";
  }

  function visaPaminnelse() {
    if (!paminnelseAktiv) return;

    rensaTimer();
    paminnelseAktiv = false;
    slutTid = null;

    frigoraPaminnelse();
    uppdateraKnapp();
    uppdateraSkarmPaus();

    statusText.textContent = "Tid kvar: 00:00";

    spelaAlarm();

    setTimeout(() => {
      alert(
        "🔔 Dags för en skärmpaus!\n\n" +
        "Du har nått din påminnelsetid.\n" +
        "Ta gärna en stund utan mobilen."
      );
    }, 1500);
  }

  function uppdateraNedrakning() {
    if (!paminnelseAktiv || slutTid === null) return;

    const sekunderKvar = Math.max(
      0,
      Math.ceil((slutTid - Date.now()) / 1000)
    );

    statusText.textContent =
      `Tid kvar: ${formateraTid(sekunderKvar)}`;

    if (sekunderKvar === 0) {
      visaPaminnelse();
    }
  }

  function startaTimers() {
    rensaTimer();

    paminnelseAktiv = true;
    uppdateraKnapp();
    uppdateraSkarmPaus();
    uppdateraNedrakning();

    if (paminnelseAktiv) {
      nedrakningTimer = setInterval(
        uppdateraNedrakning,
        250
      );
    }
  }

  function startaPaminnelse(sekunder) {
    if (aktivFunktion() === "skarmPaus") {
      statusText.textContent =
        "Avsluta din Skärmpaus innan du startar påminnelsen.";
      return;
    }

    if (!Number.isInteger(sekunder) ||
        sekunder < 1 ||
        sekunder > 86400) {
      statusText.textContent =
        "Ange en giltig tid, exempelvis 00:04.";
      return;
    }

    forberedAlarmLjud();

    slutTid = Date.now() + sekunder * 1000;

    localStorage.setItem(aktivKey, "paminnelse");
    localStorage.setItem(
      paminnelseSlutKey,
      String(slutTid)
    );

    startaTimers();
  }

  function aterstallPaminnelse() {
    const sparadSluttid = Number(
      localStorage.getItem(paminnelseSlutKey)
    );

    if (
      aktivFunktion() === "paminnelse" &&
      Number.isFinite(sparadSluttid) &&
      sparadSluttid > 0
    ) {
      slutTid = sparadSluttid;

      if (slutTid <= Date.now()) {
        paminnelseAktiv = true;
        visaPaminnelse();
      } else {
        startaTimers();
      }
      return;
    }

    paminnelseAktiv = false;
    slutTid = null;

    if (aktivFunktion() === "paminnelse") {
      frigoraPaminnelse();
    } else {
      localStorage.removeItem(paminnelseSlutKey);
    }

    uppdateraKnapp();
    uppdateraSkarmPaus();
  }

  startBtn.addEventListener("click", () => {
    if (paminnelseAktiv) {
      stoppaPaminnelse();
      return;
    }

    const sekunder = reminderTime.value === "custom"
      ? hamtaValfriTid()
      : Number(reminderTime.value) * 60;

    startaPaminnelse(sekunder);
  });

  reminderTime.addEventListener(
    "change",
    uppdateraValfriTid
  );

  window.addEventListener("storage", event => {
    if (
      event.key === aktivKey ||
      event.key === paminnelseSlutKey
    ) {
      rensaTimer();
      paminnelseAktiv = false;
      slutTid = null;
      aterstallPaminnelse();
    }
  });

  uppdateraValfriTid();
  aterstallPaminnelse();
})();
