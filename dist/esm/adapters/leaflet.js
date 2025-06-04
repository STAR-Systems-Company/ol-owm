export class LeafletAdapter {
    map;
    type = "leaflet"; // 👈 добавляем поле type
    constructor(map) {
        this.map = map;
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
