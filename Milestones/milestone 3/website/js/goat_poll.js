// ✅ Supabase Client Initialization
const supabase = window.supabase.createClient(
  'https://ebzahmiawwwtjoiryrma.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViemFobWlhd3d3dGpvaXJ5cm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzY0ODEsImV4cCI6MjA2Mzg1MjQ4MX0.9IQES_ZYUwWyoViTPsVgLgfN3H-1gPI1NSrKzWTPXOE'
);

// ✅ Player presets
const presets = {
  men: ['Roger Federer','Rafael Nadal','Novak Djokovic','Pete Sampras','Andre Agassi', 'Jimmy Connors', 'Ivan Lendl', 'John McEnroe', 'Bjorn Borg', 'Rod Laver'],
  women: ['Serena Williams','Steffi Graf','Martina Navratilova','Margaret Court','Chris Evert', 'Monica Seles', 'Billie Jean King', 'Venus Williams', 'Justine Henin', 'Martina Hingis']
};
presets.all = [...presets.men, ...presets.women];

// ✅ For vote population and reset (safe to keep for dev)
async function populateInitialVotes() {
  const cats = ['men', 'women', 'all'];
  for (const cat of cats) {
    for (const name of presets[cat]) {
      const { data: existing } = await supabase
        .from('votes')
        .select('*')
        .eq('category', cat)
        .eq('name', name)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('votes')
          .insert({ category: cat, name, count: 0 });
        if (error) console.log(error.message);
        else console.log(`Inserted ${name} in ${cat}`);
      } else {
        console.log(`${name} already exists in ${cat}`);
      }
    }
  }
  console.log("✅ Done populating.");
}
// Run once to populate:
//populateInitialVotes();

async function resetAllVotesToZero() {
  const { data, error } = await supabase.from('votes').select('id');

  if (error) {
    console.error('Failed to fetch votes:', error);
    return;
  }

  for (const vote of data) {
    await supabase
      .from('votes')
      .update({ count: 0 })
      .eq('id', vote.id);
  }

  console.log("✅ All votes reset to 0.");
}
// Run once to reset:
//resetAllVotesToZero();

// ✅ Voting and chart logic
const votes = { all: {}, men: {}, women: {} };
const COLOR_PALETTE = ['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff','#0356fc','#d972ff','#F564A9','#5409DA','#4E71FF','#8DD8FF','#BBFBFF'];
const playerColors = {};
let nextColorIndex = 0;
let voteChart; // Declare globally to be initialized later

function fillPlayerSelect(category) {
  const sel = document.getElementById('player-select');
  sel.innerHTML = '<option value="" disabled selected> Select a Player</option>';
  presets[category].forEach(name => {
    sel.insertAdjacentHTML('beforeend', `<option value="${name}">${name}</option>`);
  });
  sel.insertAdjacentHTML('beforeend', '<option value="other">Other…</option>');
}

function updateChart() {
  const cat = document.getElementById('player-category').value;
  const arr = Object.entries(votes[cat]).map(([name, count]) => ({ name, count }));
  const top5 = arr.sort((a, b) => b.count - a.count).slice(0, 5);

  const colors = top5.map(d => {
    if (!playerColors[d.name]) {
      playerColors[d.name] = COLOR_PALETTE[nextColorIndex % COLOR_PALETTE.length];
      nextColorIndex++;
    }
    return playerColors[d.name];
  });

  voteChart.data.labels = top5.map(d => d.name);
  voteChart.data.datasets[0].data = top5.map(d => d.count);
  voteChart.data.datasets[0].backgroundColor = colors;
  voteChart.data.datasets[0].borderColor = colors;
  voteChart.update();
}

async function loadVotes(category = 'all') {
  const { data, error } = await supabase
    .from('votes')
    .select('name, count')
    .eq('category', category);

  if (error) {
    console.error('Failed to load votes:', error);
    return;
  }

  votes[category] = {};
  data.forEach(row => votes[category][row.name] = row.count);
  updateChart();
}

async function saveVote(category, name) {
  const { data, error } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: false })  // tells Supabase to send back data
    .eq('category', category)
    .eq('name', name)
    .maybeSingle();  // safer than .single() to avoid hard errors

  if (data) {
    await supabase
      .from('votes')
      .update({ count: data.count + 1 })
      .eq('category', category)
      .eq('name', name);
  } else {
    await supabase
      .from('votes')
      .insert({ category, name, count: 1 });
  }
}

// ✅ Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  fillPlayerSelect('all');

  const ctx2 = document.getElementById('goatVoteChart').getContext('2d');
  Chart.register(ChartDataLabels);
  voteChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [], borderColor: [] }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 } },
        y: { ticks: { display: false }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'center',
          align: 'center',
          clamp: true,
          color: 'white',
          font: { weight: 'bold', size: 14 },
          formatter: (value, ctx) => ctx.chart.data.labels[ctx.dataIndex]
        }
      },
      animations: {
        x: { type: 'number', duration: 400, easing: 'easeInOutQuad' },
        y: { type: 'number', duration: 800, easing: 'easeInOutQuad' }
      }
    },
    plugins: [ChartDataLabels]
  });

  await loadVotes('all');
});

// ✅ Handle category change
document.getElementById('player-category').addEventListener('change', async e => {
  const cat = e.target.value;
  fillPlayerSelect(cat);
  document.getElementById('player-name').style.display = 'none';
  await loadVotes(cat);
});

// ✅ Show/hide text input for custom name
document.getElementById('player-select').addEventListener('change', e => {
  const txt = document.getElementById('player-name');
  txt.style.display = (e.target.value === 'other') ? '' : 'none';
  if (e.target.value !== 'other') txt.value = '';
});

// ✅ Vote button handler
document.getElementById('vote-button').addEventListener('click', async () => {
  const cat = document.getElementById('player-category').value;
  const selVal = document.getElementById('player-select').value;
  const typed = document.getElementById('player-name').value.trim();
  let name;

  if (selVal === 'other') {
    if (!typed) { alert('Enter a player name'); return; }
    name = typed;
  } else if (selVal) {
    name = selVal;
  } else {
    alert('Please choose or enter a player'); return;
  }

  await saveVote(cat, name);
  await loadVotes(cat);

  document.getElementById('player-select').value = '';
  document.getElementById('player-name').value = '';
  document.getElementById('player-name').style.display = 'none';

  const totalForPlayer = votes[cat][name];
  document.getElementById('vote-feedback').textContent =
    `Good call! ${name} now has ${totalForPlayer} vote${totalForPlayer !== 1 ? 's' : ''}.`;
});
