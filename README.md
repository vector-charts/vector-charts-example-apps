# VectorCharts Example Apps

Example applications demonstrating usage of the [Vector Charts API](https://vectorcharts.com/) using Mapbox GL JS and other map renderers.

## Getting Started

Each example is a separate React application. To run an app:

1. Navigate into to the subfolder.
2. Run `npm install` to install dependencies.
3. Replace the placeholders in `.env.development` with a live token from the [Vector Charts Cloud](https://cloud.vectorcharts.com/).
4. Run `npm run start` to start a dev server.

## Examples

- `example-1-template`: Base React application, boilerplate for other examples.
- `example-2-mapbox`: Mapbox GL JS rendering 3D globe with vector tiles.
- `example-3-leaflet-raster`: 2D raster map using Leaflet.
- `example-4-openlayers-raster`: 2D raster map using OpenLayers.
- `example-5-openlayers-vector`: Vector tiles using OpenLayers (Experimental, poor performance)
- `example-6-maplibre`: MapLibre GL JS rendering 3D globe with vector tiles.
- `example-7-mapbox-fonts`: Example of overriding the fontstack in Mapbox.
