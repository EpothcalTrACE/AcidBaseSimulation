const substanceSelect = document.getElementById("substance");
const concentrationInput = document.getElementById("concentration");
const concVal = document.getElementById("concVal");
const volumeInput = document.getElementById("volumeInput");
const baseInput = document.getElementById("baseInput");
const simulateBtn = document.getElementById("simulate");
const liveBtn = document.getElementById("liveTitration");
const pHDisplay = document.getElementById("pH");

let chart;
let liveIndex = 0;
let interval = null;
let full_pH_values = [], full_baseVols = [];

simulateBtn.addEventListener("click", () => {
  stopLive();
  const substance = substanceSelect.value;
  const conc = parseFloat(concentrationInput.value);
  const vol = parseFloat(volumeInput.value);
  const baseConc = parseFloat(baseInput.value);
  concVal.textContent = conc.toFixed(2);
  drawTitrationChart(substance, conc, vol, baseConc);
});

liveBtn.addEventListener("click", () => {
  stopLive();
  const substance = substanceSelect.value;
  const conc = parseFloat(concentrationInput.value);
  const vol = parseFloat(volumeInput.value);
  const baseConc = parseFloat(baseInput.value);
  concVal.textContent = conc.toFixed(2);
  generateTitrationData(substance, conc, vol, baseConc);
  runLiveTitration();
});

function generateTitrationData(substance, acidConc, acidVol, baseConc) {
  const pKa = 4.74;
  const Ka = Math.pow(10, -pKa);
  const nAcid = acidConc * acidVol;
  full_pH_values = [];
  full_baseVols = [];

  for (let i = 0; i <= 60; i++) {
    const v_base = i / 1000;
    const n_base = baseConc * v_base;
    let pH = 7;

    if (substance === "CH3COOH") {
      if (n_base < nAcid) {
        const n_HA = nAcid - n_base;
        const n_A = n_base;
        pH = pKa + Math.log10(n_A / n_HA);
      } else if (n_base === nAcid) {
        pH = pKa;
      } else {
        const excessOH = (n_base - nAcid) / (acidVol + v_base);
        pH = 14 + Math.log10(excessOH);
      }
    } else if (substance === "HCl") {
      const totalVol = acidVol + v_base;
      const Hplus = Math.max(1e-7, (acidConc * acidVol - n_base) / totalVol);
      pH = -Math.log10(Hplus);
    } else if (substance === "NaOH") {
      const totalVol = acidVol + v_base;
      const OH = Math.max(1e-7, (n_base - acidConc * acidVol) / totalVol);
      pH = 14 + Math.log10(OH);
    }

    pH = Math.max(0, Math.min(14, pH));
    full_baseVols.push(i);
    full_pH_values.push(pH);
  }
}

function runLiveTitration() {
  const ctx = document.getElementById("titrationChart").getContext("2d");
  if (chart) chart.destroy();
  liveIndex = 0;

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Live Titration Curve',
        data: [],
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: { title: { display: true, text: 'Volume of Base Added (mL)' } },
        y: { min: 0, max: 14, title: { display: true, text: 'pH' } }
      }
    }
  });

  interval = setInterval(() => {
    if (liveIndex >= full_baseVols.length) {
      clearInterval(interval);
      return;
    }
    const v = full_baseVols[liveIndex];
    const pH = full_pH_values[liveIndex];
    chart.data.labels.push(v);
    chart.data.datasets[0].data.push(pH);
    chart.update();
    pHDisplay.textContent = pH.toFixed(2);
    liveIndex++;
  }, 200);
}

function drawTitrationChart(substance, acidConc, acidVol, baseConc) {
  generateTitrationData(substance, acidConc, acidVol, baseConc);
  const ctx = document.getElementById("titrationChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: full_baseVols,
      datasets: [{
        label: 'Full Titration Curve',
        data: full_pH_values,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Volume of Base Added (mL)' } },
        y: { min: 0, max: 14, title: { display: true, text: 'pH' } }
      }
    }
  });

  if (full_pH_values.length > 0) {
    pHDisplay.textContent = full_pH_values[full_pH_values.length - 1].toFixed(2);
  } else {
    pHDisplay.textContent = "--";
  }
}

function stopLive() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (full_pH_values.length > 0) {
    pHDisplay.textContent = full_pH_values[full_pH_values.length - 1].toFixed(2);
  } else {
    pHDisplay.textContent = "--";
  }
}