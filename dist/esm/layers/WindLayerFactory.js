import { WindLayer as OLWindLayer } from "../libs/ol-wind";
import { WindLayer as LeafletWindLayer } from "../libs/leaflet-wind";
export function createWindLayer(mapType, data, options) {
    if (mapType === "openlayers") {
        return new OLWindLayer(data, options);
    }
    else if (mapType === "leaflet") {
        return new LeafletWindLayer("wind", data, options);
    }
    throw new Error("Unknown map type");
}
