const dataUrl='assets/js/gallery-data.json';
const grid=document.getElementById('gallery');
const tpl=document.getElementById('tpl-card');
fetch(dataUrl).then(r=>r.json()).then(items=>{ items.forEach(({src,alt,caption})=>{ const node=tpl.content.cloneNode(true); const img=node.querySelector('img'); const cap=node.querySelector('figcaption'); img.src=src; img.alt=alt||caption||'Gallery image'; cap.textContent=caption||''; grid.appendChild(node); }); }).catch(err=>{ grid.innerHTML='<p class="error">Failed to load gallery.</p>'; console.error(err); });
// Lightbox
grid.addEventListener('click',e=>{ const img=e.target.closest('img'); if(!img) return; const overlay=document.createElement('div'); overlay.className='lightbox'; overlay.innerHTML=`<img src="${img.src}" alt="${img.alt}"><button aria-label="Close">×</button>`; document.body.appendChild(overlay); overlay.querySelector('button').onclick=()=>overlay.remove(); overlay.onclick=(ev)=>{ if(ev.target===overlay) overlay.remove(); }; });
