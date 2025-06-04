import L from "leaflet";
import { MapAdapter, MapAdapterType } from "../interface/map-adapter.interface";
export declare class LeafletAdapter implements MapAdapter {
    private map;
    readonly type: MapAdapterType;
    constructor(map: L.Map);
    getZoom(): number;
    onZoomChange(callback: () => void): any;
    offZoomChange(listenerKey: any): void;
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
}
