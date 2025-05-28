
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
  const prompt = document.getElementById('bubble-prompt');
  const noDataPrompt = document.getElementById('bubble-prompt-no-data');
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
