const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000", "1999", "1998", "1997", "1996", "1995", "1994", "1993", "1992"];
const selectBubble = document.getElementById("year-select-surfaces-bubble");
const selectPodium = document.getElementById("year-select-surfaces-podiums");

years.forEach(year => {
  const optionBubbleSurface = document.createElement("option");
  optionBubbleSurface.value = year;
  optionBubbleSurface.text = year;
  selectBubble.appendChild(optionBubbleSurface);

  const optionPodium = document.createElement("option");
  optionPodium.value = year;
  optionPodium.text = year;
  selectPodium.appendChild(optionPodium);
});

function updateBubbleChartForSurface() {
  const year = document.getElementById("year-select-surfaces-bubble").value;
  const surface = document.getElementById("surface-select-bubble").value;
  const circuit = document.getElementById("circuit-select-surfaces-bubble").value;
  const tournament = document.getElementById("tournament-select-surfaces-bubble").value;
  const prompt = document.getElementById('bubble-prompt-surfaces');
  const noDataPrompt = document.getElementById('bubble-prompt-no-data-surfaces');
  const svgEl = document.getElementById('bubbleChart-surfaces');

  if (year === 'Overall years' || surface === 'Select Surface' || circuit === 'Select Circuit') {
    prompt.style.display = 'flex';
    noDataPrompt.style.display = 'none';
    svgEl.style.display = 'none';
    return;
  }

  prompt.style.display = 'none';
  noDataPrompt.style.display = 'none';
  svgEl.style.display = 'block';

  let csvPath;
  if (!tournament || tournament === "" || tournament === "Overall tournaments") {
    csvPath = `data/surfaces/${year}/${circuit}/overall_goat_surfaces/wins_${surface.toLowerCase()}_${year}.csv`;
  } else {
    csvPath = `data/surfaces/${year}/${circuit}/tournament_goat/${tournament}_goat_players_on_${surface}_${year}.csv`;
  }

  d3.csv(csvPath)
    .then(function (data) {
      if (!data || data.length === 0) throw new Error("No data found");
      const bubbleData = csvToBubbleDataSurface(data, surface);
      drawBubbleChart(svgEl, bubbleData, "surfaces", tournament);
      svgEl.style.display = 'block';
      noDataPrompt.style.display = 'none';
    })
    .catch(function (error) {
      console.error("Bubble chart error:", error);
      svgEl.style.display = 'none';
      prompt.style.display = 'none';
      noDataPrompt.style.display = 'flex';
    });
}

function updatePodiumSurfaces(data, containerId = "scoreboard-podiums-surfaces", surface = "") {
  const el = document.getElementById(containerId);
  if (!data || data.length < 3) {
    el.innerHTML = '<div style="text-align:center;">Not enough data for podium</div>';
    return;
  }

  const key = surface.charAt(0).toUpperCase() + surface.slice(1).toLowerCase();
  const sorted = data.slice().sort((a, b) => +b[key] - +a[key]);
  const top3 = [sorted[1], sorted[0], sorted[2]]; // Correct order: 2nd, 1st, 3rd
  const classes = ['second', 'first', 'third'];
  const displayRanks = [2, 1, 3];

  el.classList.remove('podium-clay', 'podium-grass', 'podium-hard');
  el.classList.add(`podium-${surface.toLowerCase()}`); // ✅ FIXED

  const podiumHTML = top3.map((player, i) => `
    <div class="scoreboard__podium scoreboard__podium--${classes[i]} js-podium">
      <div class="scoreboard__podium-base scoreboard__podium-base--${classes[i]}">
        <div class="scoreboard__podium-rank">${displayRanks[i]}</div>
      </div>
      <div class="scoreboard__podium-number">${player.Winner || 'Unknown'}</div>
    </div>
  `).join('');

  el.innerHTML = podiumHTML;
}


