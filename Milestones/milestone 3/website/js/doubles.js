const bubbleSvg = d3.select("#bubbleChart-doubles");
let lastYear = null;
let lastSurface = null;
let lastData = null;
let bubbleChartDrawn = false;

let selectedYear = null;
let selectedSurface = null;

function loadDoublesData(year = selectedYear, surface = selectedSurface) {
  if (!year || !surface || year === "Select Year" || surface === "Select Surface") {
    showPlaceholder();
    return;
  }

  // If data already matches, just refresh visuals
  if (year === lastYear && surface === lastSurface && lastData) {
    refreshVisuals();
    return;
  }

  const filePath = `data/doubles/doubles_${year}_${surface}.json`;
  console.log("Trying to load:", filePath);

  d3.json(filePath).then(data => {
    if (!data || data.length === 0) throw new Error("Empty data");

    lastYear = year;
    lastSurface = surface;
    lastData = data;

    bubbleChartDrawn = false; // Set false only for new data
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
  document.getElementById("podium-placeholder-doubles").style.display = "block";
  document.getElementById("scoreboard-doubles").innerHTML = "";
  bubbleChartDrawn = false;
}

function updateBubbleChart(data) {
  const chartEl = document.getElementById("bubbleChart-doubles");
  const placeholderEl = document.getElementById("bubble-placeholder-doubles");

  if (bubbleChartDrawn && chartEl.style.display === "block") return;

  placeholderEl.style.display = "none";
  chartEl.style.display = "block";

  let width = bubbleSvg.node().clientWidth;
  let height = bubbleSvg.node().clientHeight;

  // Defer drawing if size is not ready
  if (width === 0 || height === 0) {
    setTimeout(() => updateBubbleChart(data), 100);
    return;
  }

  bubbleSvg.selectAll("*").remove();

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

  // ✅ Only set this after successful draw
  bubbleChartDrawn = true;
}


function updatePodium(data) {
  const top3 = [data[1], data[0], data[2]];
  const classes = ['second', 'first', 'third'];
  const displayRanks = [2, 1, 3];

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

function refreshVisuals() {
  if (lastData) {
    updateBubbleChart(lastData);
    updatePodium(lastData);
  }
}

function setupDoublesListeners() {
  const podiumYear = document.getElementById("year-select2-podium");
  const podiumSurface = document.getElementById("surface-select-doubles-podium");
  const bubbleYear = document.getElementById("year-select2-bubbles");
  const bubbleSurface = document.getElementById("surface-select-doubles-bubbles");

  function getValues(yearEl, surfaceEl) {
    selectedYear = yearEl.value;
    selectedSurface = surfaceEl.value;

    podiumYear.value = selectedYear;
    podiumSurface.value = selectedSurface;
    bubbleYear.value = selectedYear;
    bubbleSurface.value = selectedSurface;

    loadDoublesData(selectedYear, selectedSurface);
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
  const headerInner = document.querySelector(".doubles-header-inner");

  updateRotationBackgroundAndTitle();

  backgroundInterval = setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    updateRotationBackgroundAndTitle();
  }, 3000);

  function updateRotationBackgroundAndTitle() {
    const surfaceTypes = ['clay', 'grass', 'hard'];
    const currentSurface = surfaceTypes[currentImageIndex];

    doublesSection.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
    doublesSection.style.backgroundSize = "cover";
    doublesSection.style.backgroundPosition = "center";

    if (headerInner) {
      headerInner.classList.remove("clay", "grass", "hard");
      headerInner.classList.add(currentSurface);
    }
  }
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

  const bubbleSection = document.getElementById("over_the_years-doubles");
  const bubbleChartContainer = document.getElementById("bubbleChart-doubles");

  // IntersectionObserver for bubble section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = bubbleChartContainer.clientWidth;
        const height = bubbleChartContainer.clientHeight;

        if (
          width > 0 && height > 0 &&
          lastData &&
          selectedYear && selectedSurface &&
          selectedYear !== "Select Year" && selectedSurface !== "Select Surface"
        ) {
          updateBubbleChart(lastData);
        }
      }
    });
  }, {
    root: null,
    threshold: 0.4
  });

  observer.observe(bubbleSection);

  // ✅ MutationObserver for chart reappearance
  const visibilityObserver = new MutationObserver(() => {
    const isVisible = bubbleChartContainer.offsetParent !== null;
    const width = bubbleChartContainer.clientWidth;
    const height = bubbleChartContainer.clientHeight;

    if (
      isVisible &&
      width > 0 &&
      height > 0 &&
      !bubbleChartDrawn &&
      lastData &&
      selectedYear && selectedSurface &&
      selectedYear !== "Select Year" && selectedSurface !== "Select Surface"
    ) {
      updateBubbleChart(lastData);
    }
  });

  visibilityObserver.observe(bubbleChartContainer, {
    attributes: true,
    attributeFilter: ["style", "class"]
  });
});
