import { Map as LeafletMap } from "leaflet";
import { Properties } from "./interface/properties.interface";
export declare class LeafletWeather {
    private map;
    private owmKey;
    private properties;
    private layerGroup?;
    private popup;
    constructor(map: LeafletMap, owmKey: string, properties?: Properties);
    status(): boolean;
    show(): Promise<void>;
    hide(): void;
    private update;
    private onMapDoubleClick;
}
