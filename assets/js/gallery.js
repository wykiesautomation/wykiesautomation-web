
async function fetchGallery(){
  try{ const r = await fetch('/.netlify/functions/cms-read?type=gallery'); if(r.ok) return (await r.json()).gallery; }catch(e){}
  const r2 = await fetch('/data/gallery.json'); return await r2.json();
}

(async ()=>{
  const items = await fetchGallery();
  const wrap = document.getElementById('gallery');
  items.forEach(g=>{
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `<img src="${g.url}" alt="${g.title}"><div style='padding:8px'>${g.title||''}</div>`;
    wrap.appendChild(div);
  });
})();
