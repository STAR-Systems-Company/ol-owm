import { createCanvas, WindCore, defaultOptions, isArray, formatData, assign } from 'wind-core';
export { Field } from 'wind-core';
import { BaseLayer as BaseLayer$1, LayerSourceType, TileID, polygon2buffer } from 'wind-gl-core';
export { DecodeType, ImageSource, LayerSourceType, MaskType, RenderFrom, RenderType, TileID, TileSource, TimelineSource, configDeps } from 'wind-gl-core';
import * as L from 'leaflet';
// import rewind from '@mapbox/geojson-rewind';
import { utils, highPrecision, Matrix4, OrthographicCamera, PerspectiveCamera, Vector3, ProjectionMatrix, Renderer, Scene } from '@sakitam-gis/vis-engine';
import { mat4 } from 'gl-matrix';

class BaseLayer extends L.Layer {
  constructor(id, data, options) {
    super(id, data, options);
  }
  initialize(id, data, options) {
    if (!id) {
      throw Error("layer id must be specified");
    }
    this._layerId = id;
    L.Util.setOptions(this, options);
    this.devicePixelRatio = this.options.devicePixelRatio || // @ts-ignore 忽略错误
    (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI);
  }
  _createCanvas(id, zIndex) {
    const canvas = createCanvas(this._width, this._height, this.devicePixelRatio);
    canvas.id = String(id);
    const panes = this._map.getPanes();
    if (panes && panes.overlayPane) {
      panes.overlayPane.appendChild(canvas);
    }
    return canvas;
  }
  _reset() {
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this.canvas, topLeft);
    this._redraw();
  }
  _onResize(resizeEvent) {
    this.canvas.style.width = resizeEvent.newSize.x + "px";
    this.canvas.style.height = resizeEvent.newSize.y + "px";
    this._width = resizeEvent.newSize.x;
    this._height = resizeEvent.newSize.y;
    this._resizeCanvas(this.devicePixelRatio);
  }
  _zoomStart() {
    this._moveStart();
  }
  _moveStart() {
    if (!this._updating) {
      this._updating = true;
    }
  }
  _animateZoom(event) {
    const scale = this._map.getZoomScale(event.zoom, this._map.getZoom());
    const offset = this._map._latLngToNewLayerPoint(this._map.getBounds().getNorthWest(), event.zoom, event.center);
    L.DomUtil.setTransform(this.canvas, offset, scale);
  }
  _resizeCanvas(scale) {
    this.canvas.width = this._width * scale;
    this.canvas.height = this._height * scale;
  }
  _redraw() {
    this._render();
  }
  _render() {
  }
  project(coordinate) {
    const pixel = this._map.latLngToContainerPoint(new L.LatLng(coordinate[1], coordinate[0]));
    return [pixel.x * this.devicePixelRatio, pixel.y * this.devicePixelRatio];
  }
  unproject(pixel) {
    const coordinates = this._map.containerPointToLatLng(new L.Point(pixel[0], pixel[1]));
    return [coordinates.lng, coordinates.lat];
  }
  intersectsCoordinate(coordinate) {
    const bounds = this._map.getBounds();
    return bounds.contains(L.latLng(coordinate[1], coordinate[0]));
  }
  onAdd(map) {
    this._map = map;
    const size = map.getSize();
    this._width = size.x;
    this._height = size.y;
    this.canvas = this._createCanvas(this._layerId, this.options.zIndex || 1);
    const animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(this.canvas, "leaflet-zoom-" + (animated ? "animated" : "hide"));
    this._map.on(this.getEvents(), this);
    this._resetView();
    this._render();
    return this;
  }
  _resetView(e) {
  }
  onMoveEnd() {
    this._reset();
  }
  onRemove() {
    const panes = this._map.getPanes();
    if (panes && panes.overlayPane) {
      panes.overlayPane.removeChild(this.canvas);
    }
    this._map.off(this.getEvents(), this);
    this.canvas = null;
    return this;
  }
  getEvents() {
    const events = {
      resize: this._onResize,
      viewreset: this._render,
      moveend: this.onMoveEnd,
      // movestart: this._moveStart,
      zoomstart: this._render,
      zoomend: this._render
      // zoomanim: undefined,
    };
    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      events.zoomanim = this._animateZoom;
    }
    return events;
  }
}

