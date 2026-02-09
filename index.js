/* ===== CAROUSEL ===== */
let index = 0;
const images = document.querySelectorAll('.carousel-container img');

function carousel() {
    images.forEach((img, i) => {
        img.style.display = i === index ? 'block' : 'none';
    });
    index = (index + 1) % images.length;
    setTimeout(carousel, 3000);
}

/* ===== SCORE BOX ANIMATION ===== */
function animateScoreBoxes() {
    const scoreBoxes = document.querySelectorAll('.card');
    scoreBoxes.forEach((box, i) => {
        box.style.opacity = 0;
        setTimeout(() => {
            box.style.opacity = 1;
        }, i * 200);
    });
}


/* ===== GOOGLE SHEET URLs ===== */
// Score sheet (Sheet name: Score)
const scoreSheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR3ZTB0p2mdrZYUGk2WogHSEccBPUB00xV7JZOBTw4LGy4Mv5G9E3ow6L77N5BpqH7J0XhzZEa1bAoZ/pub?gid=0&single=true&output=csv";

// Result sheet (Sheet name: result)
const resultSheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vR3ZTB0p2mdrZYUGk2WogHSEccBPUB00xV7JZOBTw4LGy4Mv5G9E3ow6L77N5BpqH7J0XhzZEa1bAoZ/pub?gid=765466622&single=true&output=csv";

/* ===== FETCH SCORES (Score sheet) ===== */
function fetchScores() {
    fetch(scoreSheetURL)
        .then(res => res.text())
        .then(data => {
            const rows = data.trim().split("\n").slice(1);

            let totals = { red: 0, green: 0, blue: 0, yellow: 0 };
            const tbody = document.querySelector("#resultsTable tbody");
            tbody.innerHTML = "";

            rows.forEach(row => {
                const [event, r, g, b, y] = row.split(",");

                totals.red += Number(r) || 0;
                totals.green += Number(g) || 0;
                totals.blue += Number(b) || 0;
                totals.yellow += Number(y) || 0;

                tbody.innerHTML += `
                    <tr>
                        <td>${event}</td>
                        <td>${r}</td>
                        <td>${g}</td>
                        <td>${b}</td>
                        <td>${y}</td>
                    </tr>`;
            });

            const tableRows = document.querySelectorAll("#resultsTable tbody tr");

            tableRows.forEach(row => {
                const cells = row.querySelectorAll("td");
                const eventCell = cells[0];
                let hasScore = false;

                for (let i = 1; i < cells.length; i++) {
                    const value = Number(cells[i].textContent.trim()) || 0;

                    cells[i].classList.remove(
                        "score-red",
                        "score-green",
                        "score-blue",
                        "score-yellow"
                    );

                    if (value > 0) {
                        hasScore = true;
                        const classes = [
                            null,
                            "score-red",
                            "score-green",
                            "score-blue",
                            "score-yellow"
                        ];
                        cells[i].classList.add(classes[i]);
                    }
                }

                eventCell.classList.toggle("event-active", hasScore);
            });

           animateNumber("redTotal", "Red", totals.red);
animateNumber("greenTotal", "Green", totals.green);
animateNumber("blueTotal", "Blue", totals.blue);
animateNumber("yellowTotal", "Yellow", totals.yellow);

updateRanksWithSound();

        });
}
function animateNumber(id, label, newValue) {
    const el = document.getElementById(id);
    const oldValue = parseInt(el.dataset.value || 0);
    const duration = 600;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(oldValue + (newValue - oldValue) * progress);
        el.innerText = `${label}: ${value}`;
        if (progress < 1) requestAnimationFrame(update);
        else el.dataset.value = newValue;
    }
    requestAnimationFrame(update);
}
const rankUpSound = new Audio("rankup.mp3");
rankUpSound.volume = 0.6;


/* ===== FETCH RESULTS (Result sheet) ===== */
function fetchResults() {
    fetch(resultSheetURL)
        .then(res => res.text())
        .then(data => {
            const rows = data.trim().split("\n").slice(1);

            const eventSelect = document.getElementById("eventSelect");
            const resultBox = document.getElementById("resultBox");

            if (!eventSelect || !resultBox) return;

            eventSelect.innerHTML = `<option value="">Select Event</option>`;
            const results = {};

            rows.forEach(row => {
                // ✅ FIXED CSV parsing (spaces are SAFE now)
                const cols = row
                    .match(/("([^"]|"")*"|[^,]+)(?=,|$)/g)
                    .map(v => v.replace(/^"|"$/g, "").trim());

                if (cols.length < 7) return;

                const [
                    event,
                    first, firstDept,
                    second, secondDept,
                    third, thirdDept
                ] = cols;

                results[event] = {
                    first, firstDept,
                    second, secondDept,
                    third, thirdDept
                };

                const opt = document.createElement("option");
                opt.value = event;
                opt.textContent = event;
                eventSelect.appendChild(opt);
            });

            eventSelect.onchange = () => {
                const r = results[eventSelect.value];
                if (!r) {
                    resultBox.innerHTML = "";
                    return;
                }

                const eventName = eventSelect.value;

resultBox.innerHTML = `
  <h2 class="event-winners-heading">
    ${eventName} Winners
  </h2>

  <table class="result-table">

                    <thead>
                      <tr>
                        <th>Medal</th>
                        <th>Winners</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="gold-row">
                        <td>🥇 Gold</td>
                        <td>${r.first}</td>
                        <td>${r.firstDept}</td>
                      </tr>
                      <tr class="silver-row">
                        <td>🥈 Silver</td>
                        <td>${r.second}</td>
                        <td>${r.secondDept}</td>
                      </tr>
                      <tr class="bronze-row">
                        <td>🥉 Bronze</td>
                        <td>${r.third}</td>
                        <td>${r.thirdDept}</td>
                      </tr>
                    </tbody>
                  </table>
                `;
            };
        });
}
let lastOrder = [];

function updateRanksWithSound() {
    const cards = [
        document.getElementById("redTotal"),
        document.getElementById("greenTotal"),
        document.getElementById("blueTotal"),
        document.getElementById("yellowTotal")
    ];

    cards.forEach(c => c.classList.remove("first","second","third","last"));

    const sorted = [...cards].sort((a, b) =>
        parseInt(b.dataset.value || 0) - parseInt(a.dataset.value || 0)
    );

    const newOrder = sorted.map(c => c.id);

    if (lastOrder.length && newOrder[0] !== lastOrder[0]) {
        rankUpSound.currentTime = 0;
        rankUpSound.play();
    }

    sorted[0]?.classList.add("first");
    sorted[1]?.classList.add("second");
    sorted[2]?.classList.add("third");
    sorted[3]?.classList.add("last");

    lastOrder = newOrder;
}

 


/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    carousel();
    animateScoreBoxes();

    fetchScores();
    fetchResults();

    setInterval(fetchScores, 10000);   // score auto-update
    setInterval(fetchResults, 10000);  // result auto-update
});
