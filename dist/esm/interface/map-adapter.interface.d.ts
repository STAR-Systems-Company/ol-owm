export type MapAdapterType = "openlayers" | "leaflet";
export interface MapAdapter {
    getZoom(): number;
    onZoomChange(callback: () => void): any;
    offZoomChange(listenerKey: any): void;
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
    type: MapAdapterType;
}
