import { Field, WindCore, IField, IOptions } from "wind-core";
export { Field } from "wind-core";
import { BaseLayer as BaseLayer$1, UserOptions } from "wind-gl-core";
export {
  DecodeType,
  ImageSource,
  LayerSourceType,
  MaskType,
  RenderFrom,
  RenderType,
  TileID,
  TileSource,
  TimelineSource,
  configDeps,
} from "wind-gl-core";
import * as L from "leaflet";
import * as _sakitam_gis_vis_engine from "@sakitam-gis/vis-engine";
import {
  Matrix4,
  Scene,
  OrthographicCamera,
  PerspectiveCamera,
  Renderer,
} from "@sakitam-gis/vis-engine";

declare class BaseLayer extends L.Layer {
  options: any;
  _updating: boolean;
  _layerId: string | number;
  devicePixelRatio: number;
  _width: number;
  _height: number;
  canvas: HTMLCanvasElement | null;
  constructor(id: string | number, data: any, options: any);
  initialize(id: string | number, data: any, options: any): void;
  _createCanvas(id: string | number, zIndex: number): HTMLCanvasElement;
  _reset(): void;
  _onResize(resizeEvent: L.ResizeEvent): void;
  _zoomStart(): void;
  _moveStart(): void;
  _animateZoom(event: L.ZoomAnimEvent): void;
  _resizeCanvas(scale: number): void;
  _redraw(): void;
  _render(): void;
  project(coordinate: [number, number]): [number, number];
  unproject(pixel: [number, number]): [number, number];
  intersectsCoordinate(coordinate: [number, number]): boolean;
  onAdd(map: L.Map): this;
  _resetView(e?: any): void;
  onMoveEnd(): void;
  onRemove(): this;
  getEvents(): {
    [key: string]: any;
  };
}

declare class WindLayer extends BaseLayer {
  field: Field | undefined;
  wind: WindCore | null;
  initialize(id: string | number, data: any, options: any): void;
  _redraw(): void;
  _render(): void;
  onRemove(): this;
  pickWindOptions(): void;
  /**
   * get wind layer data
   */
  getData(): Field | undefined;
  /**
   * set layer data
   * @param data
   * @param options
   * @returns {WindLayer}
   */
  setData(data: any, options?: Partial<IField>): this;
  setWindOptions(options: Partial<IOptions>): void;
  getWindOptions(): any;
}

interface ViewState$1 {
  width: number;
  height: number;
  maxPitch: number;
  fov: number;
  worldSize: number;
  elevation: any;
  _horizonShift: number;
  getCenter: () => any;
  getPitch: () => number;
  getBearing: () => number;
  getFovRad: () => number;
  getCameraPosition: () => number[];
  centerOffset: () => any;
  project: (coordinates: number[]) => any;
}
declare class CameraSync {
  worldMatrix: Matrix4;
  mercatorMatrix: Matrix4;
  labelPlaneMatrix: Matrix4;
  glCoordMatrix: Matrix4;
  viewState: ViewState$1;
  scene: Scene;
  camera: OrthographicCamera | PerspectiveCamera;
  halfFov: number;
  cameraToCenterDistance: number;
  acuteAngle: number;
  cameraTranslateZ: number;
  constructor(viewState: ViewState$1, cameraType: any, scene: any);
  setup(): void;
  update(): void;
}

declare class ViewState {
  _width: number;
  _height: number;
  _fov: number;
  _worldSize: number;
  _center: any;
  zoom: number;
  tileSize: number;
  maxPitch: number;
  elevation: any;
  _horizonShift: number;
  /**
   * 获取 gl 宽度
   */
  get width(): number;
  /**
   * 获取 gl 高度
   */
  get height(): number;
  get fov(): number;
  get worldSize(): number;
  getCenter(): any;
  getPitch(): number;
  getBearing(): number;
  getFovRad(): number;
  getCameraPosition(): number[];
  centerOffset(): {
    x: number;
    y: number;
  };
  project(lnglat: any): {
    x: number;
    y: number;
    z: number;
  };
  get pixelsPerMeter(): number;
  unproject(p: number[]): number[];
  update(state: Record<string, any>): void;
}
interface LayerOptions extends UserOptions {
  renderingMode?: "2d" | "3d";
}
declare class WebglLayer extends BaseLayer {
  gl: WebGL2RenderingContext | WebGLRenderingContext | null;
  renderer: Renderer;
  scene: Scene;
  sync: CameraSync;
  planeCamera: OrthographicCamera;
  viewState: ViewState;
  layer: BaseLayer$1;
  _tileZoom: number | undefined;
  _wrapX: undefined | false | number[];
  _wrapY: undefined | false | number[];
  _globalTileRange: any;
  _currentTiles: any[];
  _unLimitTiles: any[];
  private source;
  initialize(id: string | number, source: any, options: any): void;
  _resizeCanvas(scale: number): void;
  get camera(): OrthographicCamera | _sakitam_gis_vis_engine.PerspectiveCamera;
  getTileSize(): L.Point;
  _redraw(): this;
  _render(): void;
  glPrerender(): void;
  glRender(): void;
  picker(coordinates: any): Promise<any>;
  calcWrappedWorlds(): number[];
  _resetView(e?: any): void;
  _resetGrid(): void;
  _setView(
    center: L.LatLng,
    zoom: number,
    noPrune?: boolean,
    noUpdate?: boolean
  ): void;
  _tileCoordsToBounds(coords: any): L.LatLngBounds;
  _tileCoordsToNwSe(coords: any): L.LatLng[];
  _isValidTile(coords: any): boolean;
  _wrapCoords(coords: any): L.Point;
  _update(center?: L.LatLng): any[] | undefined;
  _getTiledPixelBounds(center: L.LatLng, zoom: number): L.Bounds;
  _pxBoundsToTileRange(bounds: L.Bounds): L.Bounds;
  handleZoom(): void;
  onMoveEnd(): void;
  onMoveStart(): void;
  _animateZoom(event: L.ZoomAnimEvent): void;
  getEvents(): Record<string, any>;
  updateOptions(options: Partial<LayerOptions>): void;
  getMask(): any;
  private processMask;
  setMask(mask: any): void;
  onRemove(): this;
}

export { WebglLayer, WindLayer };
