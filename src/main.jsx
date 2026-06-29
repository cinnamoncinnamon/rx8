import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initDevtoolsBlock } from './utils/devtoolsBlock.js'

document.getElementById('root').style.cssText = 'display:block;overflow-y:auto;min-height:unset'

// ── DevTools shield ───────────────────────────────────────────────────────────
let _overlay = null;

function _showOverlay() {
  if (_overlay) return;
  _overlay = document.createElement('div');
  _overlay.id = 'spinova-shield';
  _overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:rgba(10,10,20,0.97);
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    font-family:'Poppins',sans-serif;
  `;
  _overlay.innerHTML = `
    <div style="font-size:48px;margin-bottom:16px;">🔒</div>
    <div style="color:#EF5350;font-size:22px;font-weight:900;letter-spacing:2px;margin-bottom:10px;">ACCESS RESTRICTED</div>
    <div style="color:rgba(255,255,255,0.6);font-size:13px;text-align:center;max-width:280px;line-height:1.6;">
      Developer tools are not permitted.<br/>Please close DevTools to continue.
    </div>
    <div style="margin-top:28px;color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:3px;">SPINOVA</div>
  `;
  document.body.appendChild(_overlay);

  // Blur app behind overlay
  const root = document.getElementById('root');
  if (root) root.style.filter = 'blur(12px)';
}

// initDevtoolsBlock(_showOverlay);

// ── Render ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
