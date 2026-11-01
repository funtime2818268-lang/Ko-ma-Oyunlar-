import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for APK / PWA offline standalone gameplay
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);

