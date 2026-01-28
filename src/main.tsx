// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'
import { AdminAuthProvider } from '@/admin/context/AdminAuthContext';

function setViewportVars() {
  const doc = document.documentElement;
  const clientW = doc.clientWidth;
  const innerW = window.innerWidth;
  const sbw = Math.max(0, innerW - clientW);
  doc.style.setProperty('--vw', `${clientW / 100}px`);
  doc.style.setProperty('--sbw', `${sbw}px`);
}

setViewportVars();
window.addEventListener('resize', setViewportVars);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </StrictMode>,
)
