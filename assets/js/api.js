// API helper with fallback to local products.json
async function fetchProducts(){
  try{
    const cfg = await (await fetch('config.json')).json();
    if(cfg.apiBase){
      const res = await fetch(cfg.apiBase + '?action=products');
      if(res.ok) return res.json();
    }
  }catch(e){ /* ignore and fall back */ }
  // fallback
  const res = await fetch('assets/data/products.json');
  return res.json();
}
async function fetchProduct(sku){
  const list = await fetchProducts();
  return list.find(p=>p.sku===sku);
}
