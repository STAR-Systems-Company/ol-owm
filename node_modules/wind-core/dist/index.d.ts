declare class Vector {
    u: number;
    v: number;
    m: number;
    constructor(u: number, v: number);
    /**
     * 向量值（这里指风速）
     * @returns {Number}
     */
    magnitude(): number;
    /**
     * 流体方向 （这里指风向，范围为0-360º）
     * N is 0º and E is 90º
     * @returns {Number}
     */
    directionTo(): number;
    /**
     * Angle in degrees (0 to 360º) From x-->
     * N is 0º and E is 90º
     * @returns {Number}
     */
    directionFrom(): number;
}

interface IField {
    /**
     * 经度最小值
     */
    xmin: number;
    /**
     * 纬度最小值
     */
    ymin: number;
    /**
     * 经度最大值
     */
    xmax: number;
    /**
     * 纬度最大值
     */
    ymax: number;
    /**
     * x（经度）增量
     */
    deltaX: number;
    /**
     * y（纬度）增量 (默认我们采用的数据和格点原始数据方向保持一致，数据从左上到右下) 但是需要注意的是此时 deltaY为 -(ymax-ymin) / rows
     */
    deltaY: number;
    /**
     * 列（可由 `(xmax - xmin) / deltaX` 得到）
     */
    cols: number;
    /**
     * 行
     */
    rows: number;
    /**
     * U分量
     */
    us: number[];
    /**
     * V分量
     */
    vs: number[];
    /**
     * 因为grib2json的问题，我们需要翻转 Y 轴数据
     */
    flipY?: boolean;
    /**
     * 是否实现跨世界渲染
     */
    wrapX?: boolean;
    /**
     * 当数据范围时按照 [0, 360] 时需要对x方向进行切割转换为 [-180, 180]，即将废弃
     */
    wrappedX?: boolean;
    /**
     * 当数据范围时按照 [0, 360] 时需要对x方向进行切割转换为 [-180, 180]
     */
    translateX?: boolean;
}
interface IPosition {
    age?: number;
    x?: number;
    y?: number;
    xt?: number;
    yt?: number;
    m?: number;
}
declare class Field {
    private readonly xmin;
    private readonly xmax;
    private readonly ymin;
    private readonly ymax;
    private readonly cols;
    private readonly rows;
    private readonly us;
    private readonly vs;
    private readonly isContinuous;
    private readonly deltaY;
    private readonly deltaX;
    private readonly translateX;
    private readonly isFields;
    private readonly flipY;
    grid: (Vector | null)[][];
    range: (number | undefined)[] | undefined;
    private wrapX;
    constructor(params: IField);
    buildGrid(): (Vector | null)[][];
    /**
     * release data
     */
    release(): void;
    /**
     * grib data extent
     * 格点数据范围
     */
    extent(): number[];
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
    private bilinearInterpolateVector;
    /**
     * calculate vector value range
     */
    calculateRange(): any[] | undefined;
    /**
     * 检查 uv是否合法
     * @param x
     * @private
     */
    isValid(x: any): boolean;
    private getWrappedLongitudes;
    contains(lon: number, lat: number): any;
    /**
     * 获取经纬度所在的位置索引
     * @param lon
     * @param lat
     */
    getDecimalIndexes(lon: number, lat: number): number[];
    /**
     * Nearest value at lon-lat coordinates
     * 线性插值
     * @param lon
     * @param lat
     */
    valueAt(lon: number, lat: number): Vector | null;
    /**
     * Get interpolated grid value lon-lat coordinates
     * 双线性插值
     * @param lon
     * @param lat
     */
    interpolatedValueAt(lon: number, lat: number): Vector | null;
    hasValueAt(lon: number, lat: number): boolean;
    /**
     * 基于向量的双线性插值
     * @param i
     * @param j
     */
    private interpolatePoint;
    /**
     * Check the column index is inside the field,
     * adjusting to min or max when needed
     * @private
     * @param   {Number} ii - index
     * @returns {Number} i - inside the allowed indexes
     */
    private clampColumnIndex;
    /**
     * Check the row index is inside the field,
     * adjusting to min or max when needed
     * @private
     * @param   {Number} jj index
     * @returns {Number} j - inside the allowed indexes
     */
    private clampRowIndex;
    /**
     * 计算索引位置周围的数据
     * @private
     * @param   {Number} i - decimal index
     * @param   {Number} j - decimal index
     * @returns {Array} [fi, ci, fj, cj]
     */
    private getFourSurroundingIndexes;
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
    private getFourSurroundingValues;
    /**
     * Value for grid indexes
     * @param   {Number} i - column index (integer)
     * @param   {Number} j - row index (integer)
     * @returns {Vector|Number}
     */
    valueAtIndexes(i: number, j: number): Vector | null;
    /**
     * Lon-Lat for grid indexes
     * @param   {Number} i - column index (integer)
     * @param   {Number} j - row index (integer)
     * @returns {Number[]} [lon, lat]
     */
    lonLatAtIndexes(i: number, j: number): number[];
    /**
     * Longitude for grid-index
     * @param   {Number} i - column index (integer)
     * @returns {Number} longitude at the center of the cell
     */
    private longitudeAtX;
    /**
     * Latitude for grid-index
     * @param   {Number} j - row index (integer)
     * @returns {Number} latitude at the center of the cell
     */
    private latitudeAtY;
    /**
     * 生成粒子位置
     * @param o
     * @param width
     * @param height
     * @param unproject
     * @return IPosition
     */
    randomize(o: IPosition | undefined, width: number, height: number, unproject: (a: number[]) => [number, number] | null): IPosition;
    /**
     * 判断是否是 `Field` 的实例
     * @return boolean
     */
    checkFields(): boolean;
}

