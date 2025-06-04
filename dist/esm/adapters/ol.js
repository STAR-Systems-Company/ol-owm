export class OpenLayersAdapter {
    constructor(map) {
        this.map = map;
        this.type = "openlayers"; // 👈 добавляем поле type
    }
    getZoom() {
        return this.map.getView().getZoom();
    }
    onZoomChange(callback) {
        return this.map.getView().on("change:resolution", callback);
    }
    offZoomChange(listenerKey) {
        this.map.getView().un("change:resolution", listenerKey);
    }
    addLayer(layer) {
        layer.appendTo(this.map);
    }
    removeLayer(layer) {
        this.map.removeLayer(layer);
    }
}
