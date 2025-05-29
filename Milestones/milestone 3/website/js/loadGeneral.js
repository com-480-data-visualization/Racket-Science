document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById('year-select');
  const scoreboard = document.getElementById('scoreboard-global');

  async function fetchPodiumData(filePath, key = null) {
    const response = await fetch(filePath);
    const data = await response.json();
    return key ? data[key] : data;
  }

  function renderPodium(players) {
    if (!players || players.length === 0) {
      scoreboard.innerHTML = '<p>No data available.</p>';
      return;
    }

    // Custom order: 2nd, 1st, 3rd
    const order = [1, 0, 2];
    const medalClasses = ['silver', 'gold', 'bronze'];

    scoreboard.innerHTML = order.map((i, idx) => {
      const player = players[i];
      const medalClass = medalClasses[idx];
      const rank = order[idx] + 1;
      return `
        <div class="scoreboard__podium">
          <div class="photo-container">
            <img src="${player.img}" alt="${player.name}" class="podium-photo">
            <div class="medal ${medalClass}">${rank}</div>
          </div>
          <div class="scoreboard__podium-number">${player.name}</div>
        </div>
      `;
    }).join('');
  }

  async function updatePodium(year) {
    try {
      if (year === "Overall years") {
        const data = await fetchPodiumData("../data/general/top3_overall.json");
        const players = data.global.overall;
        renderPodium(players);
      } else {
        const data = await fetchPodiumData("../data/general/top3_per_year.json");
        const players = data.global[year].overall;
        renderPodium(players);
      }
    } catch (err) {
      console.error("Error loading podium data:", err);
      scoreboard.innerHTML = "<p>Error loading data.</p>";
    }
  }

  // Initial load
  updatePodium(yearSelect.value);

  // Update on change
  yearSelect.addEventListener("change", () => {
    updatePodium(yearSelect.value);
  });
});
