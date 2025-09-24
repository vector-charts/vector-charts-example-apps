import {
    Box,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import CompassControl from '@mapbox-controls/compass';
import ZoomControl from '@mapbox-controls/zoom';
import leaflet from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import { encodeGetParams } from '../utils/urlParameters';

const baseStyleUrl = import.meta.env.VITE_VECTOR_CHARTS_STYLE_URL;
const apiPrefix = import.meta.env.VITE_VECTOR_CHARTS_API_PREFIX;
const apiToken = import.meta.env.VITE_VECTOR_CHARTS_API_TOKEN;

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
        mapRef.current = leaflet
            .map(mapContainer.current, {
                center: [42.321617, -70.965271],
                zoom: 12,
                maxBounds: [[180, -Infinity], [-180, Infinity]],
                maxBoundsViscosity: 1
            });

        leaflet.maplibreGL({
            style: styleUrl,
        }).addTo(mapRef.current);

        // leaflet.tileLayer(`${apiPrefix}/api/v1/rasterTiles/{z}/{x}/{y}.png?token=${apiToken}`, {
        //     maxZoom: 16,
        // }).addTo(mapRef.current);

        return () => {
            mapRef.current.remove();
        };
    }, [mapRef]);

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
