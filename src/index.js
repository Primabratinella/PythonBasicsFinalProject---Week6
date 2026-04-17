const apiKey = "a08f0oc3b4t11e51a8dbab6fef7e5923";

function getWeather() {
  const city = document.getElementById("cityInput").value;

  fetch(`https://api.shecodes.io/weather/v1/current?query=${city}&key=${apiKey}&units=imperial`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("weatherContainer").classList.remove("hidden");
      document.getElementById("cityName").innerText = data.city;
      document.getElementById("currentTemp").innerText =
        Math.round(data.temperature.current) + "°F";
    });

  fetch(`https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apiKey}&units=imperial`)
    .then(res => res.json())
    .then(data => {
      const forecastDiv = document.getElementById("forecast");
      forecastDiv.innerHTML = "";

      data.daily.slice(1,6).forEach(day => {
        const date = new Date(day.time * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        forecastDiv.innerHTML += `
          <div>
            <p>${dayName}</p>
            <p>${Math.round(day.temperature.day)}°F</p>
          </div>
        `;
      });
    });
}

// 👇 ADD THIS LINE RIGHT HERE (bottom of file)
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("button").addEventListener("click", getWeather);
  });