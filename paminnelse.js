
let paminnelseTimer = null;

function startaPaminnelse(minuter = 60) {
  clearTimeout(paminnelseTimer);

  paminnelseTimer = setTimeout(() => {
    visaPaminnelse();
  }, minuter * 60 * 1000);
}

function visaPaminnelse() {
  alert(
    "📱 Dags för en skärmpaus!\n\n" +
    "Du har nått din tidsgräns.\n" +
    "Vad sägs om en promenad eller lite stretching?"
  );
}

function stoppaPaminnelse() {
  clearTimeout(paminnelseTimer);
  paminnelseTimer = null;
}
