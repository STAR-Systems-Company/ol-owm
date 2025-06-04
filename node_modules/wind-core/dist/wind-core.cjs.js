'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const symToStringTag = typeof Symbol !== "undefined" ? Symbol.toStringTag : void 0;
function baseGetTag(value) {
  if (value === null) {
    return value === void 0 ? "[object Undefined]" : "[object Null]";
  }
  if (!(symToStringTag && symToStringTag in Object(value))) {
    return toString.call(value);
  }
  const isOwn = hasOwnProperty.call(value, symToStringTag);
  const tag = value[symToStringTag];
  let unmasked = false;
  try {
    value[symToStringTag] = void 0;
    unmasked = true;
  } catch (e) {
  }
  const result = Object.prototype.toString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
function TypeOf(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  const tag = baseGetTag(value);
  return tag === "[object Function]" || tag === "[object AsyncFunction]" || tag === "[object GeneratorFunction]" || tag === "[object Proxy]";
}
function isObject(value) {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]";
}
function isArrayBuffer(val) {
  return Object.prototype.toString.call(val) === "[object ArrayBuffer]";
}
function isString(value) {
  if (value == null) {
    return false;
  }
  return typeof value === "string" || value.constructor !== null && value.constructor === String;
}
function isNumber(value) {
  return Object.prototype.toString.call(value) === "[object Number]" && !isNaN(value);
}
function isEmpty(object) {
  let property;
  for (property in object) {
    return false;
  }
  return !property;
}
function isNull(obj) {
  return obj == null;
}
function isArray(arr) {
  return Array.isArray(arr);
}
function assign(target, ...sources) {
  return Object.assign(target, ...sources);
}
function warnLog(msg, n) {
  console.warn(`${n || "wind-layer"}: ${msg}`);
}
const warnings = {};
function warnOnce(namespaces, msg) {
  if (!warnings[msg]) {
    warnLog(msg, namespaces);
    warnings[msg] = true;
  }
}
function floorMod(a, n) {
  return a - n * Math.floor(a / n);
}
function isValide(val) {
  return val !== void 0 && val !== null && !isNaN(val);
}
function formatData(data, options = {}) {
  let uComp = void 0;
  let vComp = void 0;
  data.forEach(function(record) {
    switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
      case "1,2":
      case "2,2":
        uComp = record;
        break;
      case "1,3":
      case "2,3":
        vComp = record;
        break;
    }
  });
  if (!vComp || !uComp) {
    return void 0;
  }
  const header = uComp.header;
  const vectorField = new Field({
    xmin: header.lo1,
    // 一般格点数据是按照矩形范围来切割，所以定义其经纬度范围
    ymin: header.la1,
    xmax: header.lo2,
    ymax: header.la2,
    deltaX: header.dx,
    // x（经度）增量
    deltaY: header.dy,
    // y（维度）增量
    cols: header.nx,
    // 列（可由 `(xmax - xmin) / deltaX` 得到）
    rows: header.ny,
    // 行
    us: uComp.data,
    // U分量
    vs: vComp.data,
    // V分量
    ...options
  });
  return vectorField;
}
function createCanvas(width, height, retina, Canvas) {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width * retina;
    canvas.height = height * retina;
    return canvas;
  } else {
    return new Canvas(width * retina, height * retina);
  }
}
function removeDomNode(node) {
  if (!node) {
    return null;
  }
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
  return node;
}
const keyword = /(\D+)/;
const hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
const rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d.]+)\s*)?\)$/;
const colorNames = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};
function getColor(string) {
  let rgb = [];
  if (string.match(hex)) {
    let match = string.match(hex);
    if (match !== null) {
      match = match[1];
      for (let i = 0; i < 3; i++) {
        const i2 = i * 2;
        rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
      }
      rgb[3] = 1;
    }
  } else if (string.match(rgba)) {
    const match = string.match(rgba);
    for (let i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i + 1], 0);
    }
    if (match[4]) {
      rgb[3] = parseFloat(match[4]);
    } else {
      rgb[3] = 1;
    }
  } else if (string.match(keyword)) {
    const match = string.match(keyword);
    if (match[1] === "transparent") {
      return [0, 0, 0, 0];
    }
    rgb = colorNames[match[1]];
    if (!rgb) {
      return null;
    }
    rgb[3] = 1;
    return rgb;
  } else {
    return null;
  }
  return rgb;
}
function compareVersion(v1, v2) {
  v1 = v1.split(".");
  v2 = v2.split(".");
  const len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push("0");
  }
  while (v2.length < len) {
    v2.push("0");
  }
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}

