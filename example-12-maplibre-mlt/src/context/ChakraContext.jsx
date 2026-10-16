import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    fonts: {
        heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    },
    styles: {
        global: (props) => ({
            body: {
                backgroundColor: 'rgba(46,76,107,1.0)',
            },
        }),
    },
    components: {
        Text: {
            baseStyle: {
                marginBottom: '0px',
            },
        },
        Modal: {
            baseStyle: {
                modal: {
                    borderRadius: '0px',
                },
            },
        },
        Button: {
            baseStyle: {
                borderRadius: '0px',
            },
        },
    },
});

export default ({ children }) => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};
