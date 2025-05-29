document.addEventListener("DOMContentLoaded", () => {
  const yearSelect = document.getElementById('year-select3');
  const ctx = document.getElementById('radarCanvas').getContext('2d');
  let radarChart;

  async function fetchRadarData(year) {
    if (year === "Overall years") {
      const response = await fetch("../data/general/top3_overall_with_scores.json");
      const data = await response.json();
      return data.global.overall;
    } else {
      const response = await fetch("../data/general/top3_with_scores_per_year.json");
      const data = await response.json();
      return data.global[year]?.overall || [];
    }
  }

  function renderRadarChart(players) {
    const labels = [
      "Slam Win Ratio",
      "Slam Titles Ratio",
      "Fifth Set Win Ratio",
      "Weeks at No. 1",
      "General Win Ratio"
    ];

    const datasets = players.map((player, i) => {
      const colorPalette = ["#ff6384", "#36a2eb", "#cc65fe"];
      return {
        label: player.name,
        data: [
          player.scores.slam_win_ratio,
          player.scores.slam_titles_ratio,
          player.scores.fifth_set_ratio,
          player.scores.weeks_at_no1,
          player.scores.general_win_ratio
        ],
        fill: true,
        backgroundColor: colorPalette[i] + "33",
        borderColor: colorPalette[i],
        pointBackgroundColor: colorPalette[i]
      };
    });

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: false
          },
          datalabels: {
            display: false // 👈 disables the visible labels on the radar points
        }
        },
        scales: {
          r: {
            beginAtZero: true
          }
        }
      }
    });
  }

  async function updateRadarChart(year) {
    try {
      const players = await fetchRadarData(year);
      renderRadarChart(players);
    } catch (error) {
      console.error("Error loading radar chart data:", error);
    }
  }

  // Initial load
  updateRadarChart(yearSelect.value);

  // On dropdown change
  yearSelect.addEventListener("change", () => {
    updateRadarChart(yearSelect.value);
  });
});