function updateSurfacesPodiumDisplay() {
  const year = document.getElementById("year-select-surfaces-podiums").value;
  const surface = document.getElementById("surface-select-podiums").value;
  const circuit = document.getElementById("circuit-select-podiums").value;
  const tournament = document.getElementById("tournament-select-surfaces-podiums").value;
  const containerId = "scoreboard-podiums-surfaces";
  const prompt = document.getElementById("podium-placeholder-surfaces");
  const noDataPrompt = document.getElementById('podium-prompt-no-data-surfaces');

  if (year === 'Overall years' || surface === 'Select Surface' || circuit === 'Select Circuit') {
    document.getElementById(containerId).innerHTML = '';
    prompt.style.display = 'block';
    return;
  }

  prompt.style.display = 'none';
  let csvPath = tournament && tournament !== "Overall tournaments"
    ? `data/surfaces/${year}/${circuit}/tournament_goat/${tournament}_goat_players_on_${surface}_${year}.csv`
    : `data/surfaces/${year}/${circuit}/overall_goat_surfaces/wins_${surface.toLowerCase()}_${year}.csv`;


  console.log("Podium CSV path:", csvPath);

  d3.csv(csvPath)
    .then(function (data) {
      console.log("Podium data loaded:", data);
      updatePodiumSurfaces(data, containerId, surface);
    })
    .catch(function (error) {
      console.error("Podium CSV load failed:", error);
      document.getElementById(containerId).innerHTML = '<div style="text-align:center;">No data available</div>';
      if (noDataPrompt) noDataPrompt.style.display = 'block';
    });
}

// PODIUM SELECTORS
document.getElementById("year-select-surfaces-podiums").addEventListener("change", updateSurfacesPodiumDisplay);
document.getElementById("surface-select-podiums").addEventListener("change", updateSurfacesPodiumDisplay);
document.getElementById("circuit-select-podiums").addEventListener("change", updateSurfacesPodiumDisplay);
document.getElementById("tournament-select-surfaces-podiums").addEventListener("change", updateSurfacesPodiumDisplay);

