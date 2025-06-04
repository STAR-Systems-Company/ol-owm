import { MapAdapter, MapAdapterType } from "../interface/map-adapter.interface";
import Map from "ol/Map";
export declare class OpenLayersAdapter implements MapAdapter {
    private map;
    readonly type: MapAdapterType;
    constructor(map: Map);
    getZoom(): number;
    onZoomChange(callback: () => void): any;
    offZoomChange(listenerKey: any): void;
    addLayer(layer: any): void;
    removeLayer(layer: any): void;
}
