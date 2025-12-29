
(async () => {
  const cfg = await (await fetch('../core/config.json')).json();
  const base = cfg.cms.apps_script_base;
  const productsUrl = `${base}?route=products`;
  const docsUrl = `${base}?route=documents`;

  const grid = document.getElementById('grid');
  const docs = document.getElementById('docs');

  function card(p) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image || './assets/placeholder.png'}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <div class="price">R${Number(p.price).toLocaleString()}</div>
      <button class="btn" onclick="location.href='checkout.html?id=${encodeURIComponent(p.id)}'">Buy</button>
    `;
    return div;
  }

  try {
    const res = await fetch(productsUrl, { cache: 'no-store' });
    const list = await res.json();
    list.forEach(p => grid.appendChild(card(p)));
  } catch (e) {
    console.error('Products fetch failed', e);
  }

  try {
    const res = await fetch(docsUrl, { cache: 'no-store' });
    const list = await res.json();
    (list || []).forEach(d => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${d.url}" target="_blank" rel="noopener">${d.title}</a>`;
      docs.appendChild(li);
    });
  } catch (e) {
    console.error('Docs fetch failed', e);
  }
})();