class WindLayer extends BaseLayer {
  initialize(id, data, options) {
    super.initialize(id, data, options);
    this.field = void 0;
    this.pickWindOptions();
    if (data) {
      this.setData(data, options.fieldOptions);
    }
  }
  _redraw() {
    this._render();
  }
  _render() {
    const opt = this.getWindOptions();
    if (!this.wind && this._map) {
      const ctx = this.canvas.getContext("2d");
      const data = this.getData();
      this.wind = new WindCore(ctx, opt, data);
      this.wind.project = this.project.bind(this);
      this.wind.unproject = this.unproject.bind(this);
      this.wind.intersectsCoordinate = this.intersectsCoordinate.bind(this);
      this.wind.postrender = () => {
      };
    }
    this.wind.prerender();
    this.wind.render();
  }
  onRemove() {
    if (this.wind) {
      this.wind.stop();
      this.wind = null;
    }
    return super.onRemove();
  }
  pickWindOptions() {
    Object.keys(defaultOptions).forEach((key) => {
      if (key in this.options) {
        if (this.options.windOptions === void 0) {
          this.options.windOptions = {};
        }
        this.options.windOptions[key] = this.options[key];
      }
    });
  }
  /**
   * get wind layer data
   */
  getData() {
    return this.field;
  }
  /**
   * set layer data
   * @param data
   * @param options
   * @returns {WindLayer}
   */
  setData(data, options = {}) {
    if (data && data.checkFields && data.checkFields()) {
      this.field = data;
    } else if (isArray(data)) {
      this.field = formatData(data, options);
    } else {
      console.error("Illegal data");
    }
    if (this.field) {
      this?.wind?.updateData(this.field);
    }
    return this;
  }
  setWindOptions(options) {
    const beforeOptions = this.options.windOptions || {};
    this.options = assign(this.options, {
      windOptions: assign(beforeOptions, options || {})
    });
    if (this.wind) {
      const windOptions = this.options.windOptions;
      this.wind.setOptions(windOptions);
      this.wind.prerender();
    }
  }
  getWindOptions() {
    return this.options.windOptions || {};
  }
}

const { clamp } = utils;
const earthRadius = 63710088e-1;
const earthCircumference = 2 * Math.PI * earthRadius;
function circumferenceAtLatitude(latitude) {
  return earthCircumference * Math.cos(latitude * Math.PI / 180);
}
function mercatorXfromLng(lng) {
  return (180 + lng) / 360;
}
function mercatorYfromLat(lat) {
  return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / 360;
}
function mercatorZfromAltitude(altitude, lat) {
  return altitude / circumferenceAtLatitude(lat);
}
function lngFromMercatorX(x, wrap = 0) {
  return x * 360 - 180 + wrap * 360;
}
function latFromMercatorY(y) {
  const y2 = 180 - y * 360;
  return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
}
const MAX_MERCATOR_LATITUDE = 85.051129;
function fromLngLat(lngLatLike, altitude = 0) {
  const lat = clamp(lngLatLike.lat, -MAX_MERCATOR_LATITUDE, MAX_MERCATOR_LATITUDE);
  return {
    x: mercatorXfromLng(lngLatLike.lng),
    y: mercatorYfromLat(lat),
    z: mercatorZfromAltitude(altitude, lat)
  };
}
function getCoordinatesCenterTileID(coords) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const coord of coords) {
    minX = Math.min(minX, coord.x);
    minY = Math.min(minY, coord.y);
    maxX = Math.max(maxX, coord.x);
    maxY = Math.max(maxY, coord.y);
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dMax = Math.max(dx, dy);
  const zoom = Math.max(0, Math.floor(-Math.log(dMax) / Math.LN2));
  const tilesAtZoom = Math.pow(2, zoom);
  return {
    z: zoom,
    x: Math.floor((minX + maxX) / 2 * tilesAtZoom),
    y: Math.floor((minY + maxY) / 2 * tilesAtZoom),
    extent: [minX, minY, maxX, maxY]
  };
}

