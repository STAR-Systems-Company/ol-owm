export interface WindProperties {
    color?: string;
    projection?: "EPSG:3857" | "EPSG:4326";
}
export interface Properties {
    lang: "ru" | "en" | "ua";
    legend?: boolean;
    legendElement?: string;
    windDataURL?: string | null;
    windProperties?: WindProperties;
}
