function getNetCsvPath(circuit, category, subcategory, year) {
  let basePath = `data/net_points/${circuit}/${category}/${subcategory}`;

  if ((!year || year === "" || year === 'Select year')) {
    return `${basePath}/overall_net_goats.csv`;
  } else if (year && year !== "" && year !== 'Select year') {
    return `${basePath}/net_goats_by_year/net_goats_${year}.csv`;
  }
}


function updateBubbleChartForNet() {
    const circuit = document.getElementById('circuit-select-net-bubble').value;
    const category = document.getElementById('category-select-net-bubble').value;
    const subcategory = document.getElementById('subcategory-select-net-bubble').value;
    const year = document.getElementById('year-select-net-bubble').value;
    const prompt = document.getElementById('bubble-prompt-net');
    console.log('this is the prompt', document)
    const noDataPrompt = document.getElementById('bubble-prompt-no-data-net');
    const svgEl = document.getElementById('bubbleChart-net');

  if (circuit === 'Select Circuit') {
    prompt.style.display = 'flex';
    noDataPrompt.style.display = 'none';
    svgEl.style.display = 'none';
    return;
  }

  prompt.style.display = 'none';
  noDataPrompt.style.display = 'none';
  svgEl.style.display = 'block';

  const csvPath = getNetCsvPath(circuit, category, subcategory, year);
  console.log('csv path')
  console.log(csvPath)
  d3.csv(csvPath)
    .then(function(data) {
      if (!data || data.length === 0) throw new Error("No data found");
      const bubbleData = csvToBubbleDataNet(data, subcategory); 
      drawBubbleChart(svgEl, bubbleData, "net");
      svgEl.style.display = 'block';
      noDataPrompt.style.display = 'none';
    })
    .catch(function(error) {
      svgEl.style.display = 'none';
      prompt.style.display = 'none';
      noDataPrompt.style.display = 'flex';
    });
}
function csvToBubbleDataNet(csv, valueCol) {

    const values = csv.slice(0, 15).map(d => +d[valueCol]);
    console.log(values)
    const min = Math.min(...values);
    const max = Math.max(...values);
    console.log('csv to data', valueCol)
    return {
        name: "Players",
        children: csv
        .slice(0, 15)
        .map(d => ({
            name: d.player,    
            value: amplifyNetValue(d[valueCol], min, max)+10,   
            percentage: +(d[valueCol]*1).toFixed(2), 
            valueCol: valueCol
            
        }))
    };
}

function amplifyNetValue(value, min, max) {
  return 10 + 90 * (value - min) / (max - min);
}

function updateAllNetYears() {
    const circuitBubble = document.getElementById('circuit-select-net-bubble').value;
    const circuitPodium = document.getElementById('circuit-select-net-podium').value;

    // Update bubble years
    updateNetYearsFor('year-select-net-bubble', circuitBubble);

    // Update podium years
    updateNetYearsFor('year-select-net-podium', circuitPodium);
}


function updateNetYearsFor(selectId, circuit) {
    const yearSelect = document.getElementById(selectId);
    fetch(`data/net_points/${circuit}/years.json`)
        .then(r => r.ok ? r.json() : [])
        .then(years => {
            yearSelect.innerHTML = '<option value="Select year">Select year</option>';
            years.forEach(year => {
                let opt = document.createElement('option');
                opt.value = year;
                opt.textContent = year;
                yearSelect.appendChild(opt);
            });
            yearSelect.value = "Select year";
        });
}


function updatePodiumNet(data, containerId = "scoreboard-podiums-net", valueCol = "") {
  const el = document.getElementById(containerId);

  if (!data || data.length < 3) {
    el.innerHTML = '<div style="text-align:center;">Not enough data for podium</div>';
    return;
  }

  // Sort descending by the chosen valueCol (e.g., "net_efficiency" or your subcategory)
  const sorted = data.slice().sort((a, b) => +b[valueCol] - +a[valueCol]);
  // Order for podium: 2nd, 1st, 3rd
  const top3 = [sorted[1], sorted[0], sorted[2]];
  const classes = ['second', 'first', 'third'];
  const displayRanks = [2, 1, 3];

  const podiumHTML = top3.map((player, i) => `
    <div class="scoreboard__podium scoreboard__podium--${classes[i]} js-podium">
      <div class="scoreboard__podium-base scoreboard__podium-base--${classes[i]}">
        <div class="scoreboard__podium-rank">${displayRanks[i]}</div>
      </div>
      <div class="scoreboard__podium-number">${player.player || player.Player}</div>
    </div>
  `).join('');
  el.innerHTML = podiumHTML;
}


function updateNetPodiumDisplay() {
  const year = document.getElementById("year-select-net-podium").value;
  console.log(year, 'why voeral ')
  const circuit = document.getElementById("circuit-select-net-podium").value;
  const category = document.getElementById("category-select-net-podium").value;
  const subcategory = document.getElementById("subcategory-select-net-podium").value;
  const containerId = "scoreboard-podiums-net";
  const placeholder = document.getElementById("podium-placeholder-net");
  console.log(year, circuit)
  if (year === 'Select year' ||!circuit || circuit === 'Select Circuit') {
    console.log('ohehehehhe')
    document.getElementById(containerId).innerHTML = '';
    placeholder.style.display = 'block';
    return;
  }
  placeholder.style.display = 'none';

  const csvPath = getNetCsvPath(circuit, category, subcategory, year);
  if (!csvPath) {
    return;
  }

  d3.csv(csvPath).then(function(data) {
    if (!data || data.length < 3) {
      updatePodiumNet(null, containerId, subcategory);
      return;
    }
    updatePodiumNet(data, containerId, subcategory);
  });
}

document.getElementById("circuit-select-net-bubble").addEventListener("change", updateBubbleChartForNet);
document.getElementById("category-select-net-bubble").addEventListener("change", updateBubbleChartForNet);
document.getElementById("subcategory-select-net-bubble").addEventListener("change", updateBubbleChartForNet);
document.getElementById("year-select-net-bubble").addEventListener("change", updateBubbleChartForNet);
document.getElementById('year-select-net-bubble').dispatchEvent(new Event('change'));
document.getElementById('circuit-select-net-bubble').addEventListener('change', updateAllNetYears);
document.getElementById('circuit-select-net-bubble').addEventListener('change', updateAllNetYears);
document.getElementById('circuit-select-net-podium').addEventListener('change', updateAllNetYears);

// Initialize on load if needed:
updateAllNetYears();

updateAllNetYears();


document.getElementById("year-select-net-podium").addEventListener("change", updateNetPodiumDisplay);
document.getElementById("circuit-select-net-podium").addEventListener("change", updateNetPodiumDisplay);
document.getElementById("category-select-net-podium").addEventListener("change", updateNetPodiumDisplay);
document.getElementById("subcategory-select-net-podium").addEventListener("change", updateNetPodiumDisplay);
// Initialize podium at load:
document.getElementById('year-select-net-podium').dispatchEvent(new Event('change'));