const { degToRad, radToDeg } = utils;
highPrecision(true);
mat4.identity([]);
class CameraSync {
  constructor(viewState, cameraType, scene) {
    this.worldMatrix = new Matrix4();
    this.mercatorMatrix = new Matrix4();
    this.labelPlaneMatrix = new Matrix4();
    this.glCoordMatrix = new Matrix4();
    const { width, height } = viewState;
    const fov = radToDeg(Math.atan(3 / 4));
    const nearZ = 0.1;
    const farZ = 1e21;
    this.viewState = viewState;
    this.scene = scene;
    this.scene.matrixAutoUpdate = false;
    this.scene.worldMatrixNeedsUpdate = true;
    this.camera = cameraType === "orthographic" ? new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, nearZ, farZ) : new PerspectiveCamera(fov, width / height, nearZ, farZ);
    this.camera.matrixAutoUpdate = false;
    this.camera.position.z = 600;
    this.setup();
  }
  setup() {
    const { width, height, fov } = this.viewState;
    const maxPitch = degToRad(this.viewState.maxPitch);
    this.camera.aspect = width / height;
    this.halfFov = fov / 2;
    this.cameraToCenterDistance = 0.5 / Math.tan(this.halfFov) * height;
    this.acuteAngle = Math.PI / 2 - maxPitch;
    this.update();
  }
  update() {
    const { width, height, elevation, _horizonShift, worldSize } = this.viewState;
    const center = this.viewState.getCenter();
    const pitch = this.viewState.getPitch();
    const pitchRad = degToRad(pitch);
    const bearing = this.viewState.getBearing();
    const fovRad = this.viewState.getFovRad();
    const cameraPosition = this.viewState.getCameraPosition();
    const halfFov = fovRad / 2;
    const pitchAngle = Math.cos(Math.PI / 2 - pitchRad);
    const groundAngle = Math.PI / 2 + pitchRad;
    this.cameraToCenterDistance = 0.5 / Math.tan(halfFov) * height;
    const point = this.viewState.project(center);
    const rotateMap = new Matrix4().fromRotationZ(Math.PI);
    const scale = new Matrix4().fromScale(new Vector3(-worldSize, worldSize, worldSize));
    const translateMap = new Matrix4().fromTranslation(new Vector3(-point.x, point.y, 0));
    const nz = height / 50;
    const nearZ = Math.max(nz * pitchAngle, nz);
    const fovAboveCenter = fovRad * (0.5 + this.viewState.centerOffset().y / height);
    const pixelsPerMeter = mercatorZfromAltitude(1, center.lat) * worldSize || 1;
    const minElevationInPixels = elevation ? elevation.getMinElevationBelowMSL() * pixelsPerMeter : 0;
    const cameraToSeaLevelDistance = (cameraPosition[2] * worldSize - minElevationInPixels) / Math.cos(pitchRad);
    const topHalfSurfaceDistance = Math.sin(fovAboveCenter) * cameraToSeaLevelDistance / Math.sin(utils.clamp(Math.PI - groundAngle - fovAboveCenter, 0.01, Math.PI - 0.01));
    const furthestDistance = pitchAngle * topHalfSurfaceDistance + cameraToSeaLevelDistance;
    const horizonDistance = cameraToSeaLevelDistance * (1 / _horizonShift);
    const farZ = Math.min(furthestDistance * 1.01, horizonDistance);
    this.mercatorMatrix = new Matrix4().scale(new Vector3(worldSize, worldSize, worldSize / pixelsPerMeter));
    const may = new Matrix4().fromTranslation(new Vector3(0, 0, this.cameraToCenterDistance));
    this.labelPlaneMatrix = new Matrix4();
    const m = new Matrix4();
    m.scale(new Vector3(1, -1, 1));
    m.translate(new Vector3(-1, -1, 0));
    m.scale(new Vector3(2 / width, 2 / height, 1));
    this.glCoordMatrix = m;
    this.camera.aspect = width / height;
    this.cameraTranslateZ = this.cameraToCenterDistance;
    if (this.camera instanceof OrthographicCamera) {
      this.camera.projectionMatrix.orthographic(-width / 2, width / 2, height / 2, -height / 2, nearZ, farZ);
    } else {
      this.camera.projectionMatrix.perspective(fovRad, width / height, nearZ, farZ);
    }
    const cameraWorldMatrix = new Matrix4().premultiply(may).premultiply(new Matrix4().fromRotationX(pitchRad)).premultiply(new Matrix4().fromRotationZ(-degToRad(bearing)));
    if (elevation)
      cameraWorldMatrix.elements[14] = cameraPosition[2] * worldSize;
    this.camera.worldMatrix.copy(cameraWorldMatrix);
    this.camera.updateMatrixWorld();
    if (this.scene) {
      this.scene.localMatrix = new ProjectionMatrix().premultiply(rotateMap).premultiply(scale).premultiply(translateMap);
    }
  }
}

