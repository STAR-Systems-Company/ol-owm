export interface WindLayerInstance {
    setWindOptions(options: {
        velocityScale: number;
        paths?: number;
    }): void;
}
