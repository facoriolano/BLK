const API_KEY = 'SWVBFX4JQD7TR22Y';  // sua chave
const symbol = 'BLK';                // símbolo da BlackRock
let chart;

// Busca dados do Alpha Vantage
async function fetchData(range) {
  let func = (range === '1d') ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY_ADJUSTED';
  let interval = (range === '1d') ? '&interval=5min' : '';
  let url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}${interval}&apikey=${API_KEY}&outputsize=compact`;

  const res = await fetch(url);
  const data = await res.json();
  const ts = (func === 'TIME_SERIES_INTRADAY')
    ? data['Time Series (5min)']
    : data['Time Series (Daily)'];

  if (!ts) {
    alert("Erro ao carregar os dados. Tente novamente em 1 minuto.");
    return [];
  }

  return Object.entries(ts)
    .map(([date, vals]) => ({
      x: new Date(date),
      y: parseFloat(vals['4. close'])
    }))
    .sort((a, b) => a.x - b.x);
}

// Exibe o gráfico
function renderChart(data) {
  const options = {
    chart: {
      type: 'line',
      height: 350,
      background: '#1a1a1a',
      foreColor: '#eee',
      toolbar: { show: false }
    },
    series: [{
      name: 'Preço',
      data: data
    }],
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      curve: 'smooth',
      colors: ['#ff4444']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['#660000'],
        stops: [0, 100]
      }
    }
  };

  if (!chart) {
    chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();
  } else {
    chart.updateOptions(options);
  }
}

// Botões de filtro (1D, 5D, etc.)
async function update(range) {
  const data = await fetchData(range);
  if (data.length > 0) {
    renderChart(data);
  }
}

// Event listeners
document.querySelectorAll('button').forEach(btn =>
  btn.addEventListener('click', () => update(btn.dataset.range))
);

// Carrega o gráfico inicial
update('1d');