class Vector {
  constructor(u, v) {
    this.u = u;
    this.v = v;
    this.m = this.magnitude();
  }
  /**
   * 向量值（这里指风速）
   * @returns {Number}
   */
  magnitude() {
    return Math.sqrt(this.u ** 2 + this.v ** 2);
  }
  /**
   * 流体方向 （这里指风向，范围为0-360º）
   * N is 0º and E is 90º
   * @returns {Number}
   */
  directionTo() {
    const verticalAngle = Math.atan2(this.u, this.v);
    let inDegrees = verticalAngle * (180 / Math.PI);
    if (inDegrees < 0) {
      inDegrees += 360;
    }
    return inDegrees;
  }
  /**
   * Angle in degrees (0 to 360º) From x-->
   * N is 0º and E is 90º
   * @returns {Number}
   */
  directionFrom() {
    const a = this.directionTo();
    return (a + 180) % 360;
  }
}

class Field {
  constructor(params) {
    this.grid = [];
    this.xmin = params.xmin;
    this.xmax = params.xmax;
    this.ymin = params.ymin;
    this.ymax = params.ymax;
    this.cols = params.cols;
    this.rows = params.rows;
    this.us = params.us;
    this.vs = params.vs;
    this.deltaX = params.deltaX;
    this.deltaY = params.deltaY;
    this.flipY = Boolean(params.flipY);
    this.ymin = Math.min(params.ymax, params.ymin);
    this.ymax = Math.max(params.ymax, params.ymin);
    if (!(this.deltaY < 0 && this.ymin < this.ymax)) {
      if (params.flipY === void 0) {
        this.flipY = true;
      }
      console.warn("[wind-core]: The data is flipY");
    }
    this.isFields = true;
    const cols = Math.ceil((this.xmax - this.xmin) / params.deltaX);
    const rows = Math.ceil((this.ymax - this.ymin) / params.deltaY);
    if (cols !== this.cols || rows !== this.rows) {
      console.warn("[wind-core]: The data grid not equal");
    }
    this.isContinuous = Math.floor(this.cols * params.deltaX) >= 360;
    this.translateX = "translateX" in params ? params.translateX : this.xmax > 180;
    if ("wrappedX" in params) {
      warnOnce("[wind-core]: ", "`wrappedX` namespace will deprecated please use `translateX` instead\uFF01");
    }
    this.wrapX = Boolean(params.wrapX);
    this.grid = this.buildGrid();
    this.range = this.calculateRange();
  }
  // from https://github.com/sakitam-fdd/wind-layer/blob/95368f9433/src/windy/windy.js#L110
  buildGrid() {
    const grid = [];
    let p = 0;
    const { rows, cols, us, vs } = this;
    for (let j = 0; j < rows; j++) {
      const row = [];
      for (let i = 0; i < cols; i++, p++) {
        const u = us[p];
        const v = vs[p];
        const valid = this.isValid(u) && this.isValid(v);
        row[i] = valid ? new Vector(u, v) : null;
      }
      if (this.isContinuous) {
        row.push(row[0]);
      }
      grid[j] = row;
    }
    return grid;
  }
  /**
   * release data
   */
  release() {
    this.grid = [];
  }
  /**
   * grib data extent
   * 格点数据范围
   */
  extent() {
    return [this.xmin, this.ymin, this.xmax, this.ymax];
  }
  /**
   * Bilinear interpolation for Vector
   * 针对向量进行双线性插值
   * https://en.wikipedia.org/wiki/Bilinear_interpolation
   * @param   {Number} x
   * @param   {Number} y
   * @param   {Number[]} g00
   * @param   {Number[]} g10
   * @param   {Number[]} g01
   * @param   {Number[]} g11
   * @returns {Vector}
   */
  bilinearInterpolateVector(x, y, g00, g10, g01, g11) {
    const rx = 1 - x;
    const ry = 1 - y;
    const a = rx * ry;
    const b = x * ry;
    const c = rx * y;
    const d = x * y;
    const u = g00.u * a + g10.u * b + g01.u * c + g11.u * d;
    const v = g00.v * a + g10.v * b + g01.v * c + g11.v * d;
    return new Vector(u, v);
  }
  /**
   * calculate vector value range
   */
  calculateRange() {
    if (!this.grid || !this.grid[0])
      return;
    const rows = this.grid.length;
    const cols = this.grid[0].length;
    let min;
    let max;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const vec = this.grid[j][i];
        if (vec !== null) {
          const val = vec.m || vec.magnitude();
          if (min === void 0) {
            min = val;
          } else if (max === void 0) {
            max = val;
            min = Math.min(min, max);
            max = Math.max(min, max);
          } else {
            min = Math.min(val, min);
            max = Math.max(val, max);
          }
        }
      }
    }
    return [min, max];
  }
  /**
   * 检查 uv是否合法
   * @param x
   * @private
   */
  isValid(x) {
    return x !== null && x !== void 0;
  }
  getWrappedLongitudes() {
    let xmin = this.xmin;
    let xmax = this.xmax;
    if (this.translateX) {
      if (this.isContinuous) {
        xmin = -180;
        xmax = 180;
      } else {
        xmax = this.xmax - 360;
        xmin = this.xmin - 360;
      }
    }
    return [xmin, xmax];
  }
  contains(lon, lat) {
    const [xmin, xmax] = this.getWrappedLongitudes();
    if (xmax > 180 && lon >= -180 && lon <= xmax - 360) {
      lon += 360;
    } else if (xmin < -180 && lon <= 180 && lon >= xmin + 360) {
      lon -= 360;
    }
    const longitudeIn = lon >= xmin && lon <= xmax;
    let latitudeIn;
    if (this.deltaY >= 0) {
      latitudeIn = lat >= this.ymin && lat <= this.ymax;
    } else {
      latitudeIn = lat >= this.ymax && lat <= this.ymin;
    }
    return longitudeIn && latitudeIn;
  }
  /**
   * 获取经纬度所在的位置索引
   * @param lon
   * @param lat
   */
  getDecimalIndexes(lon, lat) {
    const i = floorMod(lon - this.xmin, 360) / this.deltaX;
    if (this.flipY) {
      const j = (this.ymax - lat) / this.deltaY;
      return [i, j];
    } else {
      const j = (this.ymin + lat) / this.deltaY;
      return [i, j];
    }
  }
  /**
   * Nearest value at lon-lat coordinates
   * 线性插值
   * @param lon
   * @param lat
   */
  valueAt(lon, lat) {
    let flag = false;
    if (this.wrapX) {
      flag = true;
    } else if (this.contains(lon, lat)) {
      flag = true;
    }
    if (!flag)
      return null;
    const indexes = this.getDecimalIndexes(lon, lat);
    const ii = Math.floor(indexes[0]);
    const jj = Math.floor(indexes[1]);
    const ci = this.clampColumnIndex(ii);
    const cj = this.clampRowIndex(jj);
    return this.valueAtIndexes(ci, cj);
  }
  /**
   * Get interpolated grid value lon-lat coordinates
   * 双线性插值
   * @param lon
   * @param lat
   */
  interpolatedValueAt(lon, lat) {
    let flag = false;
    if (this.wrapX) {
      flag = true;
    } else if (this.contains(lon, lat)) {
      flag = true;
    }
    if (!flag)
      return null;
    const [i, j] = this.getDecimalIndexes(lon, lat);
    return this.interpolatePoint(i, j);
  }
  hasValueAt(lon, lat) {
    const value = this.valueAt(lon, lat);
    return value !== null;
  }
  /**
   * 基于向量的双线性插值
   * @param i
   * @param j
   */
  interpolatePoint(i, j) {
    const indexes = this.getFourSurroundingIndexes(i, j);
    const [fi, ci, fj, cj] = indexes;
    const values = this.getFourSurroundingValues(fi, ci, fj, cj);
    if (values) {
      const [g00, g10, g01, g11] = values;
      return this.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
    }
    return null;
  }
  /**
   * Check the column index is inside the field,
   * adjusting to min or max when needed
   * @private
   * @param   {Number} ii - index
   * @returns {Number} i - inside the allowed indexes
   */
  clampColumnIndex(ii) {
    let i = ii;
    if (ii < 0) {
      i = 0;
    }
    const maxCol = this.cols - 1;
    if (ii > maxCol) {
      i = maxCol;
    }
    return i;
  }
  /**
   * Check the row index is inside the field,
   * adjusting to min or max when needed
   * @private
   * @param   {Number} jj index
   * @returns {Number} j - inside the allowed indexes
   */
  clampRowIndex(jj) {
    let j = jj;
    if (jj < 0) {
      j = 0;
    }
    const maxRow = this.rows - 1;
    if (jj > maxRow) {
      j = maxRow;
    }
    return j;
  }
  /**
   * 计算索引位置周围的数据
   * @private
   * @param   {Number} i - decimal index
   * @param   {Number} j - decimal index
   * @returns {Array} [fi, ci, fj, cj]
   */
  getFourSurroundingIndexes(i, j) {
    const fi = Math.floor(i);
    let ci = fi + 1;
    if (this.isContinuous && ci >= this.cols) {
      ci = 0;
    }
    ci = this.clampColumnIndex(ci);
    const fj = this.clampRowIndex(Math.floor(j));
    const cj = this.clampRowIndex(fj + 1);
    return [fi, ci, fj, cj];
  }
  /**
   * Get four surrounding values or null if not available,
   * from 4 integer indexes
   * @private
   * @param   {Number} fi
   * @param   {Number} ci
   * @param   {Number} fj
   * @param   {Number} cj
   * @returns {Array}
   */
  getFourSurroundingValues(fi, ci, fj, cj) {
    let row;
    if (row = this.grid[fj]) {
      const g00 = row[fi];
      const g10 = row[ci];
      if (this.isValid(g00) && this.isValid(g10) && (row = this.grid[cj])) {
        const g01 = row[fi];
        const g11 = row[ci];
        if (this.isValid(g01) && this.isValid(g11)) {
          return [g00, g10, g01, g11];
        }
      }
    }
    return null;
  }
  /**
   * Value for grid indexes
   * @param   {Number} i - column index (integer)
   * @param   {Number} j - row index (integer)
   * @returns {Vector|Number}
   */
  valueAtIndexes(i, j) {
    return this.grid[j][i];
  }
  /**
   * Lon-Lat for grid indexes
   * @param   {Number} i - column index (integer)
   * @param   {Number} j - row index (integer)
   * @returns {Number[]} [lon, lat]
   */
  lonLatAtIndexes(i, j) {
    const lon = this.longitudeAtX(i);
    const lat = this.latitudeAtY(j);
    return [lon, lat];
  }
  /**
   * Longitude for grid-index
   * @param   {Number} i - column index (integer)
   * @returns {Number} longitude at the center of the cell
   */
  longitudeAtX(i) {
    const halfXPixel = this.deltaX / 2;
    let lon = this.xmin + halfXPixel + i * this.deltaX;
    if (this.translateX) {
      lon = lon > 180 ? lon - 360 : lon;
    }
    return lon;
  }
  /**
   * Latitude for grid-index
   * @param   {Number} j - row index (integer)
   * @returns {Number} latitude at the center of the cell
   */
  latitudeAtY(j) {
    const halfYPixel = this.deltaY / 2;
    return this.ymax - halfYPixel - j * this.deltaY;
  }
  /**
   * 生成粒子位置
   * @param o
   * @param width
   * @param height
   * @param unproject
   * @return IPosition
   */
  randomize(o = {}, width, height, unproject) {
    const i = Math.random() * (width || this.cols) | 0;
    const j = Math.random() * (height || this.rows) | 0;
    const coords = unproject([i, j]);
    if (coords !== null) {
      o.x = coords[0];
      o.y = coords[1];
    } else {
      o.x = this.longitudeAtX(i);
      o.y = this.latitudeAtY(j);
    }
    return o;
  }
  /**
   * 判断是否是 `Field` 的实例
   * @return boolean
   */
  checkFields() {
    return this.isFields;
  }
}

