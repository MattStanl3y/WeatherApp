require("dotenv").config();
const express = require("express");
const path = require("path");
const {
  getWeatherData,
  getWeatherByCoordinates,
} = require("./src/weatherService");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// weather by city name endpoint
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const weatherData = await getWeatherData(city);
    res.json(weatherData);
  } catch (error) {
    console.error("Server error:", error);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: "City not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  }
});

// weather by coordinates endpoint
app.get("/api/weather/coordinates", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude parameters are required" });
  }

  try {
    const weatherData = await getWeatherByCoordinates(lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch weather data for these coordinates" });
  }
});

// Only start the server if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
