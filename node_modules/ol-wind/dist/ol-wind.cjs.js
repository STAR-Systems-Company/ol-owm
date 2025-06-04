'use strict';

var layer = require('ol/layer');
var proj = require('ol/proj');
var CanvasLayerRenderer = require('ol/renderer/canvas/Layer');
var transform = require('ol/transform');
var extent = require('ol/extent');
var windCore = require('wind-core');

const ViewHint = {
  ANIMATING: 0,
  INTERACTING: 1
};
class WindLayerRender extends CanvasLayerRenderer {
  constructor(layer) {
    super(layer);
    this.pixelTransform = transform.create();
    this.inversePixelTransform = transform.create();
  }
  // useContainer(target: HTMLElement, transform: string, backgroundColor: number) 这里在 v6.3.0 后有 break change
  useContainer(target, transform, backgroundColor) {
    super.useContainer(null, transform, backgroundColor);
  }
  getBackground(frameState) {
    if (super.getBackground) {
      return super.getBackground(frameState);
    }
    return "";
  }
  prepareFrame(frameState) {
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const viewState = frameState.viewState;
    const hints = frameState.viewHints;
    let renderedExtent = frameState.extent;
    if (layerState.extent !== void 0) {
      renderedExtent = extent.getIntersection(
        renderedExtent,
        proj.fromUserExtent(layerState.extent, viewState.projection)
      );
    }
    if (!hints[ViewHint.ANIMATING] && !frameState.animate && !hints[ViewHint.INTERACTING] && !extent.isEmpty(renderedExtent)) {
      if (this.wind?.isStop?.()) {
        this.wind.start();
      }
      return true;
    } else {
      const layer = this.getLayer();
      return layer.get("forceRender");
    }
  }
  prepareContainer(frameState, target) {
    const size = frameState.size;
    const rotation = frameState.viewState.rotation;
    const pixelRatio = frameState.pixelRatio;
    const width = Math.round(size[0] * pixelRatio);
    const height = Math.round(size[1] * pixelRatio);
    transform.compose(
      this.pixelTransform,
      frameState.size[0] / 2,
      frameState.size[1] / 2,
      1 / pixelRatio,
      1 / pixelRatio,
      rotation,
      -width / 2,
      -height / 2
    );
    transform.makeInverse(this.inversePixelTransform, this.pixelTransform);
    const canvasTransform = transform.toString(this.pixelTransform);
    this.useContainer(target, canvasTransform, this.getBackground(frameState));
    if (!this.containerReused) {
      const canvas = this.context.canvas;
      if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (canvasTransform !== canvas.style.transform) {
        canvas.style.transform = canvasTransform;
      }
    }
  }
  getRenderContext(frameState) {
    return this.context;
  }
  renderFrame(frameState, target) {
    const layerState = frameState.layerStatesArray[frameState.layerIndex];
    const viewState = frameState.viewState;
    this.prepareContainer(frameState, target);
    const context = this.getRenderContext(frameState);
    context.imageSmoothingEnabled = false;
    this.preRender(context, frameState);
    let clipped = false;
    let render = true;
    if (layerState.extent) {
      const layerExtent = proj.fromUserExtent(layerState.extent, viewState.projection);
      render = extent.intersects(layerExtent, frameState.extent);
      clipped = render && !extent.containsExtent(layerExtent, frameState.extent);
      if (clipped) {
        this.clipUnrotated(context, frameState, layerExtent);
      }
    }
    const layer = this.getLayer();
    const opt = layer.getWindOptions();
    const data = layer.getData();
    this.execute(this.context, frameState, opt, data);
    this.postRender(this.context, frameState);
    if (clipped) {
      context.restore();
    }
    context.imageSmoothingEnabled = true;
    return this.container;
  }
  setOptions(options) {
    if (this.wind) {
      this.wind.setOptions(options);
    }
  }
  setData(field) {
    if (this.wind) {
      this.wind.updateData(field);
    }
  }
  execute(context, frameState, opt, data) {
    if (!this.wind) {
      this.wind = new windCore.WindCore(context, opt, data);
      this.wind.project = this.getPixelFromCoordinateInternal.bind(this);
      this.wind.unproject = this.getCoordinateFromPixel.bind(this);
      this.wind.intersectsCoordinate = this.intersectsCoordinate.bind(this);
      this.wind.postrender = () => {
      };
      this.wind.prerender();
    }
  }
  getPixelFromCoordinateInternal(coordinate) {
    const frameState = this.frameState;
    if (!frameState) {
      return null;
    } else {
      const viewState = frameState.viewState;
      const pixelRatio = frameState.pixelRatio;
      const point = proj.transform(coordinate, "EPSG:4326", viewState.projection);
      const viewCoordinate = proj.fromUserCoordinate(point, viewState.projection);
      const pixel = transform.apply(frameState.coordinateToPixelTransform, viewCoordinate.slice(0, 2));
      return [pixel[0] * pixelRatio, pixel[1] * pixelRatio];
    }
  }
  getCoordinateFromPixel(pixel) {
    const frameState = this.frameState;
    if (!frameState) {
      return null;
    } else {
      const viewState = frameState.viewState;
      const viewCoordinate = transform.apply(frameState.pixelToCoordinateTransform, pixel.slice(0, 2));
      const coordinate = proj.toUserCoordinate(viewCoordinate, viewState.projection);
      const point = proj.transform(coordinate, viewState.projection, "EPSG:4326");
      return [point[0], point[1]];
    }
  }
  intersectsCoordinate(coordinate) {
    const frameState = this.frameState;
    if (frameState) {
      const viewState = frameState.viewState;
      const point = proj.transform(coordinate, "EPSG:4326", viewState.projection);
      const viewCoordinate = proj.fromUserCoordinate(point, viewState.projection);
      return extent.containsCoordinate(frameState.extent, viewCoordinate.slice(0, 2));
    }
    return true;
  }
}

