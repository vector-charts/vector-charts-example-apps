import { Box } from '@chakra-ui/react';
import Map from './Map';

function Root() {
    return (
        <Box position="absolute" top="0px" bottom="0px" left="0px" right="0px" display="flex" flexDir="row">
            <Map></Map>
        </Box>
    );
}

export default Root;
