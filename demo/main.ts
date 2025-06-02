import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import L from "leaflet";
import { OpenLayersWeather, LeafletWeather } from "../src";
import { layers } from "../src/layers";

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
  { lang: "ru", legend: true, legendElement: "#map-ol" }
);

weatherOL.show();

const mapLeaflet = L.map("map-leaflet").setView([50.4501, 30.5234], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(mapLeaflet);

const weatherLeaflet = new LeafletWeather(
  mapLeaflet,
  "b1b15e88fa797225412429c1c50c122a1",
  { lang: "ru", legend: true, legendElement: "#map-leaflet" }
);
weatherLeaflet.show();

const controls = document.getElementById("layerControls");

if (controls) {
  layers.forEach((layer) => {
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
