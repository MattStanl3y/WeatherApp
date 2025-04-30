const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const {
  getWeatherData,
  getWeatherByCoordinates,
} = require("../src/weatherService");

const mock = new MockAdapter(axios);

describe("Weather Service", () => {
  beforeEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe("getWeatherData", () => {
    it("should fetch and process weather data correctly", async () => {
      const mockResponse = {
        city: {
          name: "New York",
        },
        list: [
          {
            dt: Math.floor(Date.now() / 1000),
            main: {
              temp: 72.5,
              humidity: 65,
            },
            weather: [
              {
                description: "clear sky",
              },
            ],
            wind: {
              speed: 5.2,
            },
          },
          {
            dt: Math.floor(Date.now() / 1000) + 3600,
            main: {
              temp: 73.8,
              humidity: 68,
            },
            weather: [
              {
                description: "clear sky",
              },
            ],
            wind: {
              speed: 5.6,
            },
          },
        ],
      };

      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(200, mockResponse);

      const result = await getWeatherData("New York");

      expect(result).toBeDefined();
      expect(result.city).toBe("New York");
      expect(result.forecasts).toBeInstanceOf(Array);
      expect(result.forecasts.length).toBeGreaterThan(0);

      // checks first forecadt
      const forecast = result.forecasts[0];
      expect(forecast).toHaveProperty("date");
      expect(forecast).toHaveProperty("temp");
      expect(forecast).toHaveProperty("description");
      expect(forecast).toHaveProperty("humidity");
      expect(forecast).toHaveProperty("windSpeed");

      // Check avg values
      expect(parseFloat(forecast.temp)).toBeCloseTo(73.15, 1);
      expect(forecast.humidity).toBe(67);
      expect(parseFloat(forecast.windSpeed)).toBeCloseTo(5.4, 1);
      expect(forecast.description).toBe("clear sky");
    });

    it("should throw an error when API call fails", async () => {
      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(404, { message: "City not found" });

      await expect(getWeatherData("NonExistentCity")).rejects.toThrow();
    });
  });

  describe("getWeatherByCoordinates", () => {
    it("should fetch weather data by coordinates correctly", async () => {
      const geoMockResponse = [
        {
          name: "New York",
          lat: 40.7128,
          lon: -74.006,
        },
      ];

      const forecastMockResponse = {
        city: {
          name: "New York",
        },
        list: [
          {
            dt: Math.floor(Date.now() / 1000),
            main: {
              temp: 72.5,
              humidity: 65,
            },
            weather: [
              {
                description: "clear sky",
              },
            ],
            wind: {
              speed: 5.2,
            },
          },
        ],
      };

      mock
        .onGet("https://api.openweathermap.org/geo/1.0/reverse")
        .reply(200, geoMockResponse);
      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(200, forecastMockResponse);

      const result = await getWeatherByCoordinates(40.7128, -74.006);

      expect(result).toBeDefined();
      expect(result.city).toBe("New York");
      expect(result.forecasts).toBeInstanceOf(Array);
    });

    it("should throw an error when location is not found", async () => {
      mock
        .onGet("https://api.openweathermap.org/geo/1.0/reverse")
        .reply(200, []);

      await expect(getWeatherByCoordinates(0, 0)).rejects.toThrow(
        "Location not found"
      );
    });
  });
});
