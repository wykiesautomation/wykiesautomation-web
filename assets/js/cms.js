
import { qs, snackbar } from './ui.js';

export const CFG = {};
async function loadCfg(){
  if(Object.keys(CFG).length) return CFG;
  const res = await fetch('/assets/js/config.json');
  Object.assign(CFG, await res.json());
  return CFG;
}

export async function fetchProducts(){ await loadCfg(); const r = await fetch(`${CFG.appsScriptUrl}?action=products`); return r.json(); }
export async function fetchGallery(){ await loadCfg(); const r = await fetch(`${CFG.appsScriptUrl}?action=gallery`); return r.json(); }
export async function fetchPayments(){ await loadCfg(); const r = await fetch(`${CFG.appsScriptUrl}?action=payments`); return r.json(); }
export async function contact(payload){ await loadCfg(); const r = await fetch(CFG.appsScriptUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'contact', ...payload }) }); return r.json(); }

// Admin endpoints
export async function adminLogin(passphrase){ await loadCfg(); const r = await fetch(CFG.appsScriptUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'login', passphrase }) }); return r.json(); }
export async function updateProduct(payload, token){ await loadCfg(); const r = await fetch(CFG.appsScriptUrl, { method:'POST', headers:{'Content-Type':'application/json','X-Admin-Token': token}, body: JSON.stringify({ action:'updateProduct', ...payload }) }); return r.json(); }
export async function addGalleryImage(payload, token){ await loadCfg(); const r = await fetch(CFG.appsScriptUrl, { method:'POST', headers:{'Content-Type':'application/json','X-Admin-Token': token}, body: JSON.stringify({ action:'addGalleryImage', ...payload }) }); return r.json(); }
export async function resendInvoice(invoiceNo, token){ await loadCfg(); const r = await fetch(CFG.appsScriptUrl, { method:'POST', headers:{'Content-Type':'application/json','X-Admin-Token': token}, body: JSON.stringify({ action:'resendInvoice', invoiceNo }) }); return r.json(); }

export async function initNav(){
  const nav = document.querySelector('nav'); if(!nav) return;
  const href = location.pathname.split('/').pop();
  nav.querySelectorAll('a').forEach(a=>{ if(a.getAttribute('href')===href) a.classList.add('active'); });
}
