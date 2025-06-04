import { defineConfig } from "vite";

export default defineConfig({
  base: "/ol-owm/docs", // 👈 ОБЯЗАТЕЛЬНО для GitHub Pages
  root: "demo", // 👈 если твои html+ts лежат в /demo
  build: {
    outDir: "../docs", // 👈 выгрузка в /docs
    emptyOutDir: true,
  },
});