function getTileProjBounds(tileID) {
  const numTiles = 1 << tileID.z;
  return {
    left: tileID.wrapedX / numTiles,
    top: tileID.wrapedY / numTiles,
    right: (tileID.wrapedX + 1) / numTiles,
    bottom: (tileID.wrapedY + 1) / numTiles
  };
}
function getTileBounds(tileID) {
  const { z, x, y } = tileID;
  const wrap = tileID.wrap;
  const numTiles = 1 << z;
  const leftLng = lngFromMercatorX(x / numTiles, wrap);
  const rightLng = lngFromMercatorX((x + 1) / numTiles, wrap);
  const topLat = latFromMercatorY(y / numTiles);
  const bottomLat = latFromMercatorY((y + 1) / numTiles);
  return [leftLng, bottomLat, rightLng, topLat];
}
function getExtent(map) {
  const bounds = map?.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const [xmin, ymin, xmax, ymax] = [southWest.lng, southWest.lat, northEast.lng, northEast.lat];
  const minY = Math.max(ymin, -MAX_MERCATOR_LATITUDE);
  const maxY = Math.min(ymax, MAX_MERCATOR_LATITUDE);
  const p0 = fromLngLat({ lng: xmin, lat: maxY });
  const p1 = fromLngLat({ lng: xmax, lat: minY });
  return [p0.x, p0.y, p1.x, p1.y];
}
function getClampZoom(options) {
  const z = options.zoom;
  if (void 0 !== options.minzoom && z < options.minzoom) {
    return options.minzoom;
  }
  if (void 0 !== options.maxzoom && options.maxzoom < z) {
    return options.maxzoom;
  }
  return z;
}

