"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenLayersWeather = void 0;
const Vector_1 = __importDefault(require("ol/layer/Vector"));
const Vector_2 = __importDefault(require("ol/source/Vector"));
const GeoJSON_1 = __importDefault(require("ol/format/GeoJSON"));
const Overlay_1 = __importDefault(require("ol/Overlay"));
const Tile_1 = __importDefault(require("ol/layer/Tile"));
const style_1 = require("ol/style");
const proj_1 = require("ol/proj");
const interaction_1 = require("ol/interaction");
const get_svg_image_1 = require("./hoocks/get.svg.image");
const layers_1 = require("./layers");
const source_1 = require("ol/source");
const make_lengnd_1 = require("./hoocks/make.lengnd");
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
    const localTimestamp = (timestamp + timezoneOffset) * 1000; // в миллисекунды
    const date = new Date(localTimestamp);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}
const defaultProperties = {
    lang: "en",
    legend: true,
    legendElement: "#map",
};
class OpenLayersWeather {
    constructor(map, owmKey, properties = defaultProperties) {
        this.tileLayer = null;
        this.activeKey = null;
        this.onMapClick = () => {
            if (this.popupOverlay) {
                this.popupOverlay.setPosition(undefined);
            }
        };
        this.onMapDoubleClick = async (evt) => {
            const coord = (0, proj_1.toLonLat)(evt.coordinate);
            const [lon, lat] = coord;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${this.properties.lang}&appid=${this.owmKey}`;
            try {
                const res = await fetch(url);
                const data = await res.json();
                const { name, weather, main, wind, sys, timezone, clouds, visibility } = data;
                const weatherData = weather[0];
                const description = weatherData.description;
                const mainCondition = weatherData.main;
                const sunrise = formatUnixTime(sys.sunrise, timezone);
                const sunset = formatUnixTime(sys.sunset, timezone);
                this.popupElement.innerHTML = `
  <div style="font-family: 'Segoe UI', sans-serif; color: #1a1a1a; min-width: 240px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
      <img src="https://openweathermap.org/img/wn/${weather === null || weather === void 0 ? void 0 : weather[0].icon}@2x.png" alt="${mainCondition}" width="48" height="48" style=" object-position: center;
    object-fit: cover;
    width: 48px;
    height: 48px;
    background: #404040;
    border-radius: 10px;
    " />
      <div>
        <div style="font-size: 16px; font-weight: 600;">${name || "Unknown"}, ${sys.country}</div>
        <div style="font-size: 13px; color: #666;">${description}</div>
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
      🌅 <b>Sunrise:</b> ${sunrise}<br />
      🌇 <b>Sunset:</b> ${sunset}
    </div>
  </div>
`;
                this.popupOverlay.setPosition(evt.coordinate);
            }
            catch (e) {
                console.warn("Ошибка запроса погоды:", e);
            }
        };
        this.map = map;
        this.owmKey = owmKey;
        this.properties = properties;
        this.onMoveEnd = () => {
            this.update();
        };
    }
    status() {
        return !!this.layer;
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
        if (this.tileLayer) {
            (0, make_lengnd_1.removeLegend)(this.properties.legendElement);
            this.map.removeLayer(this.tileLayer);
            this.tileLayer = null;
            this.activeKey = null;
        }
        if (!key) {
            (0, make_lengnd_1.removeLegend)(this.properties.legendElement);
            return;
        }
        const layerData = layers_1.layers.find((l) => l.key === key);
        if (!layerData)
            return;
        const source = new source_1.XYZ({
            url: layerData.url + this.owmKey,
        });
        const tileLayer = new Tile_1.default({
            source,
            zIndex: 50,
        });
        if (this.properties.legend && this.properties.legendElement) {
            (0, make_lengnd_1.makeLegend)(this.properties.legendElement, layerData);
        }
        this.map.addLayer(tileLayer);
        this.tileLayer = tileLayer;
        this.activeKey = key;
    }
    async show() {
        this.doubleClickZoom = this.map
            .getInteractions()
            .getArray()
            .find((i) => i instanceof interaction_1.DoubleClickZoom);
        if (this.doubleClickZoom) {
            this.map.removeInteraction(this.doubleClickZoom);
        }
        this.popupElement = document.createElement("div");
        this.popupElement.style.cssText = `
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    min-width: 200px;
    font-family: sans-serif;
    `;
        this.popupOverlay = new Overlay_1.default({
            element: this.popupElement,
            positioning: "bottom-center",
            stopEvent: false,
            offset: [0, -15],
        });
        this.map.addOverlay(this.popupOverlay);
        this.map.on("moveend", this.onMoveEnd);
        this.map.on("dblclick", this.onMapDoubleClick);
        this.map.on("click", this.onMapClick);
        await this.update();
    }
    hide() {
        this.map.un("dblclick", this.onMapDoubleClick);
        this.map.un("click", this.onMapClick);
        if (this.popupOverlay) {
            this.map.removeOverlay(this.popupOverlay);
        }
        if (this.doubleClickZoom) {
            this.map.addInteraction(this.doubleClickZoom);
        }
        if (this.layer) {
            this.map.removeLayer(this.layer);
            this.layer = undefined;
        }
    }
    async update() {
        var _a;
        const view = this.map.getView();
        const zoom = Math.floor((_a = view.getZoom()) !== null && _a !== void 0 ? _a : 6);
        const extent = view.calculateExtent(this.map.getSize());
        const topLeft = (0, proj_1.toLonLat)([extent[0], extent[3]]);
        const bottomRight = (0, proj_1.toLonLat)([extent[2], extent[1]]);
        const minTile = lonLatToTile(topLeft[0], topLeft[1], zoom);
        const maxTile = lonLatToTile(bottomRight[0], bottomRight[1], zoom);
        const features = [];
        const requests = [];
        for (let x = minTile.x; x <= maxTile.x; x++) {
            for (let y = minTile.y; y <= maxTile.y; y++) {
                const tileKey = `${zoom}/${x}/${y}`;
                const url = `https://b.maps.owm.io/weather/cities/${tileKey}.geojson?appid=${this.owmKey}&lang=${this.properties.lang}`;
                requests.push(fetch(url)
                    .then((r) => r.json())
                    .then((geojson) => {
                    const parsed = new GeoJSON_1.default().readFeatures(geojson, {
                        featureProjection: view.getProjection(),
                    });
                    features.push(...parsed);
                })
                    .catch((err) => {
                    console.warn(`Ошибка загрузки тайла ${tileKey}:`, err);
                }));
            }
        }
        await Promise.all(requests);
        const source = new Vector_2.default({
            features,
        });
        const styleFunction = (feature) => {
            const { city, wind_speed, temp } = feature.getProperties();
            const rawSvg = (0, get_svg_image_1.getSvgImage)(feature.getProperties());
            const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
            return [
                new style_1.Style({
                    image: new style_1.Icon({
                        src: dataUrl,
                        scale: 0.2,
                    }),
                    text: new style_1.Text({
                        text: city,
                        font: "12px sans-serif",
                        fill: new style_1.Fill({
                            color: "white",
                        }),
                        stroke: new style_1.Stroke({
                            color: "black",
                            width: 2,
                        }),
                        offsetY: 20,
                    }),
                }),
                new style_1.Style({
                    text: new style_1.Text({
                        text: parseInt(temp) + "°C",
                        font: "12px sans-serif",
                        fill: new style_1.Fill({
                            color: "white",
                        }),
                        stroke: new style_1.Stroke({
                            color: "black",
                            width: 2,
                        }),
                        offsetY: -16,
                    }),
                    zIndex: 9999999999,
                }),
                new style_1.Style({
                    text: new style_1.Text({
                        text: wind_speed.toFixed(1) + "м/с",
                        font: "10px sans-serif",
                        fill: new style_1.Fill({
                            color: "white",
                        }),
                        stroke: new style_1.Stroke({
                            color: "black",
                            width: 2,
                        }),
                        // offsetX: ,
                        offsetY: 32,
                    }),
                    zIndex: 9999999999,
                }),
            ];
        };
        if (!this.layer) {
            this.layer = new Vector_1.default({
                source,
                style: styleFunction,
                zIndex: 100,
            });
            this.map.addLayer(this.layer);
            this.map.on("dblclick", this.onMapDoubleClick);
        }
        else {
            this.layer.setSource(source);
        }
    }
}
exports.OpenLayersWeather = OpenLayersWeather;
