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

const globalSvg = d3.select("#bubbleChart-global");
let lastGlobalYear = null;
let lastGlobalData = null;

function loadGlobalData(year) {
  if (!year || year === "Select Year") {
    showGlobalPlaceholder();
    return;
  }

  if (year === lastGlobalYear && lastGlobalData) {
    updateGlobalBubbleChart(lastGlobalData);
    return;
  }

  const filePath = `../data/general/top15_jsons/top15_overall_${year}.json`;
  console.log("Trying to load:", filePath);

  d3.json(filePath).then(data => {
    if (!data || data.length === 0) throw new Error("Empty data");

    lastGlobalYear = year;
    lastGlobalData = data;

    updateGlobalBubbleChart(data);
  }).catch(() => {
    globalSvg.selectAll("*").remove();
    document.getElementById("scoreboard-global").innerHTML =
      `<div class="bubble-prompt" style="text-align: center;">
        <p><strong style="color: #c0392b;">No data found for ${year} 🐐</strong></p>
      </div>`;
  });
}

function showGlobalPlaceholder() {
  document.getElementById("bubble-prompt-global").style.display = "block";
  document.getElementById("bubbleChart-global").style.display = "none";
  globalSvg.selectAll("*").remove();
}

function updateGlobalBubbleChart(data) {
  document.getElementById("bubble-prompt-global").style.display = "none";
  document.getElementById("bubbleChart-global").style.display = "block";
  globalSvg.selectAll("*").remove();

  const width = +globalSvg.attr("width");
  const height = +globalSvg.attr("height");

  const pack = d3.pack().size([width, height]).padding(5);
  const root = d3.hierarchy({ children: data }).sum(d => Math.pow(d.size, 1.5));
  const nodes = pack(root).leaves();
  const color = d3.scaleOrdinal(d3.schemeSet2);

  const bubbles = globalSvg.selectAll("g")
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


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year-select-global-bubble").addEventListener("change", function () {
    const year = this.value;
    loadGlobalData(year);
  });
});
