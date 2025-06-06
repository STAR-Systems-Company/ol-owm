import { createWindLayer } from "./WindLayerFactory";
export class WindAnimation {
    constructor(map, properties) {
        this.map = map;
        this.properties = properties;
        this.layer = null;
        this.zoomListenerKey = null;
        this.active = false;
    }
    getActive() {
        return !!this.layer;
    }
    start(data) {
        var _a, _b;
        if (this.layer)
            return;
        this.layer = createWindLayer(this.map.type, data, {
            windOptions: {
                velocityScale: 0.03,
                projection: ((_a = this.properties) === null || _a === void 0 ? void 0 : _a.projection) || "EPSG:4326",
                colorScale: [((_b = this.properties) === null || _b === void 0 ? void 0 : _b.color) || "rgb(36,104, 180)"],
                lineWidth: 1,
                generateParticleOption: true,
                fadeOpacity: 0.95,
            },
            fieldOptions: { wrapX: false },
        });
        this.map.addLayer(this.layer);
        this.zoomListenerKey = this.map.onZoomChange(() => {
            const baseZoom = 3;
            const idealVelocity = 0.03;
            const currentZoom = this.map.getZoom();
            const velocityScale = idealVelocity * Math.pow(1.1, baseZoom - currentZoom);
            if (this.layer) {
                this.layer.setWindOptions({
                    velocityScale,
                });
            }
        });
    }
    stop() {
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
