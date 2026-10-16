/* eslint-disable import/no-anonymous-default-export */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default () => {
  return defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            {
                // this is required for the SCSS modules
                find: /^~(.*)$/,
                replacement: '$1',
            },
        ],
    },
    // MapLibre v6 worker must not go through Vite dep prebundling.
    optimizeDeps: {
      exclude: ['maplibre-gl'],
    },
    server: {
      port: 5181,
    },
 })
}