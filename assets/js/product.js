
(async () => {
  const resConf = await fetch('config.json');
  const CONFIG = await resConf.json();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const res = await fetch(`${CONFIG.apiBase}?action=product&id=${encodeURIComponent(id)}`);
  const p = await res.json();
  document.getElementById('title').textContent = p.name || 'Product';
  const d = document.getElementById('detail');
  d.innerHTML = `<h3>${p.name||''}</h3><p>${p.description||''}</p><p class='price'>R ${p.price}</p>`;
})();
