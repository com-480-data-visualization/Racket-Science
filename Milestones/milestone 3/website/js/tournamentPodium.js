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
    const medalClasses = ['silver', 'gold', 'bronze'];
    const baseClasses = ['second', 'first', 'third'];
    const heights = [200, 250, 150] 

    scoreboard.innerHTML = order.map((i, idx) => {
      const player = players[i];
      const medalClass = medalClasses[idx];
      const height = heights[idx]
      const rank = order[idx] + 1;
      const baseClass = baseClasses[idx];
      return `
      <div class="scoreboard__podium js-podium" data-height="${height}px">
        <div class="scoreboard__podium-base scoreboard__podium-base--${baseClass}">
          <div class="scoreboard__podium-rank">${rank}</div>
        </div>
        <div class="scoreboard__podium-number">
          ${player.name}
        </div>
      </div>
    `;
    }).join('');
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
      } else if (tournament === "All") {
        // All tournaments, specific year
        const data = await fetchData("../data/tournaments/top3_per_year.json");
        players = data[year];
      } else {
        // Specific tournament and year
        const data = await fetchData("../data/tournaments/top3_per_elite_tournament_per_year.json");
        players = data[year]?.[tournament] || [];
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
