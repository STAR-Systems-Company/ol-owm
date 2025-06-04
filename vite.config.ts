import { defineConfig } from "vite";

export default defineConfig({
  base: "/ol-owm/", // 👈 обязательно
  root: "demo", // если ты билдишь из /demo
  build: {
    outDir: "../docs", // чтобы Pages читал из docs/
    emptyOutDir: true,
  },
});
