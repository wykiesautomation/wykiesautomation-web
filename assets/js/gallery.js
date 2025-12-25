
(async () => {
  const resConf = await fetch('config.json');
  const CONFIG = await resConf.json();
  const res = await fetch(`${CONFIG.apiBase}?action=gallery&sheetId=${CONFIG.sheetId}`);
  const data = await res.json();
  const grid = document.getElementById('gallery');
  grid.innerHTML='';
  (data.images||[]).forEach(img => {
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `<img alt='${img.alt||'Photo'}' loading='lazy' style='max-width:100%;border-radius:8px' src='${img.url}'>`;
    grid.appendChild(card);
  });
})();
