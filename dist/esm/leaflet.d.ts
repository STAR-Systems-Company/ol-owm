import { Map as LeafletMap } from "leaflet";
import { Properties } from "./interface/properties.interface";
export declare class LeafletWeather {
    private map;
    private owmKey;
    private properties;
    private layerGroup?;
    private popup;
    private activeTileLayer;
    activeKey: string | null;
    private wind;
    constructor(map: LeafletMap, owmKey: string, properties?: Properties);
    status(): boolean;
    layers(): {
        name: string;
        key: string;
    }[];
    setLayer(key: string | null): void;
    toggleWind(): void;
    show(): Promise<void>;
    hide(): void;
    private update;
    private onMapDoubleClick;
}
