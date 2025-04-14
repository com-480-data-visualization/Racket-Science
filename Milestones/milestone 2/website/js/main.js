function goToChart(chartNumber) {

    const chart1 = document.getElementById('podium');
    const chart2 = document.getElementById('over_the_years');
    
    chart1.style.display = 'none';
    chart2.style.display = 'none';
  
    if (chartNumber === 1) {
      chart1.style.display = 'block';
    } else {
      chart2.style.display = 'block';
    }
  
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    console.log(dots);
    if (chartNumber === 1) {
      dots[0].classList.add('active');

    } else {
      dots[3].classList.add('active');
    }
  }
  
  // On page load, start with Chart 1 visible
  window.onload = () => {
    goToChart(1);
  };
  