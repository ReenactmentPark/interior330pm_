import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css';

function setViewportVars() {
  const doc = document.documentElement;

  // clientWidth = 스크롤바 제외한 실제 레이아웃 폭
  const clientW = doc.clientWidth;
  const innerW = window.innerWidth;

  // 스크롤바 폭(px)
  const sbw = Math.max(0, innerW - clientW);

  // 1vw를 "스크롤바 제외" 기준으로 재정의
  doc.style.setProperty('--vw', `${clientW / 100}px`);
  doc.style.setProperty('--sbw', `${sbw}px`);
}

setViewportVars();
window.addEventListener('resize', setViewportVars);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
