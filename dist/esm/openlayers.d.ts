import { Map as OLMap } from "ol";
import { Properties } from "./interface/properties.interface";
export declare class OpenLayersWeather {
    private map;
    private owmKey;
    private properties;
    private popupElement;
    private popupOverlay;
    private doubleClickZoom?;
    private layer?;
    private onMoveEnd;
    private wind;
    private tileLayer;
    activeKey: string | null;
    activeWind: boolean;
    constructor(map: OLMap, owmKey: string, properties?: Properties);
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
    private onMapClick;
    private onMapDoubleClick;
}
