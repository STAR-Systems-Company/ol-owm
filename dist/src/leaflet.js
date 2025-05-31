var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// LeafletWeather.ts
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import clearDayStatic from "./images/static/clear-day.svg?raw";
import cloudy1Static from "./images/static/cloudy-1-day.svg?raw";
import cloudyStatic from "./images/static/cloudy.svg?raw";
import clearDayAnimated from "./images/animated/clear-day.svg?raw";
import cloudy1Animated from "./images/animated/cloudy-1-day.svg?raw";
import cloudyAnimated from "./images/animated/cloudy.svg?raw";
import { getWeatherIcon } from "./weather-icons";
const defaultProperties = {
    iconAnimated: false,
};
function lonLatToTile(lon, lat, zoom) {
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
            Math.PI) /
        2) *
        Math.pow(2, zoom));
    return { x, y };
}
function formatUnixTime(timestamp, timezoneOffset) {
    const localTimestamp = (timestamp + timezoneOffset) * 1000;
    const date = new Date(localTimestamp);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}
export class LeafletWeather {
    constructor(map, owmKey, properties = defaultProperties) {
        this.update = () => __awaiter(this, void 0, void 0, function* () {
            const zoom = Math.floor(this.map.getZoom());
            const bounds = this.map.getBounds();
            const minTile = lonLatToTile(bounds.getWest(), bounds.getNorth(), zoom);
            const maxTile = lonLatToTile(bounds.getEast(), bounds.getSouth(), zoom);
            const features = [];
            const requests = [];
            for (let x = minTile.x; x <= maxTile.x; x++) {
                for (let y = minTile.y; y <= maxTile.y; y++) {
                    const tileKey = `${zoom}/${x}/${y}`;
                    const url = `https://b.maps.owm.io/weather/cities/${tileKey}.geojson?appid=${this.owmKey}`;
                    requests.push(fetch(url)
                        .then((r) => r.json())
                        .then((geojson) => {
                        features.push(...geojson.features);
                    })
                        .catch((err) => {
                        console.warn(`Ошибка загрузки тайла ${tileKey}:`, err);
                    }));
                }
            }
            yield Promise.all(requests);
            if (this.layerGroup) {
                this.layerGroup.clearLayers();
            }
            else {
                this.layerGroup = L.layerGroup();
                this.map.addLayer(this.layerGroup);
            }
            for (const feature of features) {
                const { geometry, properties } = feature;
                const [lon, lat] = geometry.coordinates;
                const { city, clouds = 0, wind_speed = 0, temp = 0 } = properties;
                const rawSvg = this.getSVGIcon(clouds);
                const icon = L.divIcon({
                    className: "", // убираем стандартные стили Leaflet
                    html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            transform: translateY(-10px);
          ">
           <div style="
              color: #000;
              font-size: 10px;
              font-weight: 600;
              line-height: 1.2;
              text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff,
               -1px 1px 0 #fff, 1px 1px 0 #fff;
              margin-top: 2px;
            ">
              ${parseInt(temp)}°C
            </div>
            <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}" style="width: 42px; height: 42px; object-fit: cover;" alt="weather" />
            <div style="
              color: #000;
              font-size: 10px;
              font-weight: 600;
              line-height: 1.2;
              text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff,
               -1px 1px 0 #fff, 1px 1px 0 #fff;
              margin-top: 2px;
            ">
              ${city}<br/>${wind_speed.toFixed(1)}м/с
            </div>
          </div>
        `,
                });
                L.marker([lat, lon], { icon }).addTo(this.layerGroup);
            }
        });
        this.onMapDoubleClick = (e) => __awaiter(this, void 0, void 0, function* () {
            const { lat, lng } = e.latlng;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=ru&appid=${this.owmKey}`;
            try {
                const res = yield fetch(url);
                const data = yield res.json();
                const { name, weather, main, wind, sys, timezone, clouds, visibility } = data;
                const iconCode = weather[0].icon;
                const isNight = iconCode.includes("n");
                const conditionKey = `${weather[0].main
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${isNight ? "night" : "day"}`;
                const rawSvg = getWeatherIcon(conditionKey || "cloudy-day", this.properties.iconAnimated);
                const content = `
      <div style="font-family: 'Segoe UI', sans-serif; color: #1a1a1a; min-width: 240px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}" width="48" height="48" />
          <div>
            <div style="font-size: 16px; font-weight: 600;">${name || "Unknown"}, ${sys.country}</div>
            <div style="font-size: 13px; color: #666;">${weather[0].description}</div>
          </div>
        </div>
        <div style="font-size: 14px; line-height: 1.7;">
          🌡️ <b>Temperature:</b> ${main.temp.toFixed(1)}°C<br />
          🤒 <b>Feels like:</b> ${main.feels_like.toFixed(1)}°C<br />
          📈 <b>Max/Min:</b> ${main.temp_max.toFixed(1)}°C / ${main.temp_min.toFixed(1)}°C<br />
          💧 <b>Humidity:</b> ${main.humidity}%<br />
          🧭 <b>Pressure:</b> ${main.pressure} hPa<br />
          ☁️ <b>Cloudiness:</b> ${clouds.all}%<br />
          👁 <b>Visibility:</b> ${(visibility / 1000).toFixed(1)} km<br />
          🌬️ <b>Wind:</b> ${wind.speed.toFixed(1)} m/s ${wind.gust ? `(gusts up to ${wind.gust.toFixed(1)} m/s)` : ""}<br />
          ↗ <b>Direction:</b> ${wind.deg}°<br />
          🌅 <b>Sunrise:</b> ${formatUnixTime(sys.sunrise, timezone)}<br />
          🌇 <b>Sunset:</b> ${formatUnixTime(sys.sunset, timezone)}
        </div>
      </div>
      `;
                this.popup.setLatLng([lat, lng]).setContent(content).openOn(this.map);
            }
            catch (e) {
                console.warn("Ошибка запроса погоды:", e);
            }
        });
        this.map = map;
        this.owmKey = owmKey;
        this.properties = properties;
        this.popup = L.popup();
    }
    show() {
        return __awaiter(this, void 0, void 0, function* () {
            this.map.doubleClickZoom.disable();
            this.map.on("moveend", this.update);
            this.map.on("dblclick", this.onMapDoubleClick);
            yield this.update();
        });
    }
    hide() {
        this.map.doubleClickZoom.enable();
        this.map.off("moveend", this.update);
        this.map.off("dblclick", this.onMapDoubleClick);
        if (this.layerGroup) {
            this.map.removeLayer(this.layerGroup);
        }
    }
    getSVGIcon(clouds) {
        const animated = this.properties.iconAnimated;
        if (clouds > 60)
            return animated ? cloudyAnimated : cloudyStatic;
        if (clouds > 20)
            return animated ? cloudy1Animated : cloudy1Static;
        return animated ? clearDayAnimated : clearDayStatic;
    }
}
