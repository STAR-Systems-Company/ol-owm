"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletAdapter = void 0;
class LeafletAdapter {
    constructor(map) {
        this.map = map;
        this.type = "leaflet"; // 👈 добавляем поле type
    }
    getZoom() {
        return this.map.getZoom();
    }
    onZoomChange(callback) {
        this.map.on("zoomend", callback);
        return callback; // в Leaflet используется функция как ключ
    }
    offZoomChange(listenerKey) {
        this.map.off("zoomend", listenerKey);
    }
    addLayer(layer) {
        this.map.addLayer(layer);
    }
    removeLayer(layer) {
        this.map.removeLayer(layer);
    }
}
exports.LeafletAdapter = LeafletAdapter;