const _options = {
  forceRender: true,
  windOptions: {}
};
class WindLayer extends layer.Layer {
  constructor(data, options) {
    const opt = windCore.assign({}, _options, options);
    super(opt);
    this.options = opt;
    this.className_ = options.className !== void 0 ? options.className : "wind-layer";
    this.pickWindOptions();
    if (data) {
      this.setData(data, options.fieldOptions);
    }
  }
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
  appendTo(map) {
    map.addLayer(this);
  }
  onAdd() {
    const renderer = this.getRenderer();
    if (renderer) {
      renderer.wind?.start();
    }
  }
  onRemove() {
    const renderer = this.getRenderer();
    if (renderer) {
      renderer.wind.stop();
    }
  }
  createRenderer() {
    return new WindLayerRender(this);
  }
  getRenderer() {
    return super.getRenderer();
  }
  pickWindOptions() {
    Object.keys(windCore.defaultOptions).forEach((key) => {
      if (key in this.options) {
        if (this.options.windOptions === void 0) {
          this.options.windOptions = {};
        }
        this.options.windOptions[key] = this.options[key];
      }
    });
  }
  /**
   * 获取图层现有数据
   * get wind layer data
   */
  // @ts-ignore overwrite base layer
  getData() {
    return this.field;
  }
  /**
   * 设置图层数据
   * set layer data
   * @param data
   * @param options
   * @returns {WindLayer}
   */
  setData(data, options = {}) {
    if (data && data.checkFields && data.checkFields()) {
      this.field = data;
    } else if (windCore.isArray(data)) {
      this.field = windCore.formatData(data, options);
    } else {
      console.error("Illegal data");
    }
    const renderer = this.getRenderer();
    if (renderer && this.field) {
      renderer.setData(this.field);
    }
    this.changed();
    return this;
  }
  /**
   * 设置风场图层的配置项
   * @param options
   */
  setWindOptions(options) {
    const beforeOptions = this.options.windOptions || {};
    this.options = windCore.assign(this.options, {
      windOptions: windCore.assign(beforeOptions, options || {})
    });
    const renderer = this.getRenderer();
    if (renderer) {
      const windOptions = this.options.windOptions;
      renderer.setOptions(windOptions);
    }
    this.changed();
  }
  /**
   * 获取风场图层渲染的配置项
   */
  getWindOptions() {
    return this.options.windOptions || {};
  }
  render(frameState, target) {
    const layerRenderer = this.getRenderer();
    if (layerRenderer && layerRenderer.prepareFrame(frameState)) {
      this.rendered = true;
      return layerRenderer.renderFrame(frameState, target);
    }
    return null;
  }
  // since v6
  setMapInternal(map) {
    super.setMapInternal(map);
    if (!map) {
      this.onRemove();
    } else {
      this.onAdd();
    }
  }
  /**
   * 支持以 setMap 方式添加图层
   * @param map
   */
  setMap(map) {
    super.setMap(map);
    if (!map) {
      this.onRemove();
    } else {
      this.onAdd();
    }
  }
}

Object.defineProperty(exports, "Field", {
  enumerable: true,
  get: function () { return windCore.Field; }
});
exports.WindLayer = WindLayer;
//# sourceMappingURL=ol-wind.cjs.js.map
