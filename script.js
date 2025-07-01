const apiKey = '19e81965639569d68925755de80a1b80'; 

document.getElementById('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

async function getWeatherByCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return alert("Please enter a city name.");
  getWeather(city);
}

function getWeatherByLocation() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    getWeather(null, latitude, longitude);
  });
}

async function getWeather(city = null, lat = null, lon = null) {
  let url;
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  }

  const res = await fetch(url);
  const data = await res.json();
  const dailyData = {};
  const temps = [];
  const labels = [];

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
      temps.push(item.main.temp);
      labels.push(new Date(item.dt_txt).toLocaleDateString());
    }
  });

  const coord = data.city.coord;
  showForecast(dailyData);
  drawChart(labels, temps);
  getExtraDetails(coord.lat, coord.lon);
}

function showForecast(data) {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = '';
  let count = 0;

  for (const date in data) {
    if (count >= 5) break;
    const item = data[date];
    const icon = item.weather[0].main.toLowerCase();

    const card = document.createElement('div');
    card.className = 'card';
    const lottieDiv = document.createElement('div');
    lottieDiv.className = 'lottie-icon';
    lottieDiv.id = `lottie-${count}`;
    card.appendChild(lottieDiv);

    card.innerHTML += `
      <h3>${new Date(date).toDateString()}</h3>
      <p>🌡️ ${item.main.temp} °C</p>
      <p>${item.weather[0].description}</p>
    `;

    forecastDiv.appendChild(card);
    loadLottie(icon, `lottie-${count}`);
    count++;
  }
}

function loadLottie(type, containerId) {
  let animURL = 'https://assets9.lottiefiles.com/packages/lf20_t24tpvcu.json';
  if (type.includes('clear')) animURL = 'https://assets7.lottiefiles.com/packages/lf20_qosrhgzt.json';
  else if (type.includes('cloud')) animURL = 'https://assets7.lottiefiles.com/packages/lf20_jmBauI.json';
  else if (type.includes('rain')) animURL = 'https://assets7.lottiefiles.com/packages/lf20_dgjK9W.json';
  else if (type.includes('snow')) animURL = 'https://assets1.lottiefiles.com/packages/lf20_jmBauI.json';

  lottie.loadAnimation({
    container: document.getElementById(containerId),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animURL,
  });
}

function drawChart(labels, temps) {
  const ctx = document.getElementById('tempChart').getContext('2d');
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Daily Temp (°C)',
        data: temps,
        borderColor: '#00796b',
        fill: true,
        backgroundColor: 'rgba(0,121,107,0.1)',
        tension: 0.3
      }]
    }
  });
}

async function getExtraDetails(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();

  const details = `
    🌡️ Feels like: ${data.main.feels_like} °C<br>
    💧 Humidity: ${data.main.humidity}%<br>
    🌬️ Wind: ${data.wind.speed} m/s<br>
    🧭 Pressure: ${data.main.pressure} hPa<br>
    🌅 Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}<br>
    🌇 Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}
  `;
  document.getElementById('details').innerHTML = details;

  const tipBox = document.getElementById('tip');
  const feels = data.main.feels_like;
  if (feels > 35) tipBox.innerText = "🥵 It's very hot! Stay hydrated.";
  else if (feels < 10) tipBox.innerText = "🧥 It's cold. Wear warm clothes!";
  else tipBox.innerText = "🙂 Weather looks comfortable today.";
}
