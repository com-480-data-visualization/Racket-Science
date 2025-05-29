
function getSurfaceCsvPath(year, surface, circuit) {
  let surfaceLower = surface.toLowerCase();
  return `results/surfaces/${year}/${circuit}/overall_goat_surfaces/wins_${surfaceLower}_${year}.csv`;
}

function updateBubbleChartForSurface() {
  const year = document.getElementById("year-select-surfaces-bubble").value; 
  const surface = document.getElementById("surface-select-bubble").value;
  const circuit = document.getElementById("circuit-select-bubble").value;
  const tournament = document.getElementById("tournament-select-surfaces-bubbles").value;
  console.log('hey')
  console.log(tournament)
  console.log('hey')
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
    csvPath = `/results/surfaces/${year}/${circuit}/overall_goat_surfaces/wins_${surface.toLowerCase()}_${year}.csv`;
  } else {
    csvPath = `/results/surfaces/${year}/${circuit}/tournament_goat/${tournament}_goat_players_on_${surface}_${year}.csv`;
  }

  d3.csv(csvPath)
    .then(function(data) {
      if (!data || data.length === 0) {
        throw new Error("No data found");
      }
      const bubbleData = csvToBubbleData(data, surface);
      console.log(tournament)
      drawBubbleChart(svgEl, bubbleData, "surfaces", tournament);
      svgEl.style.display = 'block';
      noDataPrompt.style.display = 'none';
    })
    .catch(function(error) {
      svgEl.style.display = 'none';
      prompt.style.display = 'none';
      noDataPrompt.style.display = 'flex';
    });
}



document.getElementById("year-select-surfaces-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("surface-select-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("circuit-select-bubble").addEventListener("change", updateBubbleChartForSurface);
document.getElementById("tournament-select-surfaces-bubbles").addEventListener("change", updateBubbleChartForSurface);



function updateTournaments() {
  const year = document.getElementById('year-select-surfaces-bubble').value;
  const circuit = document.getElementById('circuit-select-bubble').value;
  const tournamentSelect = document.getElementById('tournament-select-surfaces-bubbles');

  // Save the current selection
  const previousValue = tournamentSelect.value;

  tournamentSelect.innerHTML = '<option value="">Overall tournaments</option>';
  if (!year || !circuit || year === 'Overall years' || circuit === 'Select Circuit') {
    return; 
  }

  const filePath = `/results/surfaces/${year}/${circuit}/tournament_list/tournaments_${year}.json`;

  fetch(filePath)
    .then(response => {
      if (!response.ok) throw new Error("Tournament file not found");
      return response.json();
    })
    .then(tournaments => {
      tournaments.forEach(tour => {
        const opt = document.createElement('option');
        opt.value = tour;
        opt.textContent = tour;
        tournamentSelect.appendChild(opt);
      });
      if ([...tournamentSelect.options].some(option => option.value === previousValue)) {
        tournamentSelect.value = previousValue;
      } else {
        tournamentSelect.value = "";
      }
    })
    .catch(error => {
      // Optionally handle errors
    });
}

document.getElementById('year-select-surfaces-bubble').addEventListener('change', updateTournaments);
document.getElementById('tournament-select-surfaces-bubbles').addEventListener('change', updateTournaments);

document.getElementById('year-select-surfaces-bubble').dispatchEvent(new Event('change'));

function csvToBubbleData(csv, valueCol) {
  return {
    name: "Players",
    children: csv
    .slice(0, 15)
    .map(d => ({
      name: d.Winner,
      value: +d[valueCol]
    }))
  };
}


/**
 * Surface-Specific Theming 
 * Dynamically applies themed backgrounds and podium styles for:
 * - Clay
 * - Grass
 * - Hard
 *
 * Also rotates these themes every 4 seconds by default
 * until the user makes a surface selection.
 */

document.addEventListener('DOMContentLoaded', function () {
  const surfaceDropdown = document.getElementById('surface-select-podiums');
  const surfacesSection = document.getElementById('surfaces');
  const podiumBases = document.querySelectorAll('#podium-surfaces .scoreboard__podium-base');

  let surfaceRotationInterval;
  let userHasSelectedSurface = false;

  // List of themes and their CSS class suffixes
  const surfaceThemes = [
    { name: 'Clay', class: 'clay-theme', podiumClass: 'scoreboard__podium-base--clay' },
    { name: 'Grass', class: 'grass-theme', podiumClass: 'scoreboard__podium-base--grass' },
    { name: 'Hard', class: 'hard-theme', podiumClass: 'scoreboard__podium-base--hard' }
  ];

  /**
   * Rotate background and podium themes every 4 seconds until user selection
   */
  function rotateSurfaceBackground() {
    let index = 0;

    surfaceRotationInterval = setInterval(() => {
      if (userHasSelectedSurface) {
        clearInterval(surfaceRotationInterval);
        return;
      }

      // Remove all themed classes
      surfacesSection.classList.remove(...surfaceThemes.map(t => t.class));
      podiumBases.forEach(podium =>
        podium.classList.remove(...surfaceThemes.map(t => t.podiumClass))
      );

      // Apply the current theme
      const current = surfaceThemes[index];
      surfacesSection.classList.add(current.class);
      podiumBases.forEach(podium => podium.classList.add(current.podiumClass));

      index = (index + 1) % surfaceThemes.length;
    }, 4000);
  }

  rotateSurfaceBackground(); // Start rotation on page load

  /**
   * When user selects a surface manually, stop rotation and apply theme
   */
  surfaceDropdown.addEventListener('change', function () {
    const selectedSurface = this.value;
    userHasSelectedSurface = true; // 🛑 Stop the rotation
    clearInterval(surfaceRotationInterval);

    // Reset all classes first
    surfacesSection.classList.remove(...surfaceThemes.map(t => t.class));
    podiumBases.forEach(podium =>
      podium.classList.remove(...surfaceThemes.map(t => t.podiumClass))
    );

    // Apply selected theme
    const selectedTheme = surfaceThemes.find(t => t.name === selectedSurface);
    if (selectedTheme) {
      surfacesSection.classList.add(selectedTheme.class);
      podiumBases.forEach(podium => podium.classList.add(selectedTheme.podiumClass));
    }
  });
});

