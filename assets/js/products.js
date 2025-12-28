
const config = { appsScriptUrl: (window.config && window.config.appsScriptUrl) };
async function fetchProducts(){
  try{ const r = await fetch(config.appsScriptUrl + '?entity=products'); return await r.json(); }
  catch(e){ const r = await fetch('./assets/js/products.sample.json'); return await r.json(); }
}
export async function renderProducts(){
  const list = await fetchProducts();
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list.filter(p=>p.active).map(p=>{
    const base = (p.imageUrl || ('assets/img/' + (p.sku||'wa-xx').toLowerCase() + '.png'));
    const webp = base.replace(/\.png$/i, '.webp');
    const alt = p.name || 'Product image';
    return `
    <article class="card">
      <picture>
        <source type="image/webp" srcset="${webp}">
        <img loading="lazy" src="${base}" alt="${alt}">
      </picture>
      <div class="content">
        <h3>${p.name}</h3>
        <p>${p.summary||''}</p>
        <p class="price">R${Number(p.price).toLocaleString()}</p>
        <div>
          <a class="btn" href="${p.trialUrl || '#'}">Download Trial</a>
          <a class="btn" href="${p.docUrl || '#'}">View Docs</a>
          <a class="btn" href="https://wa.me/27716816131?text=${encodeURIComponent('Hi, I am interested in ' + p.sku + ' — ' + p.name)}">WhatsApp</a>
        </div>
      </div>
    </article>`;
  }).join('');
  try{
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": list.filter(p=>p.active).map((p,i)=>({
        "@type": "Product",
        "name": p.name,
        "sku": p.sku,
        "image": p.imageUrl,
        "description": p.summary || p.description || '',
        "offers": {"@type":"Offer","priceCurrency":"ZAR","price": String(p.price), "availability":"https://schema.org/InStock" },
        "position": i+1
      }))
    };
    const tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(jsonld);
    document.head.appendChild(tag);
  }catch(err){ console.warn('JSON-LD inject error', err); }
}
window.addEventListener('DOMContentLoaded', renderProducts);
