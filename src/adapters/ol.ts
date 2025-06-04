import { MapAdapter, MapAdapterType } from "../interface/map-adapter.interface";
import Map from "ol/Map";

export class OpenLayersAdapter implements MapAdapter {
  public readonly type: MapAdapterType = "openlayers"; // 👈 добавляем поле type

  constructor(private map: Map) {}

  getZoom(): number {
    return this.map.getView().getZoom()!;
  }

  onZoomChange(callback: () => void): any {
    return this.map.getView().on("change:resolution", callback);
  }

  offZoomChange(listenerKey: any): void {
    this.map.getView().un("change:resolution", listenerKey);
  }

  addLayer(layer: any): void {
    layer.appendTo(this.map);
  }

  removeLayer(layer: any): void {
    this.map.removeLayer(layer);
  }
}
