const serviceYears = [
  "2024","2023","2022","2021","2020","2019","2018","2017","2016",
  "2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005",
  "2004","2003","2002","2001","2000"
];

const serviceSelect = document.getElementById("year-select-services-bubble");
serviceYears.forEach(year => {
  const option = document.createElement("option");
  option.value = year;
  option.text = year;
  serviceSelect.appendChild(option);
});

// You already have the category selector in the HTML above

function getServiceCsvPath(year, category) {
  if (year === "Overall years") {
    return `results/services/overall_years_${category}.csv`;
  }
  return `results/services/${year}_${category}.csv`;
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

document.getElementById("year-select-services-bubble").addEventListener("change", updateBubbleChartForServices);
document.getElementById("category-select-services-bubble").addEventListener("change", updateBubbleChartForServices);

document.getElementById('year-select-services-bubble').dispatchEvent(new Event('change'));

function csvToBubbleDataServices(csv, valueCol) {
    console.log('First row:', csv[0]);
    console.log('ValueCol:', valueCol);

    const values = csv.slice(0, 15).map(d => +d[valueCol]);
    console.log(values)
    const min = Math.min(...values);
    const max = Math.max(...values);
    console.log(min)
    console.log(max)
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
