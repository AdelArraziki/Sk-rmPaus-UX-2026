
const namnInput = document.getElementById("profil-namn");
const malSelect = document.getElementById("profil-mal");
const sparaKnapp = document.getElementById("spara-profil");
const meddelande = document.getElementById("profil-meddelande");

// Hämta sparad profil
function hamtaProfil() {
  try {
    const sparad = localStorage.getItem("skarmPausProfil");

    if (!sparad) return;

    const profil = JSON.parse(sparad);

    namnInput.value = profil.namn || "";
    malSelect.value = profil.pausmal || "30";
  } catch (error) {
    console.error("Kunde inte läsa profilen:", error);
  }
}

// Spara profil lokalt
function sparaProfil() {
  const namn = namnInput.value.trim();
  const pausmal = malSelect.value;

  if (!namn) {
    meddelande.textContent = "Skriv ditt namn först.";
    namnInput.focus();
    return;
  }

  const profil = {
    namn: namn,
    pausmal: pausmal
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
