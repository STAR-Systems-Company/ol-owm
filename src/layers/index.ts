export const layers = [
  {
    name: "Clouds",
    key: "clouds_new",
    url: "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=",
  },
  {
    name: "Precipitation",
    key: "precipitation_new",
    url: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=",
  },
  {
    name: "Sea level pressure",
    key: "pressure_new",
    url: "https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=",
  },
  {
    name: "Wind speed",
    key: "wind_new",
    url: "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=",
  },
  {
    name: "Temperature",
    key: "temp_new",
    url: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=",
  },
  {
    name: "Wind arrows",
    key: "WNDUV",
    url: `https://maps.openweathermap.org/maps/2.0/weather/1h/WNDUV/{z}/{x}/{y}?date=${Math.floor(Date.now() / 1000)}&use_norm=true&arrow_step=16&appid=`,
  },
];
