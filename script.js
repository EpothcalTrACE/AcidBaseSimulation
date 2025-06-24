const substanceSelect = document.getElementById("substance");
const concentrationInput = document.getElementById("concentration");
const concVal = document.getElementById("concVal");
const pHDisplay = document.getElementById("pH");
const indicatorBox = document.getElementById("indicatorBox");
const volumeInput = document.getElementById("volumeInput");
const baseInput = document.getElementById("baseInput");
const resetButton = document.getElementById("resetButton");
const exportButton = document.getElementById("exportButton");
const simulateButton = document.getElementById("simulateButton");
const titrationSlider = document.getElementById("titrationSlider");
const sliderLabel = document.getElementById("sliderLabel");
const playPauseButton = document.getElementById("playPauseButton");
const livePHDisplay = document.getElementById("livePHDisplay");

let titrationChart;
let pH_values = [], baseVols = [];
let simulationInterval = null;
let isPlaying = false;

const substances = {
  HCl: { type: "acid", strong: true },
  NaOH: { type: "base", strong: true },
  CH3COOH: { type: "acid", strong: false, Ka: 1.8e-5 },
};

function calculatePH() {
  const selected = substanceSelect.value;
  const conc = parseFloat(concentrationInput.value);
  concVal.textContent = conc.toFixed(2);

  const substance = substances[selected];
  let pH = 7;

  if (substance.type === "acid") {
    if (substance.strong) {
      pH = -Math.log10(conc);
    } else {
      const Hplus = Math.sqrt(substance.Ka * conc);
      pH = -Math.log10(Hplus);
    }
  } else if (substance.type === "base") {
    const OH = conc;
    const pOH = -Math.log10(OH);
    pH = 14 - pOH;
  }

  pH = Math.max(0, Math.min(14, pH));
  pHDisplay.textContent = pH.toFixed(2);
  updateIndicator(pH);

  if (selected === "CH3COOH") {
    drawTitrationChart(conc);
  } else {
    clearTitrationChart();
  }
}

function updateIndicator(pH) {
  let color = "#ffffff";
  let text = "";

  if (pH < 3) {
    color = "#ff4d4d"; text = "Strong Acid";
  } else if (pH < 7) {
    color = "#ffa64d"; text = "Weak Acid";
  } else if (pH === 7) {
    color = "#66ccff"; text = "Neutral";
  } else if (pH <= 11) {
    color = "#80ffaa"; text = "Weak Base";
  } else {
    color = "#4dff4d"; text = "Strong Base";
  }

  indicatorBox.style.backgroundColor = color;
  indicatorBox.textContent = `${text} (pH: ${pH.toFixed(2)})`;
}

function generateTitrationCurve(acidConc = 0.1, acidVol = 0.050, baseConc = 0.1) {
  const Ka = 1.8e-5;
  const nAcid = acidConc * acidVol;
  const pKa = -Math.log10(Ka);

  baseVols = [], pH_values = [];

  for (let i = 0; i <= 60; i++) {
    let v_base = i / 1000;
    let n_base = baseConc * v_base;
    let pH = 7;

    if (n_base < nAcid) {
      let n_HA = nAcid - n_base;
      let n_A = n_base;
      pH = n_A === 0 ? -Math.log10(Math.sqrt(Ka * acidConc)) : pKa + Math.log10(n_A / n_HA);
    } else if (Math.abs(n_base - nAcid) < 0.000001) {
      let conc_A = nAcid / (acidVol + v_base);
      let Kb = 1e-14 / Ka;
      let OH = Math.sqrt(Kb * conc_A);
      pH = 14 + Math.log10(OH);
    } else {
      let excessOH = (n_base - nAcid) / (acidVol + v_base);
      pH = 14 + Math.log10(excessOH);
    }

    baseVols.push(i);
    pH_values.push(Math.min(Math.max(pH, 0), 14));
  }

  return { baseVols, pH_values };
}

function drawTitrationChart(acidConc) {
  const acidVol = parseFloat(volumeInput.value) || 0.05;
  const baseConc = parseFloat(baseInput.value) || 0.1;

  const ctx = document.getElementById("titrationChart").getContext("2d");
  generateTitrationCurve(acidConc, acidVol, baseConc);

  if (titrationChart) {
    titrationChart.destroy();
  }

  titrationSlider.max = baseVols.length - 1;
  titrationSlider.value = baseVols.length - 1;
  sliderLabel.textContent = `${baseVols[baseVols.length - 1]} mL`;
  livePHDisplay.textContent = `pH: ${pH_values[baseVols.length - 1].toFixed(2)}`;

  titrationChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: baseVols,
      datasets: [{
        label: 'pH vs Volume of Base Added',
        data: pH_values,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutBounce'
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `pH: ${context.raw.toFixed(2)} at ${context.label} mL`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Volume of NaOH Added (mL)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'pH Level'
          },
          min: 0,
          max: 14
        }
      }
    }
  });
}

function clearTitrationChart() {
  if (titrationChart) {
    titrationChart.destroy();
    titrationChart = null;
  }
}

function exportChart() {
  const link = document.createElement('a');
  link.download = 'titration_chart.png';
  link.href = document.getElementById("titrationChart").toDataURL();
  link.click();
}

function resetSimulator() {
  concentrationInput.value = 0.10;
  volumeInput.value = 0.05;
  baseInput.value = 0.10;
  substanceSelect.value = "CH3COOH";
  titrationSlider.value = 60;
  calculatePH();
  playPauseButton.textContent = "Play";
  clearInterval(simulationInterval);
  isPlaying = false;
}

function togglePlayPause() {
  if (isPlaying) {
    clearInterval(simulationInterval);
    playPauseButton.textContent = "Play";
  } else {
    simulateStepByStep();
    playPauseButton.textContent = "Pause";
  }
  isPlaying = !isPlaying;
}

function simulateStepByStep() {
  let step = 0;
  clearInterval(simulationInterval);

  if (!baseVols.length || !pH_values.length) {
    const acidConc = parseFloat(concentrationInput.value);
    drawTitrationChart(acidConc);
  }

  simulationInterval = setInterval(() => {
    if (step > baseVols.length - 1) {
      clearInterval(simulationInterval);
      playPauseButton.textContent = "Play";
      isPlaying = false;
      return;
    }
    titrationSlider.value = step;
    sliderLabel.textContent = `${baseVols[step]} mL`;
    livePHDisplay.textContent = `pH: ${pH_values[step].toFixed(2)}`;
    updateSliderGraph(step);
    step++;
  }, 300);
}

function updateSliderGraph(step) {
  if (!titrationChart) return;
  titrationChart.data.labels = baseVols.slice(0, step + 1);
  titrationChart.data.datasets[0].data = pH_values.slice(0, step + 1);
  titrationChart.update();
}

titrationSlider.addEventListener("input", () => {
  const step = parseInt(titrationSlider.value);
  sliderLabel.textContent = `${baseVols[step]} mL`;
  livePHDisplay.textContent = `pH: ${pH_values[step].toFixed(2)}`;
  updateSliderGraph(step);
});

substanceSelect.addEventListener("change", calculatePH);
concentrationInput.addEventListener("input", calculatePH);
resetButton.addEventListener("click", resetSimulator);
exportButton.addEventListener("click", exportChart);
simulateButton.addEventListener("click", simulateStepByStep);
playPauseButton.addEventListener("click", togglePlayPause);

window.addEventListener("DOMContentLoaded", () => {
  calculatePH();
  drawTitrationChart(parseFloat(concentrationInput.value));
});


