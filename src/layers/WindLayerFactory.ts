import { WindLayer as OLWindLayer } from "../libs/ol-wind";
import { WindLayer as LeafletWindLayer } from "../libs/leaflet-wind";
import { MapAdapterType } from "../interface/map-adapter.interface";
import { WindLayerInstance } from "../interface/wind-layer-instance.interrface";

export function createWindLayer(
  mapType: MapAdapterType,
  data: any,
  options: any
): WindLayerInstance {
  if (mapType === "openlayers") {
    return new OLWindLayer(data, options);
  } else if (mapType === "leaflet") {
    return new LeafletWindLayer("wind", data, options);
  }
  throw new Error("Unknown map type");
}
