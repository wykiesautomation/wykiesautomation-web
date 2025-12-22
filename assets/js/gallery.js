
const { SHEET_API_URL } = window.__env || {};
const GALLERY_ENDPOINT = (SHEET_API_URL || '/cms') + '/gallery';
async function init(){
  const res = await fetch(GALLERY_ENDPOINT);
  const items = await res.json();
  const grid = document.getElementById('gallery');
  items.forEach(img=>{
    const card = document.createElement('figure');
    card.innerHTML = `<img src="${img.url}" alt="${img.title||''}"><figcaption>${img.title||''}</figcaption>`;
    grid.appendChild(card);
  });
}
document.addEventListener('DOMContentLoaded', ()=>init().catch(console.error));
