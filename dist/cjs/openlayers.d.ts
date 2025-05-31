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
    constructor(map: OLMap, owmKey: string, properties?: Properties);
    show(): Promise<void>;
    hide(): void;
    private update;
    private onMapClick;
    private onMapDoubleClick;
}
