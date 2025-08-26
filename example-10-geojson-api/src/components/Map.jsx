import {
    Box,
    Spinner,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import CompassControl from '@mapbox-controls/compass';
import ZoomControl from '@mapbox-controls/zoom';
import mapboxgl from 'mapbox-gl';
import { encodeGetParams } from '../utils/urlParameters';
import axios from 'axios';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const baseStyleUrl = import.meta.env.VITE_VECTOR_CHARTS_STYLE_URL;
const apiPrefix = import.meta.env.VITE_VECTOR_CHARTS_API_PREFIX;
const apiToken = import.meta.env.VITE_VECTOR_CHARTS_API_TOKEN;

function Map() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const lastMousePos = useRef(null);
    const rawDataSource = useRef(null);
    const [rawData, setRawData] = useState(null);

    const loadRawData = async () => {
        const {
            latitude,
            longitude
        } = lastMousePos.current;

        // Determine tile xyz using the query api
        const xyzResponse = await axios.post(`${apiPrefix}api/v2/query/latLonToXYZ?token=${apiToken}`, {
            zoom: 12,
            latitude,
            longitude
        });
        console.log(xyzResponse.data);
        const {
            x,y,z
        } = xyzResponse.data;

        // Query raw tile data at coordinate using the Raw Data API
        const rawGeoRequest = await axios.get(`${apiPrefix}api/v2/tiles/data-geojson-v1/${z}/${x}/${y}.json?token=${apiToken}`);
        setRawData(rawGeoRequest.data);
        console.log(rawGeoRequest.data);
        mapRef.current.getSource('raw-data').setData(rawGeoRequest.data);
    };

    useEffect(() => {
        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-v9',
            projection: 'globe',
            center: [-122.399276, 37.809641],
            zoom: 13,
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
        
        mapRef.current.on('touchmove', (e) => {
            lastMousePos.current = {
                latitude: e.lngLat.lat,
                longitude: e.lngLat.lng,
            };
        });
        mapRef.current.on('mousemove', (e) => {
            lastMousePos.current = {
                latitude: e.lngLat.lat,
                longitude: e.lngLat.lng,
            };
        });

        mapRef.current.on('style.load', () => {
        });

        mapRef.current.on('load', () => {
            rawDataSource.current = mapRef.current.addSource('raw-data', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
            });
            mapRef.current.addLayer({
                id: 'raw-data-1',
                type: 'line',
                source: 'raw-data',
                filter: ['all', ['!=', ['geometry-type'], 'Point']],
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#1eff00',
                    'line-width': 2,
                    'line-opacity': 0.9,
                },
            });
            mapRef.current.addLayer({
                id: 'raw-data-2',
                type: 'circle',
                source: 'raw-data',
                filter: ['all', ['==', ['geometry-type'], 'Point']],
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'circle-radius': 3,
                    'circle-color': '#1eff00',
                    'circle-opacity': 1.0,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#252525',
                },
            });
        });

        return () => {
            mapRef.current.remove();
        };
    }, [mapRef]);

    const handleClick = (e) => {
        if (e.nativeEvent.button != 0) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        // TODO Load data at tile.
        loadRawData();
    };

    return (
        <Box position="relative" display="flex" flexDir="column" justifyContent="stretch" alignItems="stretch" flex="1">
            <Box
                zIndex={1}
                ref={mapContainer}
                width="100%"
                height="100%"
                onClick={handleClick}
                onContextMenu={handleClick}
            ></Box>
            <Box zIndex={2} position="absolute" top="10px" left="10px">
                <Box bg="white" shadow="dark-lg" padding="10px" borderRadius="3px" display="flex" flexDir="column">
                    Click on the map to load the raw data at that position.
                    {!rawData && (
                        <Spinner />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default Map;
