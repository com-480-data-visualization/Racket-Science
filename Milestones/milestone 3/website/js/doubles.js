const bubbleSvg = d3.select("#bubbleChart-doubles");
let lastYear = null;
let lastSurface = null;
let lastData = null;

function loadDoublesData(year, surface) {
  if (!year || !surface || year === "Select Year" || surface === "Select Surface") {
    showPlaceholder();
    return;
  }

  if (year === lastYear && surface === lastSurface && lastData) {
    updateBubbleChart(lastData);
    updatePodium(lastData);
    return;
  }

  const filePath = `data/doubles/doubles_${year}_${surface}.json`;
  console.log("Trying to load:", filePath);

  d3.json(filePath).then(data => {
    if (!data || data.length === 0) throw new Error("Empty data");

    lastYear = year;
    lastSurface = surface;
    lastData = data;

    updateBubbleChart(data);
    updatePodium(data);
  }).catch(() => {
    bubbleSvg.selectAll("*").remove();
    document.getElementById("scoreboard-doubles").innerHTML =
      `<div class="bubble-prompt" style="text-align: center;">
        <p><strong style="color: #c0392b;">No data found for ${year} on ${surface} 🐐</strong></p>
      </div>`;
  });
}

function showPlaceholder() {
  document.getElementById("bubble-placeholder-doubles").style.display = "block";
  document.getElementById("bubbleChart-doubles").style.display = "none";
  document.getElementById("podium-placeholder-doubles").style.display = "block";
  bubbleSvg.selectAll("*").remove();
  document.getElementById("scoreboard-doubles").innerHTML = "";
}

function updateBubbleChart(data) {
  document.getElementById("bubble-placeholder-doubles").style.display = "none";
  document.getElementById("bubbleChart-doubles").style.display = "block";
  bubbleSvg.selectAll("*").remove();

  const width = +bubbleSvg.attr("width");
  const height = +bubbleSvg.attr("height");

  const pack = d3.pack().size([width, height]).padding(5);
  const root = d3.hierarchy({ children: data }).sum(d => Math.pow(d.size, 1.5));
  const nodes = pack(root).leaves();
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const bubbles = bubbleSvg.selectAll("g")
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
        .html(`<strong>${d.data.name}</strong><br>Wins: ${d.data.size}<br>Rank: #${rank}`);
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

function updatePodium(data) {
  const top3 = [data[1], data[0], data[2]];
    const classes = ['second', 'first', 'third'];
    const displayRanks = [2, 1, 3]; // Actual podium labels to display


    const podiumHTML = top3.map((player, i) => `
    <div class="scoreboard__podium scoreboard__podium--${classes[i]} js-podium">
        <div class="scoreboard__podium-base scoreboard__podium-base--${classes[i]}">
        <div class="scoreboard__podium-rank">${displayRanks[i]}</div>
        </div>
        <div class="scoreboard__podium-number">${player.name}</div>
    </div>
    `).join('');


  const scoreboard = document.getElementById("scoreboard-doubles");
  scoreboard.className = `scoreboard__podiums podium-${lastSurface}`;
  scoreboard.innerHTML = podiumHTML;

  document.getElementById("podium-placeholder-doubles").style.display = "none";
}



function setupDoublesListeners() {
  const podiumYear = document.getElementById("year-select2-podium");
  const podiumSurface = document.getElementById("surface-select-doubles-podium");
  const bubbleYear = document.getElementById("year-select2-bubbles");
  const bubbleSurface = document.getElementById("surface-select-doubles-bubbles");

  function getValues(y, s) {
    const year = y.value;
    const surface = s.value;
    loadDoublesData(year, surface);
    handleBackgroundUpdate();
  }

  podiumYear.addEventListener("change", () => getValues(podiumYear, podiumSurface));
  podiumSurface.addEventListener("change", () => getValues(podiumYear, podiumSurface));
  bubbleYear.addEventListener("change", () => getValues(bubbleYear, bubbleSurface));
  bubbleSurface.addEventListener("change", () => getValues(bubbleYear, bubbleSurface));
}

let backgroundInterval = null;
let currentImageIndex = 0;
const doublesSection = document.getElementById("doubles");
const backgroundImages = [
  "images/clay-court-doubles.jpg",
  "images/grass-court-doubles.jpg",
  "images/hard-court-doubles.jpg"
];

function rotateBackground() {
  stopBackgroundRotation();
  doublesSection.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
  doublesSection.style.backgroundSize = "cover";
  doublesSection.style.backgroundPosition = "center";

  backgroundInterval = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    doublesSection.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
    doublesSection.style.backgroundSize = "cover";
    doublesSection.style.backgroundPosition = "center";
  }, 3000);
}

function stopBackgroundRotation() {
  if (backgroundInterval !== null) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
}

function handleBackgroundUpdate() {
  const surfaceSelections = [
    document.getElementById("surface-select-doubles-podium").value,
    document.getElementById("surface-select-doubles-bubbles").value
  ];

  const surfaceSelected = surfaceSelections.some(value => value !== "Select Surface");
  const selectedSurface = surfaceSelections.find(value => value !== "Select Surface");

  if (!surfaceSelected) {
    rotateBackground();
  } else {
    stopBackgroundRotation();
    const surfaceImage = `images/${selectedSurface}-court-doubles.jpg`;
    doublesSection.style.backgroundImage = `url('${surfaceImage}')`;
    doublesSection.style.backgroundSize = "cover";
    doublesSection.style.backgroundPosition = "center";
  }

  // ✅ Add this block HERE:
  const headerInner = document.querySelector(".doubles-header-inner");
  if (headerInner) {
    headerInner.classList.remove("clay", "grass", "hard");
    if (surfaceSelected && selectedSurface) {
      headerInner.classList.add(selectedSurface);
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  setupDoublesListeners();
  showPlaceholder();

  const surface1 = document.getElementById("surface-select-doubles-podium").value;
  const surface2 = document.getElementById("surface-select-doubles-bubbles").value;
  const surfaceSelected = (surface1 !== "Select Surface" || surface2 !== "Select Surface");

  if (!surfaceSelected) {
    rotateBackground();
  } else {
    handleBackgroundUpdate();
  }
});
