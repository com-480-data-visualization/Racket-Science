console.log("main.js is connected!");
// Later: code for your charts or visual widgets.
function goToChart(chartNumber) {
    // Get both chart sections
    const chart1 = document.getElementById('chart1');
    const chart2 = document.getElementById('chart2');
    
    // Hide both first
    chart1.style.display = 'none';
    chart2.style.display = 'none';
  
    // Show the chosen one
    if (chartNumber === 1) {
      chart1.style.display = 'block';
    } else {
      chart2.style.display = 'block';
    }
  
    // Update which nav dot is active
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    if (chartNumber === 1) {
      dots[0].classList.add('active');
    } else {
      dots[1].classList.add('active');
    }
  }
  
  // On page load, start with Chart 1 visible
  window.onload = () => {
    goToChart(1);
  };
  