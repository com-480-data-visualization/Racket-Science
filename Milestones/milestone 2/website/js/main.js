function goToChart(chartIndex) {
  const charts = document.querySelectorAll('.top-chart');
  const dots = document.querySelectorAll('.dot');

  charts.forEach((chart, index) => {
      chart.style.display = (index === chartIndex - 1) ? 'flex' : 'none';
  });

  dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === chartIndex - 1);
  });
}
document.addEventListener("DOMContentLoaded", function () {
  goToChart(1);  // always start with first chart
  const podiums = document.querySelectorAll(".js-podium");

  podiums.forEach(function (podium) {
    const height = podium.getAttribute("data-height");
    const base = podium.querySelector(".scoreboard__podium-base");
    if (base && height) {
      base.style.height = height;
    }
  });

  // Render horizontal vote chart after DOM is ready
  const ctx = document.getElementById('voteChart');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Serena Williams', 'Pete Sampras', 'Andre Agassi'],
        datasets: [{
          label: 'Votes',
          data: [700, 650, 600, 500, 450, 400],
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF6347', '#8A2BE2'],
          borderColor: ['#FF5733', '#33FF57', '#3357FF', '#FFD700', '#FF6347', '#8A2BE2'],
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y', // horizontal
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            ticks: {
              font: {
                size: 14
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false  // 👈 Hides the legend
          }
        }
      }
    });
  }
});

  const bubbleData = {
    name: "Players",
    children: [
      { name: "Roger", value: 100 },
      { name: "Rafa", value: 80 },
      { name: "Novak", value: 90 },
      { name: "Andy", value: 60 },
      { name: "Stan", value: 50 },
    ]
  };
  
  function drawBubbleChart(data) {
    const width = 300;
  const height = 300;

  const svg = d3.select("#bubble-chart")
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto");
  
    const pack = data => d3.pack()
      .size([width, height])
      .padding(5)(
        d3.hierarchy(data)
          .sum(d => d.value)
      );
  
    const root = pack(data);
  
    const color = d3.scaleOrdinal(d3.schemeSet2);
  
    const node = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);
  
    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => color(d.data.name));
  
    node.append("text")
      .text(d => d.data.name)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", d => d.r / 3)
      .style("fill", "white");
  }
  
  // Call the function on load
  window.addEventListener('DOMContentLoaded', () => {
    drawBubbleChart(bubbleData);
    drawRadarChart()
  });
  
  // Radar chart (Chart.js)
function drawRadarChart() {
  const ctx = document.getElementById('radarCanvas').getContext('2d');
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Serve %', 'Grand Slams', 'Win %', '5-Set Win %', 'Weeks #1', 'Masters 1000'],
      datasets: [
        {
          label: 'Roger Federer',
          data: [85, 20, 82, 72, 310, 28],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)'
        },
        {
          label: 'Rafael Nadal',
          data: [83, 22, 83, 75, 209, 36],
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)'
        },
        {
          label: 'Novak Djokovic',
          data: [87, 24, 84, 80, 420, 40],
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          pointBackgroundColor: 'rgb(75, 192, 192)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
}


  
