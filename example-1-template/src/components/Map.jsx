import {
    Box,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import CompassControl from '@mapbox-controls/compass';
import ZoomControl from '@mapbox-controls/zoom';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: '',
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
