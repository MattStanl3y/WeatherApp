require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.OPENWEATHER_API_KEY;
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/reverse";

async function getWeatherData(city) {
  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "imperial",
        cnt: 40, // Get 5 days of data (8 readings per day)
      },
    });

    const processedData = processForecastData(response.data);
    return processedData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

async function getWeatherByCoordinates(lat, lon) {
  try {
    const geoResponse = await axios.get(GEOCODING_URL, {
      params: {
        lat,
        lon,
        limit: 1,
        appid: API_KEY,
      },
    });

    if (geoResponse.data && geoResponse.data.length > 0) {
      const locationName = geoResponse.data[0].name;

      const forecastResponse = await axios.get(FORECAST_URL, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "imperial",
          cnt: 40,
        },
      });

      const processedData = processForecastData(forecastResponse.data);
      return processedData;
    } else {
      throw new Error("Location not found for these coordinates");
    }
  } catch (error) {
    console.error("Error fetching weather by coordinates:", error);
    throw error;
  }
}

function processForecastData(data) {
  const dailyForecasts = {};

  data.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dayKey = date.toLocaleDateString();

    if (!dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        date: date,
        temps: [],
        descriptions: [],
        humidity: [],
        windSpeed: [],
      };
    }

    dailyForecasts[dayKey].temps.push(forecast.main.temp);
    dailyForecasts[dayKey].descriptions.push(forecast.weather[0].description);
    dailyForecasts[dayKey].humidity.push(forecast.main.humidity);
    dailyForecasts[dayKey].windSpeed.push(forecast.wind.speed);
  });

  const processedForecasts = Object.entries(dailyForecasts).map(
    ([date, data]) => {
      return {
        date: data.date,
        temp: (
          data.temps.reduce((a, b) => a + b, 0) / data.temps.length
        ).toFixed(1),
        description: getMostFrequent(data.descriptions),
        humidity: Math.round(
          data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length
        ),
        windSpeed: (
          data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length
        ).toFixed(1),
      };
    }
  );

  return {
    city: data.city.name,
    forecasts: processedForecasts.slice(0, 7),
  };
}

function getMostFrequent(arr) {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
}

module.exports = {
  getWeatherData,
  getWeatherByCoordinates,
};
