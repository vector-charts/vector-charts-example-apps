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
        mapRef.current = new Map({
            target: mapContainer.current,
            layers: [
                new TileLayer({
                    source: new XYZ({
                        tileUrlFunction: (c) => {
                            return `${apiPrefix}/api/v1/rasterTiles/${c[0]}/${c[1]}/${c[2]}.png?token=${apiToken}`;
                        }
                    })
                })
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
