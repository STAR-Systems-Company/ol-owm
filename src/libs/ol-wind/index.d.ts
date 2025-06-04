import { Layer } from "ol/layer";
import CanvasLayerRenderer from "ol/renderer/canvas/Layer";
import { Transform } from "ol/transform";
import { WindCore, IOptions, Field, IField } from "wind-core";
import Map, { FrameState } from "ol/Map";
export { Field } from "wind-core";

declare class WindLayerRender extends CanvasLayerRenderer<any> {
  protected container: HTMLElement;
  protected inversePixelTransform: Transform;
  protected pixelTransform: Transform;
  wind: WindCore;
  constructor(layer: any);
  useContainer(
    target: HTMLElement,
    transform: string,
    backgroundColor?: string
  ): void;
  getBackground(frameState: FrameState): string;
  prepareFrame(frameState: FrameState): any;
  prepareContainer(frameState: FrameState, target: HTMLElement): void;
  getRenderContext(frameState: FrameState): CanvasRenderingContext2D;
  renderFrame(frameState: FrameState, target: HTMLElement): HTMLElement;
  setOptions(options: Partial<IOptions>): void;
  setData(field: Field): void;
  execute(
    context: CanvasRenderingContext2D,
    frameState: FrameState,
    opt: Partial<IOptions>,
    data: any
  ): void;
  private getPixelFromCoordinateInternal;
  private getCoordinateFromPixel;
  private intersectsCoordinate;
}

interface IWindOptions extends IOptions {
  forceRender: boolean;
  windOptions: Partial<IOptions>;
  fieldOptions: Partial<IField>;
  [key: string]: any;
}
declare class WindLayer extends Layer {
  private field;
  private options;
  constructor(data: any, options: any);
  appendTo(map: any): void;
  private onAdd;
  private onRemove;
  protected createRenderer(): any;
  public getRenderer(): WindLayerRender;
  private pickWindOptions;
  getData(): Field | undefined | any;
  setData(data: any, options?: Partial<IField>): this;
  setWindOptions(options: Partial<IOptions>): void;
  getWindOptions(): Partial<IOptions>;
  render(frameState: FrameState, target: HTMLElement): any;
  setMapInternal(map: Map): void;
  setMap(map: Map): void;
}

export { type IWindOptions, WindLayer };