// BUBBLE SELECTORS
document.getElementById("year-select-surfaces-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("surface-select-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("circuit-select-surfaces-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("tournament-select-surfaces-bubble").addEventListener("change", updateBubbleChartForSurface);

// Initial podium render
updateSurfacesPodiumDisplay();


let allTournaments = [];

fetch('data/surfaces/tournaments.json')
  .then(response => response.json())
  .then(data => {
    allTournaments = data;
    updateYearAndTournaments();
  });

function updateYearAndTournaments() {
    const year = document.getElementById('year-select-surfaces-bubble').value;
    const circuit = document.getElementById('circuit-select-surfaces-bubble').value;
    const surface = document.getElementById('surface-select-bubble').value;
    const tournamentSelect = document.getElementById('tournament-select-surfaces-bubble');
    const previousValue = tournamentSelect.value;

    tournamentSelect.innerHTML = '<option value="">Overall tournaments</option>';

    if (!year || !circuit || !surface ||
        year === 'Overall years' ||
        circuit === 'Select Circuit' ||
        surface === 'Select Surface') {
      return;
    }

    // Filter tournaments based on all three selectors
    const filtered = allTournaments.filter(t =>
      t.year === year &&
      t.circuit === circuit &&
      t.surface === surface
    );

    filtered.forEach(tour => {
      const opt = document.createElement('option');
      opt.value = tour.name;
      opt.textContent = tour.name;
      tournamentSelect.appendChild(opt);
    });

    // Try to restore previous selection if possible
    if ([...tournamentSelect.options].some(option => option.value === previousValue)) {
      tournamentSelect.value = previousValue;
    } else {
      tournamentSelect.value = "";
    }
}


document.getElementById('circuit-select-surfaces-bubble').addEventListener('change', updateYearAndTournaments);
document.getElementById('year-select-surfaces-bubble').addEventListener('change', updateYearAndTournaments);
document.getElementById('tournament-select-surfaces-bubble').addEventListener('change', updateYearAndTournaments);
document.getElementById('surface-select-bubble').addEventListener('change', updateYearAndTournaments);

document.getElementById('year-select-surfaces-bubble').dispatchEvent(new Event('change'));

function csvToBubbleDataSurface(csv, surface) {
  const key = surface.charAt(0).toUpperCase() + surface.slice(1).toLowerCase();
  return {
    name: "Players",
    children: csv
      .slice(0, 15)
      .map(d => ({
        name: d.Winner,
        value: +d[key]
      }))
  };
}



function updatePodiumTournaments() {
  const year = document.getElementById('year-select-surfaces-podiums').value;
  const circuit = document.getElementById('circuit-select-podiums').value;
  const surface = document.getElementById('surface-select-podiums').value;
  const tournamentSelect = document.getElementById('tournament-select-surfaces-podiums');
  const previousValue = tournamentSelect.value;

  tournamentSelect.innerHTML = '<option value="Overall tournaments">Overall tournaments</option>';

  if (!year || !circuit || !surface ||
      year === 'Overall years' ||
      circuit === 'Select Circuit' ||
      surface === 'Select Surface') {
    return;
  }

  const filtered = allTournaments.filter(t =>
    t.year === year &&
    t.circuit === circuit &&
    t.surface === surface
  );

  filtered.forEach(tour => {
    const opt = document.createElement('option');
    opt.value = tour.name;
    opt.textContent = tour.name;
    tournamentSelect.appendChild(opt);
  });

  if ([...tournamentSelect.options].some(option => option.value === previousValue)) {
    tournamentSelect.value = previousValue;
  } else {
    tournamentSelect.value = "Overall tournaments";
  }
}
document.getElementById('circuit-select-podiums').addEventListener('change', updatePodiumTournaments);
document.getElementById('surface-select-podiums').addEventListener('change', updatePodiumTournaments);
document.getElementById('year-select-surfaces-podiums').addEventListener('change', updatePodiumTournaments);



document.addEventListener('DOMContentLoaded', function () {
  const surfaceDropdown = document.getElementById('surface-select-podiums');
  const surfacesSection = document.getElementById('surfaces');
  const podiumContainer = document.getElementById('scoreboard-podiums-surfaces');

  let surfaceRotationInterval;
  let userHasSelectedSurface = false;

  // Define the surface themes
  const surfaceThemes = [
    { name: 'Clay', class: 'clay-theme', podiumClass: 'scoreboard__podium-base--clay' },
    { name: 'Grass', class: 'grass-theme', podiumClass: 'scoreboard__podium-base--grass' },
    { name: 'Hard', class: 'hard-theme', podiumClass: 'scoreboard__podium-base--hard' }
  ];

  /**
   * Removes all theme classes from background and podiums
   */
  const headerInner = document.querySelector('.surfaces-header-inner');

  function clearThemes() {
    surfacesSection.classList.remove(...surfaceThemes.map(t => t.class));
    const podiums = podiumContainer.querySelectorAll('.scoreboard__podium-base');
    podiums.forEach(podium =>
      podium.classList.remove(...surfaceThemes.map(t => t.podiumClass))
    );
    headerInner.classList.remove('clay', 'grass', 'hard'); // ← fix for title background
  }

  function applyTheme(theme) {
    surfacesSection.classList.add(theme.class);
    const podiums = podiumContainer.querySelectorAll('.scoreboard__podium-base');
    podiums.forEach(podium => podium.classList.add(theme.podiumClass));
    headerInner.classList.add(theme.name.toLowerCase()); // ← fix for title background
  }


  /**
   * Rotate themes every 3 seconds
   */
  function rotateSurfaceBackground() {
    let index = 0;

    surfaceRotationInterval = setInterval(() => {
      if (userHasSelectedSurface) {
        clearInterval(surfaceRotationInterval);
        return;
      }

      clearThemes();
      applyTheme(surfaceThemes[index]);

      index = (index + 1) % surfaceThemes.length;
    }, 3000);
  }

  rotateSurfaceBackground(); // Begin rotation on load

  /**
   * When user selects a surface, stop rotation and apply selection
   */
  surfaceDropdown.addEventListener('change', function () {
    const selectedSurface = this.value;

    // If user picks the default option, resume rotation
    if (selectedSurface === 'Select Surface') {
      userHasSelectedSurface = false;
      clearThemes();
      rotateSurfaceBackground();
      return;
    }

    // Otherwise apply the selected theme and stop rotation
    const selectedTheme = surfaceThemes.find(t => t.name === selectedSurface);
    if (!selectedTheme) return;

    userHasSelectedSurface = true;
    clearInterval(surfaceRotationInterval);
    clearThemes();
    applyTheme(selectedTheme);
  });
});

const testPath = "data/surfaces/2023/atp/overall_goat_surfaces/wins_clay_2023.csv";
console.log("Trying path:", testPath);

fetch(testPath)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  })
  .then(text => {
    console.log("✅ CSV content loaded:");
    console.log(text.slice(0, 200)); // show preview
  })
  .catch(err => {
    console.error("❌ Fetch failed:", err.message);
  });
