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

const tournamentSvg = d3.select("#bubbleChart-tournament");
let tournamentDataCache = null;

function loadTournamentJSON() {
  const filePath = `../data/tournaments/top15_per_elite_tournament_per_year.json`;
  console.log("Loading full tournament dataset:", filePath);

  return d3.json(filePath).then(data => {
    tournamentDataCache = data;
    return data;
  }).catch(error => {
    console.error("Failed to load tournament data:", error);
    return null;
  });
}

function loadTournamentData(year, tournament) {
  if (!year || year === "Select Year" || !tournament || tournament === "Select Tournament") {
    showTournamentPlaceholder();
    return;
  }

  if (!tournamentDataCache) {
    showTournamentPlaceholder();
    return;
  }

  const yearData = tournamentDataCache[year];
  if (!yearData || !yearData[tournament]) {
    showTournamentPlaceholder();
    document.getElementById("scoreboard-tournament").innerHTML =
      `<div class="bubble-prompt" style="text-align: center;">
        <p><strong style="color: #c0392b;">No data for ${tournament} in ${year} 🐐</strong></p>
      </div>`;
    return;
  }

  updateTournamentBubbleChart(yearData[tournament]);
}

function showTournamentPlaceholder() {
  document.getElementById("bubble-prompt-tournament").style.display = "block";
  document.getElementById("bubbleChart-tournament").style.display = "none";
  tournamentSvg.selectAll("*").remove();
  document.getElementById("scoreboard-tournament").innerHTML = "";
}

function updateTournamentBubbleChart(data) {
  console.log('Updating Tournament Bubble Chart');
  document.getElementById("bubble-prompt-tournament").style.display = "none";
  document.getElementById("bubbleChart-tournament").style.display = "block";
  tournamentSvg.selectAll("*").remove();

  const width = +tournamentSvg.attr("width");
  const height = +tournamentSvg.attr("height");

  const pack = d3.pack().size([width, height]).padding(5);
  const root = d3.hierarchy({ children: data }).sum(d => Math.pow(d.size, 1.5));
  const nodes = pack(root).leaves();
  const color = d3.scaleOrdinal(d3.schemeSet2);

  const bubbles = tournamentSvg.selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  bubbles.append("circle")
    .attr("r", d => d.r)
    .attr("fill", (d, i) => color(i))
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", d.r * 1.15);

      const index = data.findIndex(p => p.name === d.data.name);
      const rank = index >= 0 ? index + 1 : "N/A";

      d3.select("#tooltip")
        .style("display", "block")
        .html(`<strong>${d.data.name}</strong><br>Score: ${d.data.size}<br>Rank: #${rank}`);
    })
    .on("mousemove", function (event) {
      d3.select("#tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", d => d.r);
      d3.select("#tooltip").style("display", "none");
    });

  bubbles.append("text")
    .attr("dy", ".3em")
    .attr("text-anchor", "middle")
    .style("font-size", d => Math.max(d.r / 3.5, 10))
    .text(d => d.data.name.split(" ")[0]);
}

// Sync dropdowns
document.addEventListener("DOMContentLoaded", async function () {
  await loadTournamentJSON();

  const yearSelect = document.getElementById("year-select-tournament-bubble");
  const tournamentSelect = document.getElementById("tournament-name-select-bubble");

  function handleDropdownChange() {
    const year = yearSelect.value;
    const tournament = tournamentSelect.value;
    loadTournamentData(year, tournament);
  }

  yearSelect.addEventListener("change", handleDropdownChange);
  tournamentSelect.addEventListener("change", handleDropdownChange);
});
