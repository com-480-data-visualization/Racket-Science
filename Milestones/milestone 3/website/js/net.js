function getNetCsvPath(circuit, category, subcategory, year) {
  let basePath = `data/net_points/${circuit}/${category}/${subcategory}`;

  if ((!year || year === "" || year === 'Overall years')) {
    return `${basePath}/overall_net_goats.csv`;
  } else if (year && year !== "" && year !== 'Overall years') {
    return `${basePath}/net_goats_by_year/net_goats_${year}.csv`;
  }
}


function updateBubbleChartForNet() {
    const circuit = document.getElementById('circuit-select-net').value;
    const category = document.getElementById('category-select-net').value;
    const subcategory = document.getElementById('subcategory-select-net').value;
    const year = document.getElementById('year-select-net').value;
    const prompt = document.getElementById('bubble-prompt-net');
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

document.getElementById("circuit-select-net").addEventListener("change", updateBubbleChartForNet);
document.getElementById("category-select-net").addEventListener("change", updateBubbleChartForNet);
document.getElementById("subcategory-select-net").addEventListener("change", updateBubbleChartForNet);
document.getElementById("year-select-net").addEventListener("change", updateBubbleChartForNet);


document.getElementById('year-select-net').dispatchEvent(new Event('change'));


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

function updateNetYears() {
    const circuit = document.getElementById('circuit-select-net').value;
    const category = document.getElementById('category-select-net').value; 
    const yearSelect = document.getElementById('year-select-net');
    fetch(`data/net_points/${circuit}/years.json`)
    .then(r => r.ok ? r.json() : [])
    .then(years => {
        yearSelect.innerHTML = '<option value="Overall years">Overall years</option>';
        years.forEach(year => {
            let opt = document.createElement('option');
            opt.value = year;
            opt.textContent = year;
            yearSelect.appendChild(opt);
        });
        yearSelect.value = "Overall years";
    });

}

document.getElementById('circuit-select-net').addEventListener('change', updateNetYears);

document.addEventListener("DOMContentLoaded", function() {
  updateNetYears();
});
