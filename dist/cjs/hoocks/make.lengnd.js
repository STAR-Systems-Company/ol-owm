"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLegend = exports.makeLegend = void 0;
const _STYLES = {
    clouds_new: `linear-gradient(to right, rgba(247, 247, 255, 0) 0%, rgba(251, 247, 255, 0) 10%, rgba(244, 248, 255, 0.1) 20%, rgba(240, 249, 255, 0.2) 30%, rgba(221, 250, 255, 0.4) 40%, rgba(224, 224, 224, 0.9) 50%, rgba(224, 224, 224, 0.76) 60%, rgba(228, 228, 228, 0.9) 70%, rgba(232, 232, 232, 0.9) 80%, rgb(214, 213, 213) 90%, rgb(210, 210, 210) 95%, rgb(183, 183, 183) 100%)`,
    precipitation_new: `linear-gradient(to right, rgba(172, 170, 247, 0) 0%, rgba(172, 170, 247, 0.4) 0.5%, rgba(141, 138, 243, 0.9) 5%, rgb(112, 110, 194) 10%, rgb(86, 88, 255) 20%, rgb(91, 93, 177) 50%, rgb(62, 63, 133) 100%)`,
    pressure_new: `linear-gradient(to right, rgb(0, 115, 255) 0%, rgb(0, 170, 255) 8.35059%, rgb(75, 208, 214) 24.9192%, rgb(141, 231, 199) 41.4879%, rgb(176, 247, 32) 49.7722%, rgb(240, 184, 0) 58.0565%, rgb(251, 85, 21) 74.6251%, rgb(243, 54, 59) 91.1938%, rgb(198, 0, 0) 100%)`,
    wind_new: `linear-gradient(to right, rgba(255, 255, 0, 0) 0%, rgba(170, 128, 177, 0.44) 1%, rgba(170, 128, 177, 0.54) 1.5%, rgba(176, 128, 177, 0.71) 3%, rgba(170, 128, 177, 0.84) 6%, rgb(164, 123, 170) 12.5%, rgba(116, 76, 172, 0.9) 25%, rgb(158, 128, 177) 50%, rgba(48, 6, 53, 0.82) 100%)`,
    temp_new: `linear-gradient(to right, rgb(159, 85, 181) 0%, rgb(44, 106, 187) 8.75%, rgb(82, 139, 213) 12.5%, rgb(103, 163, 222) 18.75%, rgb(142, 202, 240) 25%, rgb(155, 213, 244) 31.25%, rgb(172, 225, 253) 37.5%, rgb(194, 234, 255) 43.75%, rgb(255, 255, 208) 50%, rgb(254, 248, 174) 56.25%, rgb(254, 232, 146) 62.5%, rgb(254, 226, 112) 68.75%, rgb(253, 212, 97) 75%, rgb(244, 168, 94) 82.5%, rgb(244, 129, 89) 87.5%, rgb(244, 104, 89) 93.75%, rgb(244, 76, 73) 100%)`,
};
const _ZERO = {
    clouds_new: "50%",
    precipitation_new: "100 mm",
    pressure_new: "1013.25 hPa",
    wind_new: "100 m/s",
    temp_new: "0°C",
};
const makeLegend = (id, layerData) => {
    const box = document.querySelector(id);
    if (box) {
        const legendBox = document.createElement("div");
        legendBox.id = "ol-wms-legend-box";
        legendBox.style.width = "100%";
        legendBox.style.height = "16px";
        legendBox.style.position = "relative";
        legendBox.style.background = _STYLES[layerData.key];
        const zero = document.createElement("div");
        zero.style.width = "fit-content";
        zero.style.position = "absolute";
        zero.style.left = "50%";
        zero.style.top = "50%";
        zero.style.transform = "translate(-50%,-50%)";
        zero.style.background = "rgb(0 0 0 / 40%)";
        zero.style.fontSize = "14px";
        zero.style.padding = "2px 7px";
        zero.style.lineHeight = "14px";
        zero.style.borderRadius = "7px";
        zero.style.color = "#fff";
        zero.innerText = _ZERO[layerData.key];
        legendBox.appendChild(zero);
        box.appendChild(legendBox);
    }
};
exports.makeLegend = makeLegend;
const removeLegend = (id) => {
    if (id) {
        document
            .querySelectorAll("#ol-wms-legend-box")
            .forEach((el) => el.remove());
    }
};
exports.removeLegend = removeLegend;
