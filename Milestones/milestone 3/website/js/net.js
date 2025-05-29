function getNetCsvPath(circuit, category, subcategory, year, tournament) {
  let basePath = `results/net_points/${circuit}/${category}/${subcategory}`;

  if ((!year || year === "" || year === 'Overall years') && (!tournament || tournament === "" || tournament === 'Overall tournaments')) {
    return `${basePath}/overall_net_goats.csv`;
  } else if (year && year !== "" && year !== 'Overall years' && (!tournament || tournament === "" || tournament === 'Overall tournaments')) {
    return `${basePath}/net_goats_by_year/net_goats_${year}.csv`;
  } else if ((!year || year === "" || year === 'Overall years') && tournament && tournament !== "" && tournament !== 'Overall tournaments') {
    return `${basePath}/net_goats_by_tournament/net_goats_${tournament}_tournament.csv`;
  } else if (year && year !== "" && year !== 'Overall years' && tournament && tournament !== "" && tournament !== 'Overall tournaments') {
    return `${basePath}/net_goats_by_year_tournament/net_goats_${year}_${tournament}.csv`;
  }
}


function updateBubbleChartForNet() {
    const circuit = document.getElementById('circuit-select-net').value;
    const category = document.getElementById('category-select-net').value;
    const subcategory = document.getElementById('subcategory-select-net').value;
    const year = document.getElementById('year-select-net').value;
    const tournament = document.getElementById('tournament-select-net').value;
    const prompt = document.getElementById('bubble-prompt-net');
    const noDataPrompt = document.getElementById('bubble-prompt-no-data-net');
    const svgEl = document.getElementById('bubbleChart-net');
    
    console.log('is it here ? ')
    console.log(year, )
  if (circuit === 'Select Circuit') {
    prompt.style.display = 'flex';
    noDataPrompt.style.display = 'none';
    svgEl.style.display = 'none';
    return;
  }

  prompt.style.display = 'none';
  noDataPrompt.style.display = 'none';
  svgEl.style.display = 'block';

  const csvPath = getNetCsvPath(circuit, category, subcategory, year, tournament);
  console.log('csv path')
  console.log(csvPath)
  d3.csv(csvPath)
    .then(function(data) {
      if (!data || data.length === 0) throw new Error("No data found");
      const bubbleData = csvToBubbleDataNet(data, subcategory); 
      drawBubbleChart(svgEl, bubbleData, "net", tournament);
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
document.getElementById("tournament-select-net").addEventListener("change", updateBubbleChartForNet);


document.getElementById('year-select-net').dispatchEvent(new Event('change'));


function csvToBubbleDataNet(csv, valueCol) {

    console.log('csv to data', valueCol)
    return {
        name: "Players",
        children: csv
        .slice(0, 15)
        .map(d => ({
            name: d.player,    
            value: (+d[valueCol]).toFixed(2),    
            valueCol: valueCol
        }))
    };
}

function updateNetYearsAndTournaments() {
    const circuit = document.getElementById('circuit-select-net').value;
    const yearSelect = document.getElementById('year-select-net');
    const tournamentSelect = document.getElementById('tournament-select-net');
    fetch(`results/net_points/${circuit}/years.json`)
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
    
    console.log('years mena', `results/net_points/${circuit}/years.json`)
    fetch(`results/net_points/${circuit}/tournaments.json`)
    .then(r => r.ok ? r.json() : [])
    .then(tournaments => {
        tournamentSelect.innerHTML = '<option value="Overall tournaments">Overall tournaments</option>';
        tournaments.forEach(tournament => {
            let opt = document.createElement('option');
            opt.value = tournament;
            opt.textContent = tournament;
            tournamentSelect.appendChild(opt);
        });
        tournamentSelect.value = "Overall tournaments";
    });
}

document.getElementById('circuit-select-net').addEventListener('change', updateNetYearsAndTournaments);

document.addEventListener("DOMContentLoaded", function() {
  updateNetYearsAndTournaments();
});
