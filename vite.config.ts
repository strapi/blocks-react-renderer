import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      formats: ["cjs", "es"],
      fileName(format) {
        return `[name].${format === "es" ? "mjs" : "js"}`;
      },
    },
  },
});
