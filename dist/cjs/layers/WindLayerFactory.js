"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindLayer = createWindLayer;
const ol_wind_1 = require("../libs/ol-wind");
const leaflet_wind_1 = require("../libs/leaflet-wind");
function createWindLayer(mapType, data, options) {
    if (mapType === "openlayers") {
        return new ol_wind_1.WindLayer(data, options);
    }
    else if (mapType === "leaflet") {
        return new leaflet_wind_1.WindLayer("wind", data, options);
    }
    throw new Error("Unknown map type");
}
