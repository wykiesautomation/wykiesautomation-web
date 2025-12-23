const cfg = (async ()=> await (await fetch('/config.json')).json())();
async function loadGallery(){
  const c = await cfg;
  const res = await fetch(`${c.APP_SCRIPT_BASE}?route=gallery`);
  const {images} = await res.json();
  const wrap = document.getElementById('gallery');
  wrap.innerHTML = '';
  images.forEach(g=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<img src="${g.imageUrl}" alt="${g.caption||''}"><p>${g.caption||''}</p>`;
    wrap.appendChild(div);
  })
}
loadGallery();
