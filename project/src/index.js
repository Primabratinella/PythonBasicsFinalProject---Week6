let conversationState = {
    lastCity: null,
    expectingFollowUp: false
  };
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
        console.log("FORECAST FULL:", data);
        if (!data || !data.city) {
            status.innerText = "❌ Forecast not available";
            return;
          }
      
        document.getElementById("weatherContainer").classList.remove("hidden");
        document.getElementById("cityName").innerText = data.city;
        document.getElementById("currentTemp").innerText =
          Math.round(data.temperature.current) + "°F";
      
        loadMap(data.coordinates.latitude, data.coordinates.longitude);
      
        status.innerText = "";
      })
    .catch(() => {
      status.innerText = "❌ Error fetching weather";
    });

  // FORECAST + CHART
  fetch(`https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=imperial`)
  .then(res => res.json())
  .then(data => {
    if (!data || !data.city) return;

    const forecastDiv = document.getElementById("forecast");
    forecastDiv.innerHTML = "";

    if (!data.daily || data.daily.length === 0) { forecastDiv.innerHTML = "<p>No forecast available</p>"; return; }

    data.daily.slice(1, 6).forEach(day => {
      const date = new Date(day.time * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      forecastDiv.innerHTML += `
        <div>
          <p>${dayName}</p>
          <img src="${day.condition.icon_url.replace("http://", "https://")}" />
          <p>${Math.round(day.temperature.day)}°F</p>
        </div>
      `;
    });

    if (!data.hourly || data.hourly.length === 0) return;

    const hours = data.hourly.slice(0, 12);

    const labels = hours.map(h => {
      const date = new Date(h.time * 1000);
      return date.getHours() + ":00";
    });

    const temps = hours.map(h => Math.round(h.temperature));

    if (chart) chart.destroy();

    const canvas = document.getElementById("hourlyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{ data: temps, tension: 0.4, fill: true }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    document.getElementById("hourlyChart").classList.remove("hidden");
  });
}

// ✅ MOVE THIS OUTSIDE getWeather (VERY IMPORTANT)
function loadMap(lat, lon) {
    const mapEl = document.getElementById("map");
  
    mapEl.classList.remove("hidden");

    mapEl.classList.remove ("map-visible");
  
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

    setTimeout(() => {
        mapEl.classList.add("map-visible");
    },100);
  }, 200);
}
let recognition = null;

  const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";


recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript.toLowerCase();

    if (conversationState.expectingFollowUp) {
        if (transcript.includes("hourly")) {
          speak("Showing hourly forecast");
          // you can trigger chart reveal here
          return;
        }
        if (transcript.includes("another city")) {
            speak("Sure, tell me the city");
            return;
          }
        }
  
    transcript = extractCity(transcript); // ✅ USE IT HERE
  
    document.getElementById("cityInput").value = transcript;

    conversationState.lastCity = transcript;
    conversationState.expectingFollowUp = true;
  
    document.getElementById("status").innerText =
      "Processing: " + transcript;
  
    getWeather();
  };
  }

// ✅ EVENTS
document.addEventListener("DOMContentLoaded", function () {

    document.querySelector("#cityInput").value = "";

    document.getElementById("searchBtn").addEventListener("click", getWeather);
  
    document.getElementById("cityInput").addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        getWeather();
      }
    });

    document.getElementById("voiceBtn").addEventListener("click", () => {
      if (!recognition) {
        alert("Voice not supported in this browser");
        return;
      }

      recognition.start();
      document.getElementById("status").innerText = "🎤 Listening...";
    });
    let typingTimer;

  document.getElementById("cityInput").addEventListener("input", () => {
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
        const city = document.getElementById ("cityInput").value.trim();
        if (city){
      getWeather();
    }
}, 1000);
});

});

  function extractCity(text) {
    text = text.replace("weather in", "");
    text = text.replace("what's the weather in", "");
    text = text.replace("show me weather in", "");
    return text.trim();
  }
  function speak(text, callback) {
    const speech = new SpeechSynthesisUtterance(text);
  
    speech.rate = 1;
    speech.pitch = 1;
  
    speech.onend = () => {
      if (callback) callback();
    };
  
    window.speechSynthesis.speak(speech);
  };

  window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
    .then (() => console.log("Service Worker Registered"))
    .catch(err => console.log("SW failed:", err));
  }
});