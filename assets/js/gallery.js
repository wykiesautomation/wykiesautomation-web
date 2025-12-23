
(async function(){
  const { items } = await API.get('gallery');
  const grid = qs('#gallery');
  grid.innerHTML = items.map(g=>`<img src="${g.url}" alt="${g.caption||''}" />`).join('');
})();
