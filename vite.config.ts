import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      viteStaticCopy({
        targets: [
          {
            src: "manifest.json",
            dest: "../",
          },
        ],
      }),
      zipPack({
        outFileName: "plugin.zip",
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "plugin-template",
        fileName: (format) => "script.js",
        formats: ["es"],
      },
      outDir: "dist/frontend",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    define: {
      'process.env': process.env,
    },
  };
});
