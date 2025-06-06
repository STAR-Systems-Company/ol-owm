import { MapAdapter } from "../interface/map-adapter.interface";
import { WindProperties } from "../interface/properties.interface";
export declare class WindAnimation {
    private map;
    private properties;
    private layer;
    private zoomListenerKey;
    active: boolean;
    constructor(map: MapAdapter, properties: WindProperties | undefined);
    getActive(): boolean;
    start(data: any): void;
    stop(): boolean;
}
