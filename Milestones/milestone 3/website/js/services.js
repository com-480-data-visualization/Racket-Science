const serviceYears = [
  "2024","2023","2022","2021","2020","2019","2018","2017","2016",
  "2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005",
  "2004","2003","2002","2001","2000"
];

const serviceSelectBubble = document.getElementById("year-select-services-bubble");
const serviceSelectPodium = document.getElementById("year-select-services-podium");

serviceYears.forEach(year => {
  const optionBubbleServices = document.createElement("option");
  optionBubbleServices.value = year;
  optionBubbleServices.text = year;
  serviceSelectBubble.appendChild(optionBubbleServices);

  const optionPodium = document.createElement("option");
  optionPodium.value = year;
  optionPodium.text = year;
  serviceSelectPodium.appendChild(optionPodium);
});

function getServiceCsvPath(year, category) {
  if (year === "overall_years") {
    return `data/services/overall_years_${category}.csv`;
  }
  return `data/services/${year}_${category}.csv`;
}

function updateBubbleChartForServices() {
  const year = document.getElementById("year-select-services-bubble").value;
  const category = document.getElementById("category-select-services-bubble").value;
  const prompt = document.getElementById('bubble-prompt-services');
  const noDataPrompt = document.getElementById('bubble-prompt-no-data-services');
  const svgEl = document.getElementById('bubbleChart-services');

  if (!category || category === 'Select a Category') {
    prompt.style.display = 'flex';
    noDataPrompt.style.display = 'none';
    svgEl.style.display = 'none';
    return;
  }

  prompt.style.display = 'none';
  noDataPrompt.style.display = 'none';
  svgEl.style.display = 'block';

  const csvPath = getServiceCsvPath(year, category);

  d3.csv(csvPath)
    .then(function(data) {
      if (!data || data.length === 0) {
        throw new Error("No data found");
      }
      const bubbleData = csvToBubbleDataServices(data, category);
      drawBubbleChart(svgEl, bubbleData, "services", category);
      svgEl.style.display = 'block';
      noDataPrompt.style.display = 'none';
    })
    .catch(function(error) {
      svgEl.style.display = 'none';
      prompt.style.display = 'none';
      noDataPrompt.style.display = 'flex';
    });
}

function csvToBubbleDataServices(csv, valueCol) {
    
    const values = csv.slice(0, 15).map(d => +d[valueCol]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return {
        name: "Players",
        children: csv
        .slice(0, 15)
        .map(d => ({
            name: d.Player,
            value: amplifyServiceValue(d[valueCol], min, max),
            percentage: +(d[valueCol]*100).toFixed(2), 
            category: valueCol, 
            nb_matches: d['num_matches']
        }))
    };
}

function amplifyServiceValue(value, min, max) {
    return 10 + 90 * (value - min) / (max - min);
}


function getServiceCsvPath(year, category) {
  if (!category) return null;
  if (!year) return `data/services/overall_years_${category}.csv`;
  return `data/services/${year}_${category}.csv`;
}

function updatePodiumServices(data, containerId = "scoreboard-podiums-services", category = "") {
  const el = document.getElementById(containerId);
  
  if (!data || data.length < 3) {
    el.innerHTML = '<div style="text-align:center;">Not enough data for podium</div>';
    return;
  }
  
  const sorted = data.slice().sort((a, b) => +b[category] - +a[category]);
  const top3 = [sorted[1], sorted[0], sorted[2]];
  const classes = ['second', 'first', 'third'];
  const displayRanks = [2, 1, 3];
  
  const podiumHTML = top3.map((player, i) => `
  <div class="scoreboard__podium scoreboard__podium--${classes[i]} js-podium">
  <div class="scoreboard__podium-base scoreboard__podium-base--${classes[i]}">
  <div class="scoreboard__podium-rank">${displayRanks[i]}</div>
  </div>
  <div class="scoreboard__podium-number">${player.Player}</div>
  </div>
  `).join('');
  el.innerHTML = podiumHTML;
}


function updateServicesPodiumDisplay() {
  const year = document.getElementById("year-select-services-podium").value;
  const category = document.getElementById("category-select-services-podium").value;
  const containerId = "scoreboard-podiums-services";
  const placeholder = document.getElementById("podium-placeholder-services");
  
  if (!category || category === 'Select a Category') {
    document.getElementById(containerId).innerHTML = '';
    placeholder.style.display = 'block';
    return;
  }
  placeholder.style.display = 'none';
  
  const csvPath = getServiceCsvPath(year, category);
  if (!csvPath) {
    document.getElementById(containerId).innerHTML = '<div style="text-align:center;">No data</div>';
    return;
  }
  
  
  d3.csv(csvPath).then(function(data) {
    if (!data || data.length < 3) {
      updatePodiumServices(null, containerId, category);
      return;
    }
    updatePodiumServices(data, containerId, category);
  })
}


document.getElementById("year-select-services-podium").addEventListener("change", updateServicesPodiumDisplay);
document.getElementById("category-select-services-podium").addEventListener("change", updateServicesPodiumDisplay);
document.getElementById('year-select-services-podium').dispatchEvent(new Event('change'));

document.getElementById("year-select-services-bubble").addEventListener("change", updateBubbleChartForServices);
document.getElementById("category-select-services-bubble").addEventListener("change", updateBubbleChartForServices);
document.getElementById('year-select-services-bubble').dispatchEvent(new Event('change'));

updateServicesPodiumDisplay();
const serviceBackgroundImages = [
  'images/service_clay.png',
  'images/service_grass.png',
  'images/service_hard.png'
];
const surfaceTypes = ['clay', 'grass', 'hard'];
const surfaceTitles = [
  "Services GOAT",
  "Services GOAT",
  "Services GOAT"
];

let currentServiceImageIndex = 0;
let serviceBackgroundInterval = null;

const servicesSection = document.getElementById("services");
const headerInner = document.querySelector(".services-header-inner");
const servicesTitle = document.getElementById("services-title");

function rotateServiceBackground() {
  updateServiceBackgroundAndTitle();
  serviceBackgroundInterval = setInterval(() => {
    currentServiceImageIndex = (currentServiceImageIndex + 1) % serviceBackgroundImages.length;
    updateServiceBackgroundAndTitle();
  }, 3000);
}

function updateServiceBackgroundAndTitle() {
  // Update background image
  servicesSection.style.backgroundImage = `url('${serviceBackgroundImages[currentServiceImageIndex]}')`;
  servicesSection.style.backgroundSize = "cover";
  servicesSection.style.backgroundPosition = "center";

  // Update header color/class
  if (headerInner) {
    headerInner.classList.remove("clay", "grass", "hard");
    headerInner.classList.add(surfaceTypes[currentServiceImageIndex]);
  }

  // Update the title text (optional)
  if (servicesTitle) {
    servicesTitle.textContent = surfaceTitles[currentServiceImageIndex];
  }
}

// Start rotation on page load
rotateServiceBackground();
