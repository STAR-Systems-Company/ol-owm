import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "demo", // 👈 чтобы собралось из demo/
  build: {
    outDir: "../docs", // 👈 чтобы выгрузка шла в /docs для GitHub Pages
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@dist": path.resolve(__dirname, "dist/esm"),
    },
  },
});
