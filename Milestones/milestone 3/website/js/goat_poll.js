const presets = {
  men: ['Roger Federer','Rafael Nadal','Novak Djokovic','Pete Sampras','Andre Agassi', 'Jimmy Connors', 'Ivan Lendl', 'John McEnroe', 'Bjorn Borg', 'Rod Laver' ],
  women: ['Serena Williams','Steffi Graf','Martina Navratilova','Margaret Court','Chris Evert', 'Monica Seles', 'Billie Jean King', 'Venus Williams', 'Justine Henin', 'Martina Hingis']
};
presets.all = [...presets.men, ...presets.women];

const votes = { all: {}, men: {}, women: {} };
let lastVotedName = null;

const COLOR_PALETTE = [
  '#ffbe0b',
  '#fb5607',
  '#ff006e',
  '#8338ec',
  '#3a86ff',
  '#0356fc',
  '#d972ff', 
  '#F564A9', 
  '#5409DA', 
  '#4E71FF', 
  '#8DD8FF', 
  '#BBFBFF'
];
const playerColors = {};       // name → hex
let nextColorIndex = 0;

function loadVotes() {
  const stored = localStorage.getItem('goatPollVotes');
  if (!stored) return;
  try {
    const { all, men, women, lastVotedName: last } = JSON.parse(stored);
    Object.assign(votes.all, all || {});
    Object.assign(votes.men, men || {});
    Object.assign(votes.women, women || {});
    lastVotedName = last || null;
  } catch (err) {
    console.error('Could not parse saved votes:', err);
  }
}

function saveVotes() {
  const payload = {
    all: votes.all,
    men: votes.men,
    women: votes.women,
    lastVotedName
  };
  localStorage.setItem('goatPollVotes', JSON.stringify(payload));
}

Chart.register(ChartDataLabels);

function fillPlayerSelect(category) {
  const sel = document.getElementById('player-select');
  sel.innerHTML = '<option value="" disabled selected> Select a Player</option>';
  presets[category].forEach(name => {
    sel.insertAdjacentHTML('beforeend', `<option value="${name}">${name}</option>`);
  });
  sel.insertAdjacentHTML('beforeend', '<option value="other">Other…</option>');
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r},${g},${b},0.7)`;
}

function updateChart() {
  const cat = document.getElementById('player-category').value;
  const arr = Object.entries(votes[cat]).map(([name, count]) => ({ name, count }));
  const top5 = arr.sort((a, b) => b.count - a.count).slice(0, 5);

  // ensure each player has a fixed color
  const colors = top5.map(d => {
    if (!playerColors[d.name]) {
      // grab next palette color (wrap if we run out)
      playerColors[d.name] = COLOR_PALETTE[nextColorIndex % COLOR_PALETTE.length];
      nextColorIndex++;
    }
    return playerColors[d.name];
  });

  voteChart.data.labels           = top5.map(d => d.name);
  voteChart.data.datasets[0].data = top5.map(d => d.count);
  voteChart.data.datasets[0].backgroundColor = colors;
  voteChart.data.datasets[0].borderColor     = colors;
  voteChart.update();
}

loadVotes(); 
fillPlayerSelect('all');

document.getElementById('player-category').addEventListener('change', e => {
  fillPlayerSelect(e.target.value);
  const txt = document.getElementById('player-name');
  txt.style.display = 'none'; txt.value = '';
  updateChart();
});

document.getElementById('player-select').addEventListener('change', e => {
  const txt = document.getElementById('player-name');
  if (e.target.value === 'other') txt.style.display = '';
  else { txt.style.display = 'none'; txt.value = ''; }
});

// Initialize Chart.js
const ctx2 = document.getElementById('goatVoteChart').getContext('2d');
const voteChart = new Chart(ctx2, {
  type: 'bar',
  data: {
    labels: [],        // players
    datasets: [{ 
      data: [], 
      backgroundColor: [], 
      borderColor: [] 
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,

    // 1) hide the default y-axis text
    scales: {
      x: { beginAtZero: true, 
           ticks : {stepSize: 1}
       },
      y: {
        ticks: { display: false },      // no labels on axis
        grid: { display: false }        // optional: hide gridlines
      }
    },

    plugins: {
      legend: { display: false },

      datalabels: {
        anchor: 'center',
        align: 'center',
        clamp: true,
        color: 'white',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, ctx) => {
          return ctx.chart.data.labels[ctx.dataIndex];
        }
      }
    },

    // 3) animate both length and position as before
    animations: {
      x: { type: 'number', duration: 400, easing: 'easeInOutQuad' },
      y: { type: 'number', duration: 800, easing: 'easeInOutQuad' }
    }
  },
  plugins: [ChartDataLabels]  // register per-chart
});


updateChart();

// Vote button handler
document.getElementById('vote-button').addEventListener('click', () => {
  const cat = document.getElementById('player-category').value;
  const selVal = document.getElementById('player-select').value;
  const typed = document.getElementById('player-name').value.trim();
  let name;
  if (selVal === 'other') {
    if (!typed) { alert('Enter a player name'); return; }
    name = typed;
    if (!presets[cat].includes(name)) presets[cat].push(name);
  } else if (selVal) {
    name = selVal;
  } else {
    alert('Please choose or enter a player'); return;
  }
  // Record vote
  votes.all[name] = (votes.all[name] || 0) + 1;
  if (cat !== 'all') votes[cat][name] = (votes[cat][name] || 0) + 1;
  lastVotedName = name;

  // Reset inputs
  document.getElementById('player-select').value = '';
  const txt = document.getElementById('player-name'); txt.value = ''; txt.style.display = 'none';

  saveVotes();
  updateChart();

  const totalForPlayer = votes[cat][name] || votes.all[name];
  const feedbackEl = document.getElementById('vote-feedback');
  feedbackEl.textContent = 
  `Good call! ${name} now has ${totalForPlayer} vote${totalForPlayer !== 1 ? 's' : ''}.`;
});

