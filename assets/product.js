
(function(){ document.getElementById('build-id').textContent = 'BUILD-2026-01-02-public-full'; })();
const API = (path, init={}) => fetch(`/api?path=${encodeURIComponent(path)}`, {
  ...init,
  headers: { 'content-type': 'application/json', ...(init.headers||{}) }
}).then(r => r.json()).catch(() => ({ ok:false }));

function getParam(name){ return new URLSearchParams(location.search).get(name); }
(async function(){
  const id = getParam('id');
  const el = document.getElementById('product-detail');
  const resp = await API('products');
  const list = resp.ok ? resp.data : [];
  const p = list.find(x=>x.id===id) || { id, name:id, price:'—', desc:'Product page' };
  el.innerHTML = `
    <h1>${p.name}</h1>
    <div class="badge">R ${p.price}</div>
    <p class="muted">${p.desc||'Automation module'}</p>
  `;
})();
