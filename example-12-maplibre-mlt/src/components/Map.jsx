import {
    Box,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import CompassControl from '@mapbox-controls/compass';
import ZoomControl from '@mapbox-controls/zoom';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { encodeGetParams } from '../utils/urlParameters';

// MapLibre v6 + Vite: worker URL must be set explicitly or tiles never load.
setWorkerUrl(maplibreWorkerUrl);

const baseStyleUrl = import.meta.env.VITE_VECTOR_CHARTS_STYLE_URL;

// ENC vector tiles that the style API emits as .mvt also have .mlt endpoints.
const ENC_MVT_TILE_RE = /\/(enc-v2|enc-hybrid-v2)\/\{z\}\/\{x\}\/\{y\}\.mvt\b/;

function rewriteStyleForMlt(style) {
    const next = structuredClone(style);
    for (const source of Object.values(next.sources || {})) {
        if (source?.type !== 'vector' || !Array.isArray(source.tiles)) continue;
        const rewritten = source.tiles.map((url) =>
            url.replace(ENC_MVT_TILE_RE, '/$1/{z}/{x}/{y}.mlt')
        );
        if (rewritten.some((url, i) => url !== source.tiles[i])) {
            source.tiles = rewritten;
            source.encoding = 'mlt';
        }
    }
    return next;
}

async function loadMltStyle(styleUrl) {
    const response = await fetch(styleUrl);
    if (!response.ok) {
        throw new Error(`Failed to load style (${response.status})`);
    }
    return rewriteStyleForMlt(await response.json());
}

function Map() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const styleUrl = `${baseStyleUrl}&` + encodeGetParams({
        theme: 'day',
        showEncBoundaries: false,
        depthLimit: 2.0,
        depthUnits: 'meters'
    });

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const style = await loadMltStyle(styleUrl);
            if (cancelled || !mapContainer.current) return;

            mapRef.current = new MapLibreMap({
                container: mapContainer.current,
                style,
                projection: 'globe',
                center: [-70.7345924504116, 41.91986758622474],
                zoom: 2,
                maxZoom: 19,
            });
            window.mapRef = mapRef.current;

            mapRef.current.addControl(new ZoomControl(), 'bottom-right');
            mapRef.current.addControl(
                new CompassControl({
                    instant: true,
                }),
                'bottom-right'
            );

            mapRef.current.on('style.load', () => {
                mapRef.current.setFog({
                    range: [2, 20],
                    color: 'rgb(255, 255, 255)',
                    'high-color': 'rgb(153, 204, 255)',
                    'horizon-blend': ['interpolate', ['exponential', 1.2], ['zoom'], 5, 0.02, 7, 0.08],
                    'space-color': [
                        'interpolate',
                        ['exponential', 1.2],
                        ['zoom'],
                        5,
                        'hsl(210, 40%, 30%)',
                        7,
                        'hsl(210, 100%, 80%)',
                    ],
                    'star-intensity': ['interpolate', ['exponential', 1.2], ['zoom'], 5, 0.1, 7, 0],
                });
            });
        })().catch((err) => {
            console.error('Failed to initialize MapLibre MLT map', err);
        });

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [styleUrl]);

    return (
        <Box position="relative" display="flex" flexDir="column" justifyContent="stretch" alignItems="stretch" flex="1">
            <Box
                zIndex={1}
                ref={mapContainer}
                width="100%"
                height="100%"
            ></Box>
        </Box>
    );
}

export default Map;
