import {
    Box,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import CompassControl from '@mapbox-controls/compass';
import ZoomControl from '@mapbox-controls/zoom';
import { encodeGetParams } from '../utils/urlParameters';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ.js';
import MVT from 'ol/format/MVT.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import styleJson from './style.json';
import {applyStyle} from 'ol-mapbox-style';



const baseStyleUrl = import.meta.env.VITE_VECTOR_CHARTS_STYLE_URL;
const apiPrefix = import.meta.env.VITE_VECTOR_CHARTS_API_PREFIX;
const apiToken = import.meta.env.VITE_VECTOR_CHARTS_API_TOKEN;

function MapComponent() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const styleUrl = `${baseStyleUrl}&` + encodeGetParams({
        theme: 'day',
        showEncBoundaries: false,
        depthLimit: 2.0,
        depthUnits: 'meters'
    });

    useEffect(() => {
        const layer = new VectorTileLayer();
        applyStyle(layer, 'https://api.vectorcharts.com/api/v1/styles/base.json?token=f73f12ed4a4f4b6d878bb305d66deea3', {accessToken: 'f73f12ed4a4f4b6d878bb305d66deea3'});

        mapRef.current = new Map({
            target: mapContainer.current,
            layers: [
                layer
            ],
            view: new View({
                center: [-7900858.925180627, 5207158.048251006],
                zoom: 12,
            }),
        });

        setInterval(() => {
            console.log(mapRef.current.getView().getCenter())
        }, 1000);

        return () => {
            mapRef.current.setTarget(null);
            mapRef.current = null;
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

export default MapComponent;
