import { Layer } from 'ol/layer';
import { PluggableMap } from 'ol';
import { FrameState } from 'ol/PluggableMap';
import CanvasLayerRenderer from 'ol/renderer/canvas/Layer';
import { Transform } from 'ol/transform';
import { WindCore, IOptions, Field, IField } from 'wind-core';
export { Field } from 'wind-core';

declare class WindLayerRender extends CanvasLayerRenderer<any> {
    protected container: HTMLElement;
    protected inversePixelTransform: Transform;
    protected pixelTransform: Transform;
    wind: WindCore;
    constructor(layer: any);
    useContainer(target: HTMLElement, transform: string, backgroundColor?: string): void;
    getBackground(frameState: FrameState): string;
    prepareFrame(frameState: FrameState): any;
    prepareContainer(frameState: FrameState, target: HTMLElement): void;
    getRenderContext(frameState: FrameState): CanvasRenderingContext2D;
    renderFrame(frameState: FrameState, target: HTMLElement): HTMLElement;
    setOptions(options: Partial<IOptions>): void;
    setData(field: Field): void;
    execute(context: CanvasRenderingContext2D, frameState: FrameState, opt: Partial<IOptions>, data: any): void;
    private getPixelFromCoordinateInternal;
    private getCoordinateFromPixel;
    private intersectsCoordinate;
}

interface IWindOptions extends IOptions {
    /**
     * 配置是否强制渲染；ol 对图层有一定的优化策略，在地图拖动，缩放等交互会隐藏图层，如果我们期望在拖动缩放
     * 也需要保持图层显示，那么可以开启器配置（默认开启）
     */
    forceRender: boolean;
    /**
     * 风场渲染相关配置
     */
    windOptions: Partial<IOptions>;
    /**
     * 风场数据相关配置
     */
    fieldOptions: Partial<IField>;
    [key: string]: any;
}
declare class WindLayer extends Layer {
    private field;
    private options;
    constructor(data: any, options: any);
    /**
     * 兼容旧版调用方式，现在可以使用以下方式添加图层：
     * ```ts
     * 1. 常规方式
     * map.addLayer(windLayer);
     *
     * 2. setMap 会脱离 ol 地图的图层管理
     *
     * layer.setMap(map);
     *
     * 3. 调用 appendTo
     *
     * layer.appendTo(map);
     * ```
     * @param map
     */
    appendTo(map: any): void;
    private onAdd;
    private onRemove;
    protected createRenderer(): any;
    protected getRenderer(): WindLayerRender;
    private pickWindOptions;
    /**
     * 获取图层现有数据
     * get wind layer data
     */
    getData(): Field | undefined;
    /**
     * 设置图层数据
     * set layer data
     * @param data
     * @param options
     * @returns {WindLayer}
     */
    setData(data: any, options?: Partial<IField>): this;
    /**
     * 设置风场图层的配置项
     * @param options
     */
    setWindOptions(options: Partial<IOptions>): void;
    /**
     * 获取风场图层渲染的配置项
     */
    getWindOptions(): Partial<IOptions>;
    render(frameState: FrameState, target: HTMLElement): any;
    setMapInternal(map: PluggableMap): void;
    /**
     * 支持以 setMap 方式添加图层
     * @param map
     */
    setMap(map: PluggableMap): void;
}

export { type IWindOptions, WindLayer };
