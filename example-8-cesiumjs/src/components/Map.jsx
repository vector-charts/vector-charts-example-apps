import {
    Box,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { QuadtreePrimitive, Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer, OpenStreetMapImageryProvider, ImageryLayer, UrlTemplateImageryProvider, WebMercatorTilingScheme, Color } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { encodeGetParams } from '../utils/urlParameters';
import MapboxVectorTileImageryProvider from '../MVTTIleImageryProvider/MapboxVectorTileImageryProvider';
import GridManager from '../MVTTIleImageryProvider/GridManager';

import MVTImageryProvider from 'mvt-imagery-provider';
import BoxTileProvider from '../MVTTIleImageryProvider/QuadtreeTest';

window.CESIUM_BASE_URL = '/';
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;
const baseStyleUrl = import.meta.env.VITE_VECTOR_CHARTS_STYLE_URL;

function Map() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const gridRef = useRef(null);

    const styleUrl = `${baseStyleUrl}&` + encodeGetParams({
        theme: 'day',
        showEncBoundaries: false,
        depthLimit: 2.0,
        depthUnits: 'meters'
    });

    const [style, setStyle] = useState(null);

    useEffect(() => {
        mapRef.current = new Viewer("cesiumContainer", {
            terrain: Terrain.fromWorldTerrain(),
            imageryProvider: false,
            timeline: false,
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            timeline: false
        });
        window.mapRef = mapRef.current;
        const layers = mapRef.current.scene.imageryLayers;
            
        mapRef.current.scene.primitives.add(
            new QuadtreePrimitive({
                tileProvider: new BoxTileProvider()
            })
        );
        layers.addImageryProvider(new UrlTemplateImageryProvider({
                url : 'https://api.vectorcharts.com/api/v1/rasterTiles/{z}/{x}/{y}.png?token=f73f12ed4a4f4b6d878bb305d66deea3',
                tilingScheme: new WebMercatorTilingScheme(),
                minimumLevel: 3,
                maximumLevel: 12
        }));

        // const test = new MapboxVectorTileImageryProvider({
        //     url : 'https://api.vectorcharts.com/api/v2/tiles/enc-v2/{z}/{x}/{y}.mvt?token=f73f12ed4a4f4b6d878bb305d66deea3',
        //     styleUrl : 'https://api.vectorcharts.com/api/v1/styles/base.json?token=f73f12ed4a4f4b6d878bb305d66deea3'
        // });
        // console.log(test);
        // layers.addImageryProvider(test);
        const postLoad = async () => {
        };
        postLoad();

        return () => {
            mapRef.current.destroy();
        };
    }, [mapRef]);

    return (
        <Box position="relative" display="flex" flexDir="column" justifyContent="stretch" alignItems="stretch" flex="1">
            <Box
                zIndex={1}
                ref={mapContainer}
                id="cesiumContainer"
                width="100%"
                height="100%"
            ></Box>
        </Box>
    );
}

export default Map;
