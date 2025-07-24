const _STYLES = {
    clouds_new: `linear-gradient(to right, rgba(247, 247, 255, 0) 0%, rgba(251, 247, 255, 0) 10%, rgba(244, 248, 255, 0.1) 20%, rgba(240, 249, 255, 0.2) 30%, rgba(221, 250, 255, 0.4) 40%, rgba(224, 224, 224, 0.9) 50%, rgba(224, 224, 224, 0.76) 60%, rgba(228, 228, 228, 0.9) 70%, rgba(232, 232, 232, 0.9) 80%, rgb(214, 213, 213) 90%, rgb(210, 210, 210) 95%, rgb(183, 183, 183) 100%)`,
    precipitation_new: `linear-gradient(to right, rgba(172, 170, 247, 0) 0%, rgba(172, 170, 247, 0.4) 0.5%, rgba(141, 138, 243, 0.9) 5%, rgb(112, 110, 194) 10%, rgb(86, 88, 255) 20%, rgb(91, 93, 177) 50%, rgb(62, 63, 133) 100%)`,
    pressure_new: `linear-gradient(to right, rgb(0, 115, 255) 0%, rgb(0, 170, 255) 8%, rgb(75, 208, 214) 25%, rgb(141, 231, 199) 41%, rgb(176, 247, 32) 50%, rgb(240, 184, 0) 58%, rgb(251, 85, 21) 75%, rgb(243, 54, 59) 91%, rgb(198, 0, 0) 100%)`,
    wind_new: `linear-gradient(to right, rgba(255, 255, 0, 0) 0%, rgba(170, 128, 177, 0.44) 1%, rgba(170, 128, 177, 0.54) 1.5%, rgba(176, 128, 177, 0.71) 3%, rgba(170, 128, 177, 0.84) 6%, rgb(164, 123, 170) 12.5%, rgba(116, 76, 172, 0.9) 25%, rgb(158, 128, 177) 50%, rgba(48, 6, 53, 0.82) 100%)`,
    temp_new: `linear-gradient(to right, rgb(159, 85, 181) 0%, rgb(44, 106, 187) 8.75%, rgb(82, 139, 213) 12.5%, rgb(103, 163, 222) 18.75%, rgb(142, 202, 240) 25%, rgb(155, 213, 244) 31.25%, rgb(172, 225, 253) 37.5%, rgb(194, 234, 255) 43.75%, rgb(255, 255, 208) 50%, rgb(254, 248, 174) 56.25%, rgb(254, 232, 146) 62.5%, rgb(254, 226, 112) 68.75%, rgb(253, 212, 97) 75%, rgb(244, 168, 94) 82.5%, rgb(244, 129, 89) 87.5%, rgb(244, 104, 89) 93.75%, rgb(244, 76, 73) 100%)`,
};
const _UNITS = {
    clouds_new: "%",
    precipitation_new: "mm",
    pressure_new: "hPa",
    wind_new: "m/s",
    temp_new: "°C",
};
const _RANGES = {
    clouds_new: { min: 0, max: 100 },
    precipitation_new: { min: 0, max: 100 }, // мм
    pressure_new: { min: 950, max: 1050 }, // hPa
    wind_new: { min: 0, max: 100 }, // м/с
    temp_new: { min: -40, max: 40 }, // °C
};
export const makeLegend = (prefix, id, layerData) => {
    const container = document.querySelector(id);
    if (!container) {
        console.warn("Legend container not found:", id);
        return;
    }
    container
        .querySelectorAll("#ol-wms-legend-box" + prefix)
        .forEach((el) => el.remove());
    const legendBox = document.createElement("div");
    legendBox.id = "ol-wms-legend-box" + prefix;
    legendBox.style.cssText = `z-index:10; width: 100%; height: 16px; position: relative; background: ${_STYLES[layerData.key]};`;
    const popup = document.createElement("div");
    popup.style.cssText = `position:absolute;top:-30px;background:rgba(0,0,0,0.7);color:#fff;font-size:12px;padding:2px 6px;border-radius:4px;pointer-events:none;white-space:nowrap;display:none;`;
    legendBox.appendChild(popup);
    legendBox.addEventListener("mousemove", (e) => {
        const rect = legendBox.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        // Вычисляем текст внутри popup
        const unit = _UNITS[layerData.key] || "%";
        const range = _RANGES[layerData.key];
        if (range) {
            const value = (range.min +
                ((range.max - range.min) * percent) / 100).toFixed(1);
            popup.innerText = `${value}${unit}`;
        }
        else {
            popup.innerText = `${percent.toFixed(1)}${unit}`;
        }
        // Показываем popup перед измерением
        popup.style.display = "block";
        // Ширина popup и его "половина"
        const popupWidth = popup.offsetWidth;
        const half = popupWidth / 2;
        // Координата курсора внутри legendBox
        let x = e.clientX - rect.left;
        // Клаппим её, чтобы popup не выходил за границы
        x = Math.max(half, Math.min(x, rect.width - half));
        // Устанавливаем позицию в пикселях и центрируем
        popup.style.left = `${x}px`;
        popup.style.transform = "translateX(-50%)";
    });
    legendBox.addEventListener("mouseleave", () => {
        popup.style.display = "none";
    });
    container.appendChild(legendBox);
};
export const removeLegend = (prefix) => {
    document
        .querySelectorAll("#ol-wms-legend-box" + prefix)
        .forEach((el) => el.remove());
};