const defaultOptions = {
  globalAlpha: 0.9,
  // 全局透明度
  lineWidth: 1,
  // 线条宽度
  colorScale: "#fff",
  velocityScale: 1 / 25,
  // particleAge: 90,
  maxAge: 90,
  // alias for particleAge
  // particleMultiplier: 1 / 300, // TODO: PATHS = Math.round(width * height * particleMultiplier);
  paths: 800,
  frameRate: 20,
  useCoordsDraw: true
};
function indexFor(m, min, max, colorScale) {
  return Math.max(0, Math.min(colorScale.length - 1, Math.round((m - min) / (max - min) * (colorScale.length - 1))));
}
class WindCore {
  constructor(ctx, options, field) {
    this.particles = [];
    this.generated = false;
    this.ctx = ctx;
    if (!this.ctx) {
      throw new Error("ctx error");
    }
    this.animate = this.animate.bind(this);
    this.setOptions(options);
    if (field) {
      this.updateData(field);
    }
  }
  static {
    this.Field = Field;
  }
  /**
   * 设置配置项
   * @param options
   */
  setOptions(options) {
    this.options = { ...defaultOptions, ...options };
    const { width, height } = this.ctx.canvas;
    if ("particleAge" in options && !("maxAge" in options) && isNumber(this.options.particleAge)) {
      this.options.maxAge = this.options.particleAge;
    }
    if ("particleMultiplier" in options && !("paths" in options) && isNumber(this.options.particleMultiplier)) {
      this.options.paths = Math.round(width * height * this.options.particleMultiplier);
    }
    this.prerender();
  }
  /**
   * 获取配置项
   */
  getOptions() {
    return this.options;
  }
  /**
   * 更新数据
   * @param field
   */
  updateData(field) {
    this.field = field;
    if (!this.generated) {
      return;
    }
    this.particles = this.prepareParticlePaths();
  }
  // @ts-ignore
  project(...args) {
    throw new Error("project must be overriden");
  }
  // @ts-ignore
  unproject(...args) {
    throw new Error("unproject must be overriden");
  }
  /**
   * 判断位置是否在当前视窗内
   * @param coordinates
   */
  intersectsCoordinate(coordinates) {
    throw new Error("must be overriden");
  }
  /**
   * 清空当前画布
   */
  clearCanvas() {
    this.stop();
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.forceStop = false;
  }
  isStop() {
    return !this.starting;
  }
  /**
   * 启动粒子动画
   */
  start() {
    this.starting = true;
    this.forceStop = false;
    this.then = Date.now();
    this.animate();
  }
  /**
   * 停止粒子动画
   */
  stop() {
    cancelAnimationFrame(this.animationLoop);
    this.starting = false;
    this.forceStop = true;
  }
  animate() {
    if (this.animationLoop) {
      cancelAnimationFrame(this.animationLoop);
    }
    this.animationLoop = requestAnimationFrame(this.animate);
    const now = Date.now();
    const delta = now - this.then;
    if (delta > this.options.frameRate) {
      this.then = now - delta % this.options.frameRate;
      this.render();
    }
  }
  /**
   * 渲染前处理
   */
  prerender() {
    this.generated = false;
    if (!this.field) {
      return;
    }
    this.particles = this.prepareParticlePaths();
    this.generated = true;
    if (!this.starting && !this.forceStop) {
      this.starting = true;
      this.then = Date.now();
      this.animate();
    }
  }
  /**
   * 开始渲染
   */
  render() {
    this.moveParticles();
    this.drawParticles();
    this.postrender();
  }
  /**
   * each frame render end
   */
  postrender() {
  }
  moveParticles() {
    const { width, height } = this.ctx.canvas;
    const particles = this.particles;
    const maxAge = this.options.maxAge;
    const velocityScale = isFunction(this.options.velocityScale) ? this.options.velocityScale() : this.options.velocityScale;
    let i = 0;
    const len = particles.length;
    for (; i < len; i++) {
      const particle = particles[i];
      if (particle.age > maxAge) {
        particle.age = 0;
        this.field.randomize(particle, width, height, this.unproject);
      }
      const x = particle.x;
      const y = particle.y;
      const vector = this.field.interpolatedValueAt(x, y);
      if (vector === null) {
        particle.age = maxAge;
      } else {
        const xt = x + vector.u * velocityScale;
        const yt = y + vector.v * velocityScale;
        if (this.field.hasValueAt(xt, yt)) {
          particle.xt = xt;
          particle.yt = yt;
          particle.m = vector.m;
        } else {
          particle.x = xt;
          particle.y = yt;
          particle.age = maxAge;
        }
      }
      particle.age++;
    }
  }
  fadeIn() {
    const prev = this.ctx.globalCompositeOperation;
    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.globalCompositeOperation = prev;
  }
  drawParticles() {
    const particles = this.particles;
    this.fadeIn();
    this.ctx.globalAlpha = this.options.globalAlpha;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${this.options.globalAlpha})`;
    this.ctx.lineWidth = isNumber(this.options.lineWidth) ? this.options.lineWidth : 1;
    this.ctx.strokeStyle = isString(this.options.colorScale) ? this.options.colorScale : "#fff";
    let i = 0;
    const len = particles.length;
    if (this.field && len > 0) {
      let min;
      let max;
      if (isValide(this.options.minVelocity) && isValide(this.options.maxVelocity)) {
        min = this.options.minVelocity;
        max = this.options.maxVelocity;
      } else {
        [min, max] = this.field.range;
      }
      for (; i < len; i++) {
        this[this.options.useCoordsDraw ? "drawCoordsParticle" : "drawPixelParticle"](particles[i], min, max);
      }
    }
  }
  /**
   * 用于绘制像素粒子
   * @param particle
   * @param min
   * @param max
   */
  drawPixelParticle(particle, min, max) {
    const pointPrev = [particle.x, particle.y];
    const pointNext = [particle.xt, particle.yt];
    if (pointNext && pointPrev && isValide(pointNext[0]) && isValide(pointNext[1]) && isValide(pointPrev[0]) && isValide(pointPrev[1]) && particle.age <= this.options.maxAge) {
      this.ctx.beginPath();
      this.ctx.moveTo(pointPrev[0], pointPrev[1]);
      this.ctx.lineTo(pointNext[0], pointNext[1]);
      if (isFunction(this.options.colorScale)) {
        this.ctx.strokeStyle = this.options.colorScale(particle.m);
      } else if (Array.isArray(this.options.colorScale)) {
        const colorIdx = indexFor(particle.m, min, max, this.options.colorScale);
        this.ctx.strokeStyle = this.options.colorScale[colorIdx];
      }
      if (isFunction(this.options.lineWidth)) {
        this.ctx.lineWidth = this.options.lineWidth(particle.m);
      }
      particle.x = particle.xt;
      particle.y = particle.yt;
      this.ctx.stroke();
    }
  }
  /**
   * 用于绘制坐标粒子
   * @param particle
   * @param min
   * @param max
   */
  drawCoordsParticle(particle, min, max) {
    const source = [particle.x, particle.y];
    const target = [particle.xt, particle.yt];
    if (target && source && isValide(target[0]) && isValide(target[1]) && isValide(source[0]) && isValide(source[1]) && this.intersectsCoordinate(target) && particle.age <= this.options.maxAge) {
      const pointPrev = this.project(source);
      const pointNext = this.project(target);
      if (pointPrev && pointNext) {
        this.ctx.beginPath();
        this.ctx.moveTo(pointPrev[0], pointPrev[1]);
        this.ctx.lineTo(pointNext[0], pointNext[1]);
        particle.x = particle.xt;
        particle.y = particle.yt;
        if (isFunction(this.options.colorScale)) {
          this.ctx.strokeStyle = this.options.colorScale(particle.m);
        } else if (Array.isArray(this.options.colorScale)) {
          const colorIdx = indexFor(particle.m, min, max, this.options.colorScale);
          this.ctx.strokeStyle = this.options.colorScale[colorIdx];
        }
        if (isFunction(this.options.lineWidth)) {
          this.ctx.lineWidth = this.options.lineWidth(particle.m);
        }
        this.ctx.stroke();
      }
    }
  }
  prepareParticlePaths() {
    const { width, height } = this.ctx.canvas;
    const particleCount = typeof this.options.paths === "function" ? this.options.paths(this) : this.options.paths;
    const particles = [];
    if (!this.field) {
      return [];
    }
    let i = 0;
    for (; i < particleCount; i++) {
      particles.push(
        this.field.randomize(
          {
            age: this.randomize()
          },
          width,
          height,
          this.unproject
        )
      );
    }
    return particles;
  }
  randomize() {
    return Math.floor(Math.random() * this.options.maxAge);
  }
}

exports.Field = Field;
exports.TypeOf = TypeOf;
exports.Vector = Vector;
exports.WindCore = WindCore;
exports.assign = assign;
exports.compareVersion = compareVersion;
exports.createCanvas = createCanvas;
exports.defaultOptions = defaultOptions;
exports.floorMod = floorMod;
exports.formatData = formatData;
exports.getColor = getColor;
exports.isArray = isArray;
exports.isArrayBuffer = isArrayBuffer;
exports.isDate = isDate;
exports.isEmpty = isEmpty;
exports.isFunction = isFunction;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.isString = isString;
exports.isValide = isValide;
exports.removeDomNode = removeDomNode;
exports.warnLog = warnLog;
exports.warnOnce = warnOnce;
//# sourceMappingURL=wind-core.cjs.js.map
