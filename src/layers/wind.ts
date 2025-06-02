import Map from "ol/Map";
import { WindLayer } from "../libs/ol-wind";

export class WindAnimation {
  private map: Map;
  private layer: WindLayer | null = null;

  constructor(map: Map) {
    this.map = map;
  }

  public start(data: any): void {
    if (!this.layer) {
      const windLayer = new WindLayer(data, {
        windOptions: {
          velocityScale: 0.007,
          paths: 3200,
          projection: "EPSG:3857",
          ratio: 1,
          colorScale: [
            "rgb(36,104, 180)",
            "rgb(60,157, 194)",
            "rgb(128,205,193 )",
            "rgb(151,218,168 )",
            "rgb(198,231,181)",
            "rgb(238,247,217)",
            "rgb(255,238,159)",
            "rgb(252,217,125)",
            "rgb(255,182,100)",
            "rgb(252,150,75)",
            "rgb(250,112,52)",
            "rgb(245,64,32)",
            "rgb(237,45,28)",
            "rgb(220,24,32)",
            "rgb(180,0,35)",
          ],
          lineWidth: 1,
          generateParticleOption: false,
          particleMultiplier: 0.3 * 10,
        },
        fieldOptions: {
          wrapX: false,
        },
      });
      windLayer.appendTo(this.map);
    }
  }

  public stop(): void {
    if (this.layer) {
      this.map.removeLayer(this.layer);
      this.layer = null;
    }
  }
}