declare function TypeOf(value: any): any;
/**
 * 判断是否为函数
 * @param value
 * @returns {boolean}
 */
declare function isFunction(value: any): value is (...args: any[]) => any;
/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
declare function isObject(value: any): boolean;
/**
 * is date value
 * @param val
 * @returns {boolean}
 */
declare function isDate(val: any): boolean;
/**
 * is array buffer
 * @param val
 * @returns {boolean}
 */
declare function isArrayBuffer(val: any): boolean;
/**
 * 判断是否为合法字符串
 * @param value
 * @returns {boolean}
 */
declare function isString(value: any): boolean;
/**
 * 判断是否为数字
 * @param value
 * @returns {boolean}
 */
declare function isNumber(value: any): boolean;
/**
 * 判断对象是否为空
 * @param object
 * @returns {boolean}
 */
declare function isEmpty(object: any): boolean;
/**
 * 判断是否为 `null`
 * @param obj
 * @returns {boolean}
 */
declare function isNull(obj: any): boolean;
/**
 * 判断是否是数组
 * @param arr
 */
declare function isArray(arr: any): boolean;
/**
 * assign object
 * @param target
 * @param sources
 */
declare function assign(target: object, ...sources: any[]): any;
/**
 * 打印⚠️信息
 * @param msg
 * @param n
 */
declare function warnLog(msg: string, n?: string): void;
/**
 * 在程序运行时只打印同类型警告一次
 * @param namespaces
 * @param msg
 */
declare function warnOnce(namespaces: string, msg: string): void;
/**
 * Get floored division
 * @param a
 * @param n
 * @returns {Number} returns remainder of floored division,
 * i.e., floor(a / n). Useful for consistent modulo of negative numbers.
 * See http://en.wikipedia.org/wiki/Modulo_operation.
 */
declare function floorMod(a: number, n: number): number;
/**
 * 检查值是否合法
 * @param val
 * @returns {boolean}
 */
declare function isValide(val: any): boolean;
interface IGFSItem {
    header: {
        parameterCategory: number | string;
        parameterNumber: number | string;
        dx: number;
        dy: number;
        nx: number;
        ny: number;
        lo1: number;
        lo2: number;
        la1: number;
        la2: number;
        [key: string]: any;
    };
    data: number[];
}
/**
 * format gfs json to vector
 * @param data
 * @param options
 */
declare function formatData(data: IGFSItem[], options?: Partial<IField>): Field | undefined;
/**
 * create canvas
 * @param width
 * @param height
 * @param retina
 * @param Canvas
 * @returns {HTMLCanvasElement}
 */
declare function createCanvas(width: number, height: number, retina: number, Canvas?: any): HTMLCanvasElement;
/**
 * 移除 dom
 * @param node
 * @returns {removeDomNode}
 */
