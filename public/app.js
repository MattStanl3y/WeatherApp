document.addEventListener("DOMContentLoaded", () => {
  const weatherForm = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  const futureForecast = document.getElementById("futureForecast");
  const loader = document.getElementById("loader");
  const errorMessage = document.getElementById("errorMessage");
  const locationButton = document.getElementById("locationButton");

  // icon mapping
  const weatherIcons = {
    "clear sky": "fas fa-sun",
    "few clouds": "fas fa-cloud-sun",
    "scattered clouds": "fas fa-cloud",
    "broken clouds": "fas fa-cloud",
    "overcast clouds": "fas fa-cloud",
    "shower rain": "fas fa-cloud-showers-heavy",
    rain: "fas fa-cloud-rain",
    thunderstorm: "fas fa-bolt",
    snow: "fas fa-snowflake",
    mist: "fas fa-smog",
    fog: "fas fa-smog",
    haze: "fas fa-smog",
    default: "fas fa-cloud",
  };

  function getWeatherIcon(description) {
    const desc = description.toLowerCase();

    for (const [key, value] of Object.entries(weatherIcons)) {
      if (desc.includes(key)) {
        return value;
      }
    }

    return weatherIcons.default;
  }

  weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (!city) return;

    await fetchWeatherData(city);
  });

  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      loader.style.display = "block";
      weatherInfo.classList.add("hidden");
      errorMessage.style.display = "none";

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          loader.style.display = "none";
          let errorMsg = "";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg =
                "Location access was denied. Please enter a city manually.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg =
                "Location information is unavailable. Please enter a city manually.";
              break;
            case error.TIMEOUT:
              errorMsg =
                "Location request timed out. Please enter a city manually.";
              break;
            default:
              errorMsg =
                "An unknown error occurred. Please enter a city manually.";
          }
          showError(errorMsg);
        }
      );
    } else {
      showError(
        "Geolocation is not supported by your browser. Please enter a city manually."
      );
    }
  });

  async function fetchWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `/api/weather/coordinates?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      loader.style.display = "none";

      if (response.ok) {
        displayWeatherInfo(data);
        weatherInfo.classList.remove("hidden");
        setTimeout(() => {
          weatherInfo.classList.add("visible");
        }, 10);
      } else {
        showError(
          data.error || "Failed to fetch weather data for your location"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      loader.style.display = "none";
      showError(
        "An error occurred while fetching weather data for your location"
      );
    }
  }

  async function fetchWeatherData(city) {
    loader.style.display = "block";
    weatherInfo.classList.add("hidden");
    errorMessage.style.display = "none";

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );
      const data = await response.json();

      loader.style.display = "none";

      if (response.ok) {
        displayWeatherInfo(data);
        weatherInfo.classList.remove("hidden");
        setTimeout(() => {
          weatherInfo.classList.add("visible");
        }, 10);
      } else {
        showError(data.error || "Failed to fetch weather data");
      }
    } catch (error) {
      console.error("Error:", error);
      loader.style.display = "none";
      showError("An error occurred while fetching weather data");
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";

    if (message.toLowerCase().includes("not found")) {
      errorMessage.innerHTML = `<i class="fas fa-map-marker-alt"></i> City "${cityInput.value}" not found. <br>Please check the spelling and try again.`;
    }
  }

  function displayWeatherInfo(data) {
    document.getElementById("cityName").textContent = data.city;

    const today = data.forecasts[0];
    const todayCard = document.querySelector(".today");

    todayCard.querySelector(".temperature").textContent = today.temp;
    todayCard.querySelector(".description").textContent = today.description;

    todayCard.querySelector(".humidity").textContent = today.humidity;
    todayCard.querySelector(".windSpeed").textContent = today.windSpeed;

    const todayIcon = document.getElementById("todayIcon");
    todayIcon.className = getWeatherIcon(today.description) + " fa-3x";

    futureForecast.innerHTML = "";

    data.forecasts.slice(1).forEach((forecast) => {
      const date = new Date(forecast.date);
      const dayName = getDayName(date);

      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-card future-day";

      const iconClass = getWeatherIcon(forecast.description);

      forecastCard.innerHTML = `
                <h3>${dayName}</h3>
                <div class="weather-icon-container">
                    <i class="${iconClass} fa-2x"></i>
                </div>
                <div class="temp-display" style="font-size: 1.8rem">${forecast.temp}°F</div>
                <div class="description-display" style="font-size: 1rem">${forecast.description}</div>
                <div class="weather-details">
                    <p>Humidity: <span>${forecast.humidity}%</span></p>
                    <p>Wind: <span>${forecast.windSpeed} mph</span></p>
                </div>
            `;
      futureForecast.appendChild(forecastCard);
    });
  }

  function getDayName(date) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return days[date.getDay()];
    }
  }

  cityInput.focus();
});
