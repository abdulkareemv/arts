/* ===== GOOGLE SHEET URLs ===== */

// SCORE TOTALS
const totalURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSCeGUDYDzVhlJ2HOaxoMmBb2Zy0xssgDqfEWt0UOyNrAwpUxyQ5xBTpcJqfyJ9cZQACCJw033T_lGu/pub?gid=1076387762&single=true&output=csv";

// RESULT SHEETS (CSV)
const onStageURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSCeGUDYDzVhlJ2HOaxoMmBb2Zy0xssgDqfEWt0UOyNrAwpUxyQ5xBTpcJqfyJ9cZQACCJw033T_lGu/pub?gid=383908374&single=true&output=csv";

const offStageURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSCeGUDYDzVhlJ2HOaxoMmBb2Zy0xssgDqfEWt0UOyNrAwpUxyQ5xBTpcJqfyJ9cZQACCJw033T_lGu/pub?gid=0&single=true&output=csv";

/* ===== FETCH SCORES ===== */
function fetchScores() {
  fetch(totalURL)
    .then(res => res.text())
    .then(text => {
      const rows = text.trim().split("\n").slice(1);

      const tbody = document.querySelector("#resultsTable tbody");
      tbody.innerHTML = "";

      let finalTotals = { red: 0, green: 0, blue: 0, yellow: 0 };

      rows.forEach(r => {
        const [label, red, green, blue, yellow] = r.split(",");

        // Show all rows (On stage / Off stage / Total)
        tbody.innerHTML += `
          <tr>
            <td>${label}</td>
            <td>${red}</td>
            <td>${green}</td>
            <td>${blue}</td>
            <td>${yellow}</td>
          </tr>
        `;

        // Capture FINAL TOTAL row only
        if (label.toLowerCase().includes("total")) {
          finalTotals = {
            red: +red || 0,
            green: +green || 0,
            blue: +blue || 0,
            yellow: +yellow || 0
          };
        }
      });

      // 🎯 SCORE CARD (ONLY TOTAL)
      redTotal.innerText = `Red: ${finalTotals.red}`;
      greenTotal.innerText = `Green: ${finalTotals.green}`;
      blueTotal.innerText = `Blue: ${finalTotals.blue}`;
      yellowTotal.innerText = `Yellow: ${finalTotals.yellow}`;
    });
}


/* ===== RESULT DATA ===== */
let onStageResults = [];
let offStageResults = [];

/* ===== FETCH CSV ===== */
async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();

  return text
    .trim()
    .split("\n")
    .slice(1)
    .map(r => r.split(",").map(c => c.replace(/\r/g, "").trim()));
}

/* ===== LOAD RESULTS ===== */
async function loadResults() {
  const onRows = await fetchCSV(onStageURL);
  const offRows = await fetchCSV(offStageURL);

  onStageResults = filterResults(onRows);
  offStageResults = filterResults(offRows);

  populateDropdowns();
}
/* ===== FILTER PUBLISHED ===== */
function filterResults(rows) {
  return rows
    .filter(r => (r[8] || "").trim().toLowerCase() === "published")
    .map(r => ({
      item: r[1] || "—",
      type: (r[9] || "Individual").trim(), // fallback
      winners: {
        first:  { name: r[2] || "-", dept: r[3] || "-" },
        second: { name: r[4] || "-", dept: r[5] || "-" },
        third:  { name: r[6] || "-", dept: r[7] || "-" }
      }
    }));
}


/* ===== DROPDOWNS ===== */
function populateDropdowns() {
  const onSel = document.getElementById("onStageSelect");
  const offSel = document.getElementById("offStageSelect");

  onSel.innerHTML = `<option value="">Select On Stage Item</option>`;
  offSel.innerHTML = `<option value="">Select Off Stage Item</option>`;

  onStageResults.forEach((r, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = r.item;
    onSel.appendChild(opt);
  });

  offStageResults.forEach((r, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = r.item;
    offSel.appendChild(opt);
  });
}

/* ===== RENDER RESULT ===== */
function renderResult(result, box, category) {
  box.innerHTML = `
    <div class="result-card">
      <div class="item-name">${result.item}</div>

      <table class="result-table">
        <thead>
          <tr>
            <th>Medal</th>
            <th>Winner(s)</th>
            <th>Dept</th>
          </tr>
        </thead>
        <tbody>
          <tr class="gold">
            <td>🥇 Gold</td>
            <td>${result.winners.first.name}</td>
            <td>${result.winners.first.dept}</td>
          </tr>
          <tr class="silver">
            <td>🥈 Silver</td>
            <td>${result.winners.second.name}</td>
            <td>${result.winners.second.dept}</td>
          </tr>
          <tr class="bronze">
            <td>🥉 Bronze</td>
            <td>${result.winners.third.name}</td>
            <td>${result.winners.third.dept}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}


/* ===== EVENTS ===== */
onStageSelect.addEventListener("change", e => {
  const r = onStageResults[e.target.value];
  if (r) renderResult(r, onStageResultBox, "On Stage");
});

offStageSelect.addEventListener("change", e => {
  const r = offStageResults[e.target.value];
  if (r) renderResult(r, offStageResultBox, "Off Stage");
});

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  fetchScores();
  loadResults();
  setInterval(fetchScores, 10000);
});
