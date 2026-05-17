const express = require("express");
const path = require("path");
const serverless = require("serverless-http");

const app = express();
const PORT = process.env.PORT || 3000;

const LAT = -7.5666;
const LON = 110.8167;
const TIMEZONE = "Asia/Jakarta";

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Freezing drizzle",
  61: "Slight rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Freezing rain",
  71: "Slight snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

function formatJakartaDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE
  }).format(date);
}

async function getWeather() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(LAT));
  url.searchParams.set("longitude", String(LON));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", TIMEZONE);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const current = data.current || {};

  return {
    temperature: current.temperature_2m,
    code: current.weather_code
  };
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", async (req, res) => {
  const today = formatJakartaDate(new Date());

  try {
    const weather = await getWeather();
    const temperature = typeof weather.temperature === "number"
      ? Number(weather.temperature.toFixed(1))
      : null;
    const weatherText = WEATHER_CODES[weather.code] || "Unknown";

    res.json({
      today,
      temperature,
      weatherText
    });
  } catch (error) {
    res.json({
      today,
      temperature: null,
      weatherText: "Failed to load weather"
    });
  }
});

app.get("/api/uptime", (req, res) => {
  res.json({
    uptimeSeconds: Math.floor(process.uptime())
  });
});

module.exports.handler = serverless(app);
