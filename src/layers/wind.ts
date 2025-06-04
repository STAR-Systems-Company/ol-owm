import { MapAdapter } from "../interface/map-adapter.interface";
import { WindProperties } from "../interface/properties.interface";
import { WindLayerInstance } from "../interface/wind-layer-instance.interrface";
import { createWindLayer } from "./WindLayerFactory";

export class WindAnimation {
  private layer: WindLayerInstance | null = null;
  private zoomListenerKey: any = null;

  constructor(
    private map: MapAdapter,
    private properties: WindProperties | undefined
  ) {}

  public getActive(): boolean {
    return !!this.layer;
  }
  public start(data: any): boolean {
    if (this.layer) return true;
    this.layer = createWindLayer(this.map.type, data, {
      windOptions: {
        // velocityScale,
        // paths: 5000,
        velocityScale: 0.03,
        projection: this.properties?.projection || "EPSG:4326",
        colorScale: [this.properties?.color || "rgb(36,104, 180)"],
        lineWidth: 1,
        generateParticleOption: true,
        fadeOpacity: 0.95,
        // particleMultiplier: 3,
      },
      fieldOptions: { wrapX: false },
    });

    this.map.addLayer(this.layer);

    this.zoomListenerKey = this.map.onZoomChange(() => {
      const baseZoom = 3;
      const idealVelocity = 0.03;

      const currentZoom = this.map.getZoom();
      const velocityScale =
        idealVelocity * Math.pow(1.1, baseZoom - currentZoom);

      if (this.layer) {
        this.layer.setWindOptions({
          velocityScale,
        });
      }
    });

    return true;
  }

  public stop(): boolean {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
    }

    if (this.zoomListenerKey) {
      this.map.offZoomChange(this.zoomListenerKey);
      this.zoomListenerKey = null;
    }

    return false;
  }
}
