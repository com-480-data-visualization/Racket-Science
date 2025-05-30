function goToChart(chartIndex, section) {
  const charts = document.querySelectorAll(`#${section} .top-chart`);
  const dots = document.querySelectorAll(`#${section} .dot`);

  if (dots[chartIndex - 1].classList.contains('active')) {
    return;
  }

  charts.forEach((chart, index) => {
    chart.style.display = (index === chartIndex - 1) ? 'flex' : 'none';

    if (index === chartIndex - 1) {
      chart.querySelectorAll('.bubbleChart').forEach(svgEl => {
        d3.select(svgEl).selectAll("*").remove();
        if (section === "global") {
          drawBubbleChart(svgEl, bubbleDataGlobal);
        } else if (section === "tournament") {
          drawBubbleChart(svgEl, bubbleDataDoubles);
        }
      });
      chart.querySelectorAll('.js-podium').forEach(function(podium) {
        const height = podium.getAttribute("data-height");
        const base = podium.querySelector(".scoreboard__podium-base");
        if (base && height) {
          base.style.height = height;
        }
      });
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === chartIndex - 1);
  });
}


document.addEventListener("DOMContentLoaded", function () {
  goToChart(1, 'global');
  goToChart(1, 'doubles')  
  goToChart(1, 'surfaces') 
  goToChart(1, 'services') 
  goToChart(1, 'net') 
  goToChart(1, 'tournament') 


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
        indexAxis: 'y', 
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
            display: false  
          }
        }
      }
    });
  }
});

function drawBubbleChart(svgEl, data, section, tournament, subcategory) {
  console.log(svgEl)
  const width = +svgEl.getAttribute("width") || 500;
  const height = +svgEl.getAttribute("height") || 400;
  d3.select(svgEl).selectAll("*").remove();

  const svg = d3.select(svgEl)
    .attr("width", width)
    .attr("height", height);

  const pack = d3.pack()
    .size([width, height])
    .padding(5);

  const root = d3.hierarchy(data).sum(d => Math.pow(d.value, 2));
  const nodes = pack(root).leaves();
  const color = d3.scaleOrdinal(d3.schemeSet2);
  const tooltip = d3.select("#tooltip");

  const node = svg.selectAll("g")
    .data(nodes)
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => color(d.data.name))
    .on("mouseover", function (event, d) {
        // Move parent group to the end so it's on top
        d3.select(this.parentNode).raise();

        // Animate the bubble
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.r * 1.5);

        const currentYear = document.getElementById("year-select-surfaces-bubble").value;
        const currentSurface = document.getElementById("surface-select-bubble").value;

        let tooltipText = '';
        if (section === "surfaces") {
          
          if (!tournament){
            tooltipText = `<strong>${d.data.name}</strong><br>
                         won <strong>${d.data.value}</strong> matches on <strong>${currentSurface}</strong> in <strong>${currentYear}</strong>`;
          } else {
            console.log(tournament)
            tooltipText = `<strong>${d.data.name}</strong><br>
                         won <strong>${d.data.value}</strong> matches on <strong>${currentSurface}</strong> in <strong>${currentYear}</strong> at </strong>${tournament}</strong>`;
          }
        } else if (section === "services") {
          let category = d.data.category.replace('%', '').toLowerCase()
            tooltipText = `<strong>${d.data.name}</strong><br>
                    has <strong>${d.data.percentage}</strong>% of success in ${category} over ${d.data.nb_matches} matches`;
        } else if (section === 'net') {
          let subcategory = d.data.valueCol.replace(/_/g, ' '); 
          
          tooltipText = `<strong>${d.data.name}</strong><br>
                    has <strong>${d.data.percentage}</strong>% of success in ${subcategory}`;

        } else {
          tooltipText = `<strong>${d.data.name}</strong>: ${d.data.value}`;
        }

        tooltip.style("display", "block").html(tooltipText);
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 12) + "px")
             .style("top",  (event.pageY - 24) + "px");
    })
    .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", d.r);
        tooltip.style("display", "none");
    });


  node.append("text")
    .text(d => d.data.name)
    .attr("text-anchor", "middle")
    .attr("dy", "0.3em")
    .style("font-size", d => d.r / 3)
    .style("fill", "white")
    .style("font-weight", "bold")
    .style("font-size", d => Math.max(10, d.r / 2.8)) // never below 10px, scales with bubble
    .style("display", d => d.r > 40 ? "block" : "none");


}

 