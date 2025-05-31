import { getWeatherIcon } from "../weather-icons";
export const getSvgImage = (data) => {
    const { clouds, temp, humidity, wind_speed } = data;
    let condition = "clear";
    if (temp < 1 && humidity > 70 && clouds > 50) {
        condition = "snowy";
    }
    if (humidity > 80 && wind_speed > 8 && clouds > 60 && temp > 10) {
        condition = "thunderstorms";
    }
    if (clouds > 50 && humidity > 60 && temp > 1) {
        condition = "rain";
    }
    if (clouds > 15) {
        condition = "clouds";
    }
    return getWeatherIcon(condition);
};
