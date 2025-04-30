const request = require("supertest");
const app = require("../index");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const mock = new MockAdapter(axios);

describe("API Endpoints", () => {
  beforeEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe("GET /api/weather", () => {
    it("should return weather data for a valid city", async () => {
      // Mock API response
      const mockResponse = {
        city: {
          name: "Seattle",
        },
        list: Array(40)
          .fill()
          .map((_, index) => ({
            dt: Math.floor(Date.now() / 1000) + index * 3600,
            main: {
              temp: 50 + Math.random() * 10,
              humidity: 60 + Math.random() * 20,
            },
            weather: [
              {
                description: index % 2 === 0 ? "clear sky" : "few clouds",
              },
            ],
            wind: {
              speed: 3 + Math.random() * 5,
            },
          })),
      };

      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(200, mockResponse);

      const response = await request(app)
        .get("/api/weather")
        .query({ city: "Seattle" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("city", "Seattle");
      expect(response.body).toHaveProperty("forecasts");
      expect(response.body.forecasts).toBeInstanceOf(Array);
      expect(response.body.forecasts.length).toBeGreaterThan(0);
    });

    it("should return 400 if city parameter is missing", async () => {
      const response = await request(app).get("/api/weather");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "City parameter is required"
      );
    });

    it("should return 404 if city is not found", async () => {
      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(404, { message: "City not found" });

      const response = await request(app)
        .get("/api/weather")
        .query({ city: "NonExistentCity" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "City not found");
    });

    it("should return 500 for other errors", async () => {
      mock.onGet("https://api.openweathermap.org/data/2.5/forecast").reply(500);

      const response = await request(app)
        .get("/api/weather")
        .query({ city: "Seattle" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to fetch weather data"
      );
    });
  });

  describe("GET /api/weather/coordinates", () => {
    it("should return weather data for valid coordinates", async () => {
      const geoMockResponse = [
        {
          name: "Seattle",
          lat: 47.6062,
          lon: -122.3321,
        },
      ];

      const forecastMockResponse = {
        city: {
          name: "Seattle",
        },
        list: Array(8)
          .fill()
          .map((_, index) => ({
            dt: Math.floor(Date.now() / 1000) + index * 3600,
            main: {
              temp: 50 + Math.random() * 10,
              humidity: 60 + Math.random() * 20,
            },
            weather: [
              {
                description: "clear sky",
              },
            ],
            wind: {
              speed: 3 + Math.random() * 5,
            },
          })),
      };

      mock
        .onGet("https://api.openweathermap.org/geo/1.0/reverse")
        .reply(200, geoMockResponse);
      mock
        .onGet("https://api.openweathermap.org/data/2.5/forecast")
        .reply(200, forecastMockResponse);

      const response = await request(app)
        .get("/api/weather/coordinates")
        .query({ lat: 47.6062, lon: -122.3321 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("city", "Seattle");
      expect(response.body).toHaveProperty("forecasts");
      expect(response.body.forecasts).toBeInstanceOf(Array);
    });

    it("should return 400 if coordinates are missing", async () => {
      const response = await request(app).get("/api/weather/coordinates");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Latitude and longitude parameters are required"
      );
    });

    it("should return 500 if location is not found", async () => {
      mock
        .onGet("https://api.openweathermap.org/geo/1.0/reverse")
        .reply(200, []);

      const response = await request(app)
        .get("/api/weather/coordinates")
        .query({ lat: 0, lon: 0 });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to fetch weather data for these coordinates"
      );
    });
  });
});
