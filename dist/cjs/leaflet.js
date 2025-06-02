"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletWeather = void 0;
// LeafletWeather.ts
const leaflet_1 = __importDefault(require("leaflet"));
const get_svg_image_1 = require("./hoocks/get.svg.image");
const layers_1 = require("./layers");
const make_lengnd_1 = require("./hoocks/make.lengnd");
const defaultProperties = {
    lang: "en",
    legend: true,
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
class LeafletWeather {
    constructor(map, owmKey, properties = defaultProperties) {
        this.activeTileLayer = null;
        this.activeKey = null;
        this.update = async () => {
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
            await Promise.all(requests);
            if (this.layerGroup) {
                this.layerGroup.clearLayers();
            }
            else {
                this.layerGroup = leaflet_1.default.layerGroup();
                this.map.addLayer(this.layerGroup);
            }
            for (const feature of features) {
                const { geometry, properties } = feature;
                const [lon, lat] = geometry.coordinates;
                const { city, wind_speed = 0, temp = 0 } = properties;
                const rawSvg = (0, get_svg_image_1.getSvgImage)(properties);
                const icon = leaflet_1.default.divIcon({
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
            <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}" style="width: 32px; height: 32px; object-fit: cover;" alt="weather" />
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
                leaflet_1.default.marker([lat, lon], { icon }).addTo(this.layerGroup);
            }
        };
        this.onMapDoubleClick = async (e) => {
            const { lat, lng } = e.latlng;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=en&appid=${this.owmKey}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                const { name, weather, main, wind, sys, timezone, clouds, visibility } = data;
                const content = `
      <div style="font-family: 'Segoe UI', sans-serif; color: #1a1a1a; min-width: 240px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <img src="https://openweathermap.org/img/wn/${weather === null || weather === void 0 ? void 0 : weather[0].icon}@2x.png" width="48" height="48" style="
              background: #404040;
              border-radius: 10px;
            "/>
          <div>
            <div style="font-size: 16px; font-weight: 600;">${name || "Unknown"}, ${sys.country}</div>
            <div style="font-size: 13px; color: #666;">${weather === null || weather === void 0 ? void 0 : weather[0].description}</div>
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
        };
        this.map = map;
        this.owmKey = owmKey;
        this.properties = properties;
        this.popup = leaflet_1.default.popup();
    }
    status() {
        return !!this.layerGroup;
    }
    layers() {
        return layers_1.layers.map((x) => {
            return {
                name: x.name,
                key: x.key,
            };
        });
    }
    setLayer(key) {
        if (key === this.activeKey)
            return;
        // Удаляем текущий слой, если он есть
        if (this.activeTileLayer) {
            (0, make_lengnd_1.removeLegend)("-l");
            this.map.removeLayer(this.activeTileLayer);
            this.activeTileLayer = null;
            this.activeKey = null;
        }
        // Если key не передан, просто выходим
        if (!key)
            return;
        const layerData = layers_1.layers.find((x) => x.key === key);
        if (!layerData) {
            console.warn("Layer not found for key:", key);
            return;
        }
        const tileLayer = leaflet_1.default.tileLayer(layerData.url + this.owmKey, {
            opacity: 0.7,
            attribution: "&copy; <a href='https://openweathermap.org/'>OpenWeatherMap</a>",
        });
        setTimeout(() => {
            if (this.properties.legend && this.properties.legendElement) {
                (0, make_lengnd_1.makeLegend)("-l", this.properties.legendElement, layerData);
            }
        }, 0);
        tileLayer.addTo(this.map);
        this.activeTileLayer = tileLayer;
        this.activeKey = key;
    }
    async show() {
        this.map.doubleClickZoom.disable();
        this.map.on("moveend", this.update);
        this.map.on("dblclick", this.onMapDoubleClick);
        this.map.on("click", () => {
            this.map.closePopup();
        });
        await this.update();
    }
    hide() {
        this.map.doubleClickZoom.enable();
        this.map.off("moveend", this.update);
        this.map.off("dblclick", this.onMapDoubleClick);
        if (this.layerGroup) {
            this.map.removeLayer(this.layerGroup);
        }
    }
}
exports.LeafletWeather = LeafletWeather;
