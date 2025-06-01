# ☁️ OL-OWM

**OL-OWM** — TypeScript-библиотека для отображения погодных данных на картах **[OpenLayers](https://openlayers.org/)** и **[Leaflet](https://leafletjs.com/)** с использованием API **[OpenWeatherMap](https://openweathermap.org/)**.

---

## 📦 Установка

```bash
npm install ol-owm
```

---

## 🚀 Быстрый старт

### 🔹 OpenLayers

```ts
import { OpenLayersWeather } from "ol-owm";
import Map from "ol/Map";

const map = new Map({ ... });

const weather = new OpenLayersWeather(map, "YOUR_OWM_API_KEY", {
  iconAnimated: true,
});

weather.show();
```

### 🔸 Leaflet

```ts
import { LeafletWeather } from "ol-owm";
import L from "leaflet";

const map = L.map("map").setView([50.45, 30.52], 6);

const weather = new LeafletWeather(map, "YOUR_OWM_API_KEY", {
  iconAnimated: true,
});

weather.show();
```

---

## ⚙️ Опции

| Параметр       | Тип       | Описание                                                             |
| -------------- | --------- | -------------------------------------------------------------------- |
| `lang` | `en or ru` | Язык данных |

---

## 📌 Возможности

- 🗺️ Поддержка **OpenLayers** и **Leaflet**
- 🖼️ SVG-иконки (анимированные и статические)
- 🌍 Автоматическая подгрузка данных OpenWeather по тайлам
- 🌡️ Отображение температуры, ветра и названия города
- 🖱️ Подробное погодное окно при двойном клике

---

## 🧪 Примеры

Примеры находятся в папках:

```
demo/demo.html
```

---

## 📄 Лицензия

MIT © [STAR Systems](https://github.com/STAR-Systems-Company)
