document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById('tournament-year-select');
  const tournamentSelect = document.getElementById('tournament-name-select');
  const scoreboard = document.getElementById('scoreboard-tournament');

  async function fetchData(filePath) {
    const response = await fetch(filePath);
    return await response.json();
  }

  function renderPodium(players) {
    if (!players || players.length === 0) {
      scoreboard.innerHTML = '<p>No data available.</p>';
      return;
    }

    const order = [1, 0, 2];
    const ranks = [2, 1, 3];
    const baseClasses = ['second', 'first', 'third'];
    const heights = [200, 250, 150] 

    const podiumHtml = order.map((i, idx) => {
    const player = players[i];
    const rank = ranks[idx];
    const baseClass = baseClasses[idx];
    const height = heights[idx];

    return `
      <div class="scoreboard__podium scoreboard__podium--${baseClass} js-podium" data-height="${height}px">
        <div class="scoreboard__podium-base scoreboard__podium-base--${baseClass}">
          <div class="scoreboard__podium-rank">${rank}</div>
        </div>
        <div class="scoreboard__podium-number">${player.name}</div>
      </div>
    `;
  }).join('');

  scoreboard.innerHTML = `
    <div class="scoreboard__podiums">
      ${podiumHtml}
    </div>
  `;
      
  }

  async function updatePodium() {
    const year = yearSelect.value;
    const tournament = tournamentSelect.value;

    try {
      let players;

      if (year === "Overall years" && tournament === "All") {
        // All tournaments, overall years
        const data = await fetchData("../data/tournaments/top3_overall.json");
        players = data;
      } else if (year !== "Overall years" && tournament === "All") {
        // All tournaments, specific year
        const data = await fetchData("../data/tournaments/top3_per_year.json");
        players = data[year];
      } else if (year !== "Overall years" && tournament !== "All") {
        // Specific tournament and year
        const data = await fetchData("../data/tournaments/top3_per_elite_tournament_per_year.json");
        players = data[year]?.[tournament] || [];
      } else if (year === "Overall years" && tournament !== "All") {
        // Specific tournament, all years
        const data = await fetchData("../data/tournaments/top3_per_elite_tournament_overall.json");
        players = data[tournament];
      }

      renderPodium(players);
    } catch (err) {
      console.error("Error loading tournament podium data:", err);
      scoreboard.innerHTML = "<p>Error loading data.</p>";
    }
  }

  // Initial load
  updatePodium();

  // Update on change
  yearSelect.addEventListener("change", updatePodium);
  tournamentSelect.addEventListener("change", updatePodium);
});