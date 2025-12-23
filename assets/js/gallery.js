
async function loadConfig(){ const r = await fetch('config.json'); return await r.json(); }
async function fetchGallery(){ try{ const cfg = await loadConfig(); const r = await fetch(cfg.appsScriptUrl + '?action=gallery'); if(r.ok){ const data = await r.json(); if(Array.isArray(data)) return data; } }catch(e){} return [{ url:'assets/img/logo_blue.svg', caption:'Wykies Automation' }]; }
async function render(){ const grid = document.getElementById('galleryGrid'); const items = await fetchGallery(); grid.innerHTML = items.map(g=>`<div class='card'><img src='${g.url}' alt='${g.caption}'><div style='margin-top:8px'>${g.caption}</div></div>`).join(''); }
render();
