
const namnInput = document.getElementById("profil-namn");
const smeknamnInput = document.getElementById("profil-smeknamn");
const malSelect = document.getElementById("profil-mal");
const paminnelseSelect = document.getElementById("profil-paminnelse");
const aktivitetSelect = document.getElementById("profil-aktivitet");
const platsSelect = document.getElementById("profil-plats");

const sparaKnapp = document.getElementById("spara-profil");
const meddelande = document.getElementById("profil-meddelande");

// Hämta sparad profil
function hamtaProfil() {
  try {
    const sparad = localStorage.getItem("skarmPausProfil");

    if (!sparad) return;

    const profil = JSON.parse(sparad);

    namnInput.value = profil.namn || "";
    smeknamnInput.value = profil.smeknamn || "";
    malSelect.value = profil.pausmal || "30";
    paminnelseSelect.value = profil.paminnelse || "30";
    aktivitetSelect.value = profil.aktivitet || "";
    platsSelect.value = profil.plats || "bada";

  } catch (error) {
    console.error("Kunde inte läsa profilen:", error);
  }
}

// Spara profil lokalt
function sparaProfil() {
  const namn = namnInput.value.trim();

  if (!namn) {
    meddelande.textContent = "Skriv ditt namn först.";
    namnInput.focus();
    return;
  }

  const profil = {
    namn: namn,
    smeknamn: smeknamnInput.value.trim(),
    pausmal: malSelect.value,
    paminnelse: paminnelseSelect.value,
    aktivitet: aktivitetSelect.value,
    plats: platsSelect.value
  };

  try {
    localStorage.setItem(
      "skarmPausProfil",
      JSON.stringify(profil)
    );

    meddelande.textContent = "✓ Profilen har sparats!";

  } catch (error) {
    meddelande.textContent = "Kunde inte spara profilen.";
    console.error(error);
  }
}

sparaKnapp.addEventListener("click", sparaProfil);

hamtaProfil();
function visaAnvandarnamn() {
    try {
      const sparad = localStorage.getItem("skarmPausProfil");
      if (!sparad) return;
  
      const profil = JSON.parse(sparad);
      const namn = (profil.smeknamn || profil.namn || "").trim();
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