import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import L from "leaflet";
import { OpenLayersWeather, LeafletWeather } from "../dist/esm";

const mapOL = new Map({
  target: "map-ol",
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({
    center: fromLonLat([30.52, 50.45]), // Киев
    zoom: 6,
  }),
});

const weatherOL = new OpenLayersWeather(
  mapOL,
  "b1b15e88fa797225412429c1c50c122a1",
  {
    lang: "ru",
    legend: true,
    legendElement: "#map-ol",
    windDataURL: "https://blog.sakitam.com/wind-layer/data/wind.json",
    windProperties: {
      color: "red",
    },
  }
);

// weatherOL

weatherOL.show();

const mapLeaflet = L.map("map-leaflet").setView([50.4501, 30.5234], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(mapLeaflet);

const weatherLeaflet = new LeafletWeather(
  mapLeaflet,
  "b1b15e88fa797225412429c1c50c122a1",
  {
    lang: "ru",
    legend: true,
    legendElement: "#map-leaflet",
    windDataURL: "https://blog.sakitam.com/wind-layer/data/wind.json",
    windProperties: {
      color: "blue",
    },
  }
);
weatherLeaflet.show();

const controls = document.getElementById("layerControls");

if (controls) {
  weatherOL.layers().forEach((layer) => {
    const btn = document.createElement("button");
    btn.textContent = layer.name;
    btn.onclick = () => {
      weatherOL.setLayer(layer.key);
      weatherLeaflet.setLayer(layer.key);
    };
    controls.appendChild(btn);
  });

  const btn = document.createElement("button");
  btn.textContent = "null";
  btn.onclick = () => {
    weatherOL.setLayer(null);
    weatherLeaflet.setLayer(null);
  };
  controls.appendChild(btn);
}

const toggleWindBtn = document.querySelector("#toggle-wind");

if (toggleWindBtn) {
  toggleWindBtn.addEventListener("click", () => {
    weatherOL.toggleWind();
    weatherLeaflet.toggleWind();
  });
}
