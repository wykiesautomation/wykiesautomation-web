
async function fetchProducts(){
  try{ const r = await fetch('/.netlify/functions/cms-read?type=products'); if(r.ok) return (await r.json()).products; }catch(e){}
  const r2 = await fetch('/data/products.json'); return await r2.json();
}

async function loadProducts(){
  const PRODUCTS = await fetchProducts();
  const GRID = document.getElementById('productGrid');
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.sku}" loading="lazy">
      <h3>${p.name}</h3>
      <div class="price">${p.price}</div>
      <button class='btn' onclick="location.href='product.html?sku=${p.sku}'">View</button>`;
    GRID.appendChild(card);
  });
  const PS = document.getElementById('productSelect');
  if (PS){ PRODUCTS.forEach(p=>{ const opt=document.createElement('option'); opt.value=p.sku; opt.textContent=`${p.sku} — ${p.name}`; PS.appendChild(opt); }); }
}
loadProducts();
