const API_KEY = 'SWVBFX4JQD7TR22Y';
const symbol = 'BLK';
let chart;

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function fetchData(range) {
  let func = 'TIME_SERIES_DAILY_ADJUSTED';
  let interval = '';

  if (range === '1d') {
    func = 'TIME_SERIES_INTRADAY';
    interval = '&interval=5min';
  } 

  let url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}${interval}&apikey=${API_KEY}&outputsize=full`;

  const res = await fetch(url);
  const data = await res.json();

  const ts = (func === 'TIME_SERIES_INTRADAY')
    ? data['Time Series (5min)']
    : data['Time Series (Daily)'];

  if (!ts) {
    alert("Erro ao carregar os dados. Tente novamente em 1 minuto.");
    return [];
  }

  let arr = Object.entries(ts).map(([date, vals]) => ({
    x: new Date(date),
    y: parseFloat(vals['4. close'])
  }));

  arr.sort((a, b) => a.x - b.x);

  const now = new Date();
  let filtered;

  switch (range) {
    case '1d':
      filtered = arr;
      break;
    case '5d':
      filtered = arr.filter(point => point.x >= subtractDays(now, 5));
      break;
    case '1mo':
      filtered = arr.filter(point => point.x >= subtractDays(now, 30));
      break;
    case '6mo':
      filtered = arr.filter(point => point.x >= subtractDays(now, 180));
      break;
    case '1y':
      filtered = arr.filter(point => point.x >= subtractDays(now, 365));
      break;
    default:
      filtered = arr;
  }

  return filtered;
}

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
    chart.updateSeries([{ data }]);
  }
}

async function update(range) {
  const data = await fetchData(range);
  if (data.length > 0) {
    renderChart(data);
  }
}

document.querySelectorAll('button').forEach(btn =>
  btn.addEventListener('click', () => update(btn.dataset.range))
);

update('1d');
