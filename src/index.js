let chart;
let map;

const apiKey = "a08f0oc3b4t11e51a8dbab6fef7e5923";

function getWeather() {
  const status = document.getElementById("status");
  const city = document.getElementById("cityInput").value.trim();

  document.getElementById("hourlyChart").classList.add("hidden");
  document.getElementById("map").classList.add("hidden");

  document.getElementById("weatherContainer").classList.add("hidden");
  document.getElementById("cityName").innerText = "";
  document.getElementById("currentTemp").innerText = "";
  document.getElementById("forecast").innerHTML = "";

  if (!city) {
    status.innerText = "⚠️ Please enter a city";
    return;
  }

  status.innerText = "Loading...";

  status.scrollIntoView({ behavior: "smooth" });

  // CURRENT WEATHER
  fetch(`https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=imperial`)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        status.innerText = "❌ City not found";
        return;
      }

      document.getElementById("weatherContainer").classList.remove("hidden");
      document.getElementById("cityName").innerText = data.city;
      document.getElementById("currentTemp").innerText =
        Math.round(data.temperature.current) + "°F";

      loadMap(data.coordinates.latitude, data.coordinates.longitude);

      status.innerText = "";
      status.scrollIntoView({ behavior: "smooth" });
    })
    .catch(() => {
      status.innerText = "❌ Error fetching weather";
    });

  // FORECAST + CHART
  fetch(`https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=imperial`)
    .then(res => res.json())
    .then(data => {

        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";
      
        // 🌤️ DAILY FORECAST (ALWAYS RUN THIS FIRST)
        data.daily.slice(1,6).forEach(day => {
          const date = new Date(day.time * 1000);
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      
          forecastDiv.innerHTML += `
            <div>
              <p>${dayName}</p>
              <img src="${day.condition.icon_url}" width="40"/>
              <p>${Math.round(day.temperature.day)}°F</p>
            </div>
          `;
        });
      
        // 🌡️ ONLY GUARD THE CHART (NOT THE WHOLE FUNCTION)
        if (!data.hourly || data.hourly.length === 0) {
          return; // safe now because cards already rendered
        }
      const hours = data.hourly.slice(0, 12);

      const labels = hours.map(h => {
        const date = new Date(h.time * 1000);
        return date.getHours() + ":00";
      });

      const temps = hours.map(h => Math.round(h.temperature));

      if (chart) chart.destroy();

      const ctx = document.getElementById("hourlyChart").getContext("2d");

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            data: temps,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });

      document.getElementById("hourlyChart").classList.remove("hidden");
    });
}
// ✅ MOVE THIS OUTSIDE getWeather (VERY IMPORTANT)
function loadMap(lat, lon) {
    const mapEl = document.getElementById("map");
  
    mapEl.classList.remove("hidden");
  
    setTimeout(() => {
      if (map) map.remove();
  
      map = L.map("map").setView([lat, lon], 10);
  
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);
  
      L.marker([lat, lon]).addTo(map)
        .bindPopup("Location")
        .openPopup();
  
      map.invalidateSize();
    }, 100);
  }

// ✅ EVENTS
document.getElementById("searchBtn").addEventListener("click", getWeather);

document.getElementById("cityInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    getWeather();
  }
});