declare function removeDomNode(node: HTMLElement | HTMLCanvasElement): HTMLElement | null;
declare function getColor(string: string): any[] | null;
declare function compareVersion(v1: any, v2: any): 1 | 0 | -1;

declare const defaultOptions: {
    globalAlpha: number;
    lineWidth: number;
    colorScale: string;
    velocityScale: number;
    maxAge: number;
    paths: number;
    frameRate: number;
    useCoordsDraw: boolean;
};
type emptyFunc = (v?: any) => number;
interface IOptions {
    /**
     * 全局透明度，主要影响粒子拖尾效果，默认 0.9
     */
    globalAlpha: number;
    /**
     * 线条宽度
     */
    lineWidth: number | emptyFunc;
    /**
     * 粒子颜色配置, 默认#fff，当为回调函数时，参数 function(m:对应点风速值) => string
     */
    colorScale: string | string[] | emptyFunc;
    /**
     * 对于粒子路径步长的乘积系数，默认 1 / 25
     */
    velocityScale: number | emptyFunc;
    /**
     * 粒子路径能够生成的最大帧数，默认是 90
     */
    particleAge?: number;
    /**
     * 粒子路径能够生成的最大帧数，默认是 90；他代表的是我们的 `paths` 数量的粒子的消亡控制，最小值是 0，最大值是 `maxAge`，在运行到 age 数时会消失然后进行重启
     */
    maxAge: number;
    /**
     * 粒子路径数量的系数，不推荐使用（视野宽度 * 高度 * 系数）
     */
    particleMultiplier?: number;
    /**
     * 生成的粒子数量
     */
    paths: number | emptyFunc;
    /**
     * 用户自定义的帧率，默认是 20ms, 大概接近 50fps 帧，我们可能在某些场景需要降低帧率一保证渲染稳定性；注意此配置还会影响粒子运动的速度
     */
    frameRate: number;
    /**
     * 用户配置的风速最小值，如果未配置会从传入的数据中计算
     */
    minVelocity?: number;
    /**
     * 用户配置的风速最大值，如果未配置会从传入的数据中计算
     */
    maxVelocity?: number;
    /**
     * 使用外部传入的坐标系统，默认是 `true`；某些场景下我们可能直接使用像素坐标。
     */
    useCoordsDraw?: boolean;
}
declare class WindCore {
    static Field: typeof Field;
    forceStop: boolean;
    private ctx;
    private options;
    private field;
    private particles;
    private animationLoop;
    private then;
    private generated;
    private starting;
    constructor(ctx: CanvasRenderingContext2D, options: Partial<IOptions>, field?: Field);
    /**
     * 设置配置项
     * @param options
     */
    setOptions(options: Partial<IOptions>): void;
    /**
     * 获取配置项
     */
    getOptions(): IOptions;
    /**
     * 更新数据
     * @param field
     */
    updateData(field: Field): void;
    project(...args: any[]): [number, number] | null;
    unproject(...args: any[]): [number, number] | null;
    /**
     * 判断位置是否在当前视窗内
     * @param coordinates
     */
    intersectsCoordinate(coordinates: [number, number]): boolean;
    /**
     * 清空当前画布
     */
    clearCanvas(): void;
    isStop(): boolean;
    /**
     * 启动粒子动画
     */
    start(): void;
    /**
     * 停止粒子动画
     */
    stop(): void;
    animate(): void;
    /**
     * 渲染前处理
     */
    prerender(): void;
    /**
     * 开始渲染
     */
    render(): void;
    /**
     * each frame render end
     */
    postrender(): void;
    private moveParticles;
    private fadeIn;
    private drawParticles;
    /**
     * 用于绘制像素粒子
     * @param particle
     * @param min
     * @param max
     */
    private drawPixelParticle;
    /**
     * 用于绘制坐标粒子
     * @param particle
     * @param min
     * @param max
     */
    private drawCoordsParticle;
    private prepareParticlePaths;
    private randomize;
}

export { Field, type IField, type IGFSItem, type IOptions, TypeOf, Vector, WindCore, assign, compareVersion, createCanvas, defaultOptions, floorMod, formatData, getColor, isArray, isArrayBuffer, isDate, isEmpty, isFunction, isNull, isNumber, isObject, isString, isValide, removeDomNode, warnLog, warnOnce };
