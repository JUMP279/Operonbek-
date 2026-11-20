import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { captureRefFromUrl } from './lib/referral';

captureRefFromUrl();   // ?ref=PROMOKOD havolasi (2026-11-17)

// Yangi versiya chiqqanda ochiq turgan sahifa eski (o'chirilgan) bo'lim faylini so'rasa — bir marta qayta yuklaymiz
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem('operon_chunk_reload')) return;
    sessionStorage.setItem('operon_chunk_reload', '1');
  } catch { /* storage yopiq */ }
  e.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => setTimeout(() => { try { sessionStorage.removeItem('operon_chunk_reload'); } catch { /* */ } }, 10000));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
