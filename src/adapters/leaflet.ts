import L from "leaflet";
import { MapAdapter, MapAdapterType } from "../interface/map-adapter.interface";

export class LeafletAdapter implements MapAdapter {
  public readonly type: MapAdapterType = "leaflet"; // 👈 добавляем поле type

  constructor(private map: L.Map) {}

  getZoom(): number {
    return this.map.getZoom();
  }

  onZoomChange(callback: () => void): any {
    this.map.on("zoomend", callback);
    return callback; // в Leaflet используется функция как ключ
  }

  offZoomChange(listenerKey: any): void {
    this.map.off("zoomend", listenerKey);
  }

  addLayer(layer: any): void {
    this.map.addLayer(layer);
  }

  removeLayer(layer: any): void {
    this.map.removeLayer(layer);
  }
}
