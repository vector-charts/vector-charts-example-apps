import { createRoot } from 'react-dom/client';
import './assets/css/index.scss';
import ChakraContext from './context/ChakraContext';
import Root from './components/Root';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <ChakraContext>
        <Root />
    </ChakraContext>
);