class ViewState {
  constructor() {
    this.tileSize = 512;
    this.maxPitch = 60;
    this._horizonShift = 0.1;
  }
  /**
   * 获取 gl 宽度
   */
  get width() {
    return this._width;
  }
  /**
   * 获取 gl 高度
   */
  get height() {
    return this._height;
  }
  get fov() {
    return this.getFovRad() / Math.PI * 180;
  }
  get worldSize() {
    const scale = Math.pow(2, this.zoom - 1);
    return this.tileSize * scale;
  }
  getCenter() {
    return this._center;
  }
  getPitch() {
    return 0;
  }
  getBearing() {
    return 0;
  }
  getFovRad() {
    return 0.6435011087932844;
  }
  getCameraPosition() {
    return [0, 0, 0];
  }
  centerOffset() {
    return { x: 0, y: 0 };
  }
  project(lnglat) {
    const lat = utils.clamp(lnglat.lat, -MAX_MERCATOR_LATITUDE, MAX_MERCATOR_LATITUDE);
    const x = mercatorXfromLng(lnglat.lng);
    const y = mercatorYfromLat(lat);
    return { x: x * this.worldSize, y: y * this.worldSize, z: 0 };
  }
  get pixelsPerMeter() {
    return mercatorZfromAltitude(1, this._center.lat) * this.worldSize;
  }
  unproject(p) {
    const lng = lngFromMercatorX(p[0]);
    const lat = latFromMercatorY(p[1]);
    return [lng, lat];
  }
  update(state) {
    this._center = state.center;
    this._width = state.width;
    this._height = state.height;
    this.zoom = state.zoom;
  }
}
function wrapTile(x, range, includeMax) {
  const max = range[1];
  const min = range[0];
  const d = max - min;
  return {
    x: x === max && includeMax ? x : ((x - min) % d + d) % d + min,
    wrap: Math.floor(x / max)
  };
}
class WebglLayer extends BaseLayer {
  initialize(id, source, options) {
    super.initialize(id, source, options);
    this.viewState = new ViewState();
    this._currentTiles = [];
    this._unLimitTiles = [];
    this.source = source;
  }
  _resizeCanvas(scale) {
    super._resizeCanvas(scale);
    if (this.renderer) {
      this.renderer.setSize(this._width, this._height);
    }
    if (this.layer) {
      this.layer.resize(this._width, this._height);
    }
    this._render();
  }
  get camera() {
    return this.sync.camera;
  }
  getTileSize() {
    const s = utils.isNumber(this.source.tileSize) ? this.source.tileSize : this.source.tileSize?.[0] || 512;
    return new L.Point(s, s);
  }
  _redraw() {
    if (this._map && this.source) {
      const tileZoom = getClampZoom({
        zoom: this._map.getZoom(),
        minzoom: this.source.minZoom,
        maxzoom: this.source.maxZoom
      });
      if (tileZoom !== this._tileZoom) {
        this._tileZoom = tileZoom;
      }
      this._update();
    }
    return this;
  }
  _render() {
    if (this._map && this.viewState) {
      this.viewState.update({
        center: this._map.getCenter(),
        zoom: this._map.getZoom(),
        width: this._width,
        height: this._height
      });
    }
    if (!this.gl) {
      this.gl = utils.getContext(
        this.canvas,
        {
          preserveDrawingBuffer: false,
          antialias: true,
          // https://bugs.webkit.org/show_bug.cgi?id=237906
          stencil: true
        },
        true
      );
      this.renderer = new Renderer(this.gl, {
        autoClear: false,
        extensions: [
          "OES_texture_float",
          "OES_texture_float_linear",
          "WEBGL_color_buffer_float",
          "EXT_color_buffer_float"
        ]
      });
      this.scene = new Scene();
      this.sync = new CameraSync(this.viewState, "perspective", this.scene);
      this.planeCamera = new OrthographicCamera(0, 1, 1, 0, 0, 1);
      this.layer = new BaseLayer$1(
        this.source,
        {
          renderer: this.renderer,
          scene: this.scene
        },
        {
          renderType: this.options.renderType,
          renderFrom: this.options.renderFrom,
          styleSpec: this.options.styleSpec,
          displayRange: this.options.displayRange,
          widthSegments: this.options.widthSegments,
          heightSegments: this.options.heightSegments,
          wireframe: this.options.wireframe,
          picking: this.options.picking,
          mask: this.processMask(),
          getZoom: () => this.viewState.zoom,
          triggerRepaint: () => {
            requestAnimationFrame(() => this._update());
          },
          getTileProjSize: (z) => {
            const w = 1 / Math.pow(2, z);
            return [w, w];
          },
          getPixelsToUnits: () => {
            const pixel = 1;
            const y = this.canvas.clientHeight / 2 - pixel / 2;
            const x = this.canvas.clientWidth / 2 - pixel / 2;
            const left = fromLngLat(this.viewState.unproject([x, y]));
            const right = fromLngLat(this.viewState.unproject([x + pixel, y + pixel]));
            return [Math.abs(right.x - left.x), Math.abs(left.y - right.y)];
          },
          getPixelsToProjUnit: () => [this.viewState.pixelsPerMeter, this.viewState.pixelsPerMeter],
          getViewTiles: (source, renderType) => {
            let { type } = source;
            type = type !== LayerSourceType.timeline ? type : source.privateType;
            if (!this._map)
              return [];
            const wrapTiles = [];
            if (type === LayerSourceType.image) {
              const cornerCoords = source.coordinates.map((c) => fromLngLat({ lng: c[0], lat: c[1] }));
              const tileID = getCoordinatesCenterTileID(cornerCoords);
              if (source.wrapX) {
                const x = tileID.x;
                const y = tileID.y;
                const z = tileID.z;
                const wrap = 0;
                wrapTiles.push(
                  new TileID(z, wrap, z, x, y, {
                    getTileBounds: () => [
                      source.coordinates[0][0],
                      source.coordinates[2][1],
                      source.coordinates[1][0],
                      source.coordinates[0][1]
                    ],
                    getTileProjBounds: () => ({
                      left: tileID.extent[0] + wrap,
                      top: tileID.extent[1],
                      right: tileID.extent[2] + wrap,
                      bottom: tileID.extent[3]
                    })
                  })
                );
              } else {
                const x = tileID.x;
                const y = tileID.y;
                const z = tileID.z;
                const wrap = 0;
                wrapTiles.push(
                  new TileID(z, wrap, z, x, y, {
                    getTileBounds: () => [
                      source.coordinates[0][0],
                      source.coordinates[2][1],
                      source.coordinates[1][0],
                      source.coordinates[0][1]
                    ],
                    getTileProjBounds: () => ({
                      left: tileID.extent[0] + wrap,
                      top: tileID.extent[1],
                      right: tileID.extent[2] + wrap,
                      bottom: tileID.extent[3]
                    })
                  })
                );
              }
            } else if (type === LayerSourceType.tile) {
              const tiles = this._currentTiles;
              for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                const { x, y, z, wrap } = tile;
                if (source.wrapX) {
                  wrapTiles.push(
                    new TileID(z, wrap, z, x, y, {
                      getTileBounds,
                      getTileProjBounds
                    })
                  );
                } else if (tile.wrap === 0) {
                  wrapTiles.push(
                    new TileID(z, wrap, z, x, y, {
                      getTileBounds,
                      getTileProjBounds
                    })
                  );
                }
              }
            }
            return wrapTiles;
          },
          getExtent: () => getExtent(this._map),
          getGridTiles: (source) => {
            const wrapX = source.wrapX;
            if (!this._map)
              return [];
            const tiles = this._unLimitTiles;
            const wrapTiles = [];
            for (let i = 0; i < tiles.length; i++) {
              const tile = tiles[i];
              const { x, y, z, wrap } = tile;
              if (wrapX) {
                wrapTiles.push(
                  new TileID(z, wrap, z, x, y, {
                    getTileBounds,
                    getTileProjBounds
                  })
                );
              } else if (tile.wrap === 0) {
                wrapTiles.push(
                  new TileID(z, wrap, z, x, y, {
                    getTileBounds,
                    getTileProjBounds
                  })
                );
              }
            }
            return wrapTiles;
          }
        }
      );
    }
    if (this.sync) {
      this.sync.update();
    }
    if (this.layer) {
      this.layer.update();
    }
    this.glPrerender();
    this.glRender();
  }
  glPrerender() {
    this.scene.worldMatrixNeedsUpdate = true;
    this.scene.updateMatrixWorld();
    this.camera.updateMatrixWorld();
    const worlds = this.calcWrappedWorlds();
    this.layer?.prerender({
      worlds,
      camera: this.camera,
      planeCamera: this.planeCamera
    });
  }
  glRender() {
    this.scene.worldMatrixNeedsUpdate = true;
    this.scene.updateMatrixWorld();
    this.camera.updateMatrixWorld();
    const worlds = this.calcWrappedWorlds();
    this.layer?.render({
      worlds,
      camera: this.camera,
      planeCamera: this.planeCamera
    });
  }
  async picker(coordinates) {
    if (!this.options.picking) {
      console.warn("[Layer]: please enable picking options!");
      return null;
    }
    if (!this.layer || !coordinates || !this._map) {
      console.warn("[Layer]: layer not initialized!");
      return null;
    }
    const point = this._map.project(coordinates);
    return this.layer.picker([point.x, point.y]);
  }
  calcWrappedWorlds() {
    return [0];
  }
  _resetView(e) {
    const animating = e && (e.pinch || e.flyTo);
    this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
  }
  _resetGrid() {
    const map = this._map;
    const crs = map.options.crs;
    const tileSize = this.getTileSize();
    const tileZoom = this._tileZoom;
    const bounds = this._map.getPixelWorldBounds(this._tileZoom);
    if (bounds) {
      this._globalTileRange = this._pxBoundsToTileRange(bounds);
    }
    this._wrapX = crs.wrapLng && [
      Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
      Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
    ];
    this._wrapY = crs.wrapLat && [
      Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
      Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
    ];
  }
  _setView(center, zoom, noPrune, noUpdate) {
    let tileZoom = Math.round(zoom);
    if (this.options.maxZoom !== void 0 && tileZoom > this.options.maxZoom || this.options.minZoom !== void 0 && tileZoom < this.options.minZoom) {
      tileZoom = void 0;
    } else {
      tileZoom = getClampZoom({
        minzoom: this.source.minZoom,
        maxzoom: this.source.maxZoom,
        zoom: tileZoom
      });
    }
    const tileZoomChanged = this.options.updateWhenZooming && tileZoom !== this._tileZoom;
    if (!noUpdate || tileZoomChanged) {
      this._tileZoom = tileZoom;
      this._resetGrid();
      if (tileZoom !== void 0) {
        this._update(center);
      }
    }
  }
  _tileCoordsToBounds(coords) {
    const bp = this._tileCoordsToNwSe(coords);
    let bounds = new L.LatLngBounds(bp[0], bp[1]);
    if (!this.source.wrapX) {
      bounds = this._map.wrapLatLngBounds(bounds);
    }
    return bounds;
  }
  _tileCoordsToNwSe(coords) {
    const map = this._map;
    const tileSize = this.getTileSize();
    const nwPoint = coords.scaleBy(tileSize);
    const sePoint = nwPoint.add(tileSize);
    const nw = map.unproject(nwPoint, coords.z);
    const se = map.unproject(sePoint, coords.z);
    return [nw, se];
  }
  _isValidTile(coords) {
    const crs = this._map.options.crs;
    if (!crs.infinite) {
      const bounds = this._globalTileRange;
      if (!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x) || !crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y)) {
        return false;
      }
    }
    return true;
  }
  _wrapCoords(coords) {
    const t = this._wrapX ? wrapTile(coords.x, this._wrapX) : { x: coords.x, wrap: 0 };
    const newCoords = new L.Point(
      t.x,
      this._wrapY && !this.source.wrapX ? L.Util.wrapNum(coords.y, this._wrapY) : coords.y
    );
    newCoords.z = coords.z;
    newCoords.wrap = t.wrap;
    return newCoords;
  }
  _update(center) {
    const map = this._map;
    if (!map || !this.source) {
      return;
    }
    const zoom = getClampZoom({
      zoom: map.getZoom(),
      minzoom: this.source.minZoom,
      maxzoom: this.source.maxZoom
    });
    if (center === void 0) {
      center = map.getCenter();
    }
    if (this._tileZoom === void 0) {
      return;
    }
    const pixelBounds = this._getTiledPixelBounds(center, this._tileZoom);
    const tileRange = this._pxBoundsToTileRange(pixelBounds);
    const tileCenter = tileRange.getCenter();
    const queue = [];
    if (!(isFinite(tileRange.min.x) && isFinite(tileRange.min.y) && isFinite(tileRange.max.x) && isFinite(tileRange.max.y))) {
      throw new Error("Attempted to load an infinite number of tiles");
    }
    if (Math.abs(zoom - this._tileZoom) > 1) {
      this._setView(center, zoom);
      return;
    }
    for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
      for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
        const coords = new L.Point(i, j);
        coords.z = this._tileZoom;
        if (!this._isValidTile(coords)) {
          continue;
        }
        queue.push(this._wrapCoords(coords));
      }
    }
    queue.sort((a, b) => a.distanceTo(tileCenter) - b.distanceTo(tileCenter));
    const z = map.getZoom();
    const bounds = this._getTiledPixelBounds(center, z);
    if (bounds) {
      const unLimitTileRange = this._pxBoundsToTileRange(bounds);
      const tc = tileRange.getCenter();
      const tileCoords = [];
      for (let j = unLimitTileRange.min.y; j <= unLimitTileRange.max.y; j++) {
        for (let i = unLimitTileRange.min.x; i <= unLimitTileRange.max.x; i++) {
          const coords = new L.Point(i, j);
          coords.z = z;
          if (!this._isValidTile(coords)) {
            continue;
          }
          tileCoords.push(this._wrapCoords(coords));
        }
      }
      tileCoords.sort((a, b) => a.distanceTo(tc) - b.distanceTo(tc));
      this._unLimitTiles = tileCoords;
    }
    this._currentTiles = queue;
    this._render();
    return queue;
  }
  _getTiledPixelBounds(center, zoom) {
    const map = this._map;
    const mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom();
    const scale = map.getZoomScale(mapZoom, zoom);
    const pixelCenter = map.project(center, zoom).floor();
    const halfSize = map.getSize().divideBy(scale * 2);
    return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
  }
  _pxBoundsToTileRange(bounds) {
    const tileSize = this.getTileSize();
    return new L.Bounds(
      bounds.min.unscaleBy(tileSize).floor(),
      bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1])
    );
  }
  handleZoom() {
    this._resetView();
    if (this.layer) {
      this.layer.handleZoom();
    }
  }
  onMoveEnd() {
    this._reset();
    if (!this._map || this._map._animatingZoom) {
      return;
    }
    if (this.layer) {
      this.layer.moveEnd();
    }
  }
  onMoveStart() {
    if (this.layer) {
      this.layer.moveStart();
    }
  }
  _animateZoom(event) {
    super._animateZoom(event);
    this._setView(event.center, event.zoom, true, event.noUpdate);
    this.handleZoom();
  }
  getEvents() {
    const events = {
      resize: this._onResize,
      viewreset: this._resetView,
      moveend: this.onMoveEnd,
      movestart: this.onMoveStart,
      zoom: this.handleZoom,
      zoomend: this._reset
    };
    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      events.zoomanim = this._animateZoom;
    }
    return events;
  }
  updateOptions(options) {
    this.options = {
      ...this.options,
      ...options || {}
    };
    if (this.layer) {
      this.layer.updateOptions(options);
    }
    this._redraw();
  }
  getMask() {
    return this.options.mask;
  }
  processMask() {
    if (this.options.mask) {
      const mask = this.options.mask;
      const data = mask.data;
      // rewind(data, true);
      const tr = (coords) => {
        const mercatorCoordinates = [];
        for (let i2 = 0; i2 < coords.length; i2++) {
          const coord = coords[i2];
          const p = fromLngLat(coord);
          mercatorCoordinates.push([p.x, p.y]);
        }
        return mercatorCoordinates;
      };
      const features = data.features;
      const len = features.length;
      let i = 0;
      const fs = [];
      for (; i < len; i++) {
        const feature = features[i];
        const coordinates = feature.geometry.coordinates;
        const type = feature.geometry.type;
        if (type === "Polygon") {
          fs.push({
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: feature.geometry.coordinates.map((c) => tr(c))
            }
          });
        } else if (type === "MultiPolygon") {
          const css = [];
          for (let k = 0; k < coordinates.length; k++) {
            const coordinate = coordinates[k];
            const cs = [];
            for (let n = 0; n < coordinate.length; n++) {
              cs.push(tr(coordinates[k][n]));
            }
            css.push(cs);
          }
          fs.push({
            type: "Feature",
            properties: {},
            geometry: {
              type: "MultiPolygon",
              coordinates: css
            }
          });
        }
      }
      return {
        data: polygon2buffer(fs),
        type: mask.type
      };
    }
  }
  setMask(mask) {
    this.options.mask = Object.assign({}, this.options.mask, mask);
    if (this.layer) {
      this.layer.setMask(this.processMask());
    }
  }
  onRemove() {
    if (this.layer) {
      this.layer.destroy();
      this.layer = null;
    }
    if (this.source) {
      if (Array.isArray(this.source.sourceCache)) {
        this.source.sourceCache?.forEach((s) => {
          s?.clearTiles();
        });
      } else {
        this.source.sourceCache?.clearTiles();
      }
    }
    this._currentTiles = [];
    this._unLimitTiles = [];
    this.gl = null;
    this._tileZoom = void 0;
    return super.onRemove();
  }
}

export { WebglLayer, WindLayer };
//# sourceMappingURL=leaflet-wind.esm.js.map
