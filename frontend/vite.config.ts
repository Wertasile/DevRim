import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    sourcemap: false, // ✅ generate sourcemaps for your code
  },
  esbuild: {
    logOverride: { "unsupported-source-map": "silent" },
  },
  ssr: {
    noExternal: ["socket.io-client"], // ensure it bundles safely
  }
});
