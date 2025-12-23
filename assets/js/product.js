
// product.js — detail page logic
(async function(){
  const sku = new URLSearchParams(location.search).get('sku');
  const data = await waApi('products');
  const p = data.items.find(x=> x.sku === sku) || data.items[0];
  if(!p){
    document.getElementById('productArea').innerHTML = '<div class="alert">Product not found.</div>';
    return;
  }
  document.getElementById('sku').textContent = p.sku;
  document.getElementById('name').textContent = p.name;
  document.getElementById('price').textContent = currencyZAR(p.price);
  document.getElementById('desc').textContent = p.description||'';
  document.getElementById('hero').src = p.imageUrl||'assets/img/placeholder-product.jpg';
  const btns = document.getElementById('btns');
  btns.innerHTML = `
    <button class="btn" onclick="buyNow('${p.sku}', ${p.price}, '${p.name.replace("'","'")}')">Buy via PayFast</button>
    ${p.trialUrl?`<a class="btn secondary" href="${p.trialUrl}" target="_blank">Trial</a>`:''}
    ${p.docUrl?`<a class="btn secondary" href="${p.docUrl}" target="_blank">Docs</a>`:''}
    <a class="btn secondary" href="mailto:wykiesautomation@gmail.com?subject=${encodeURIComponent('Enquiry: '+p.sku+' '+p.name)}">Email</a>
    <a class="btn secondary" target="_blank" href="#" id="waLink">WhatsApp</a>`;
  const cfg = await waLoadConfig();
  const wa = document.getElementById('waLink');
  const msg = encodeURIComponent(`Hi, I'm interested in ${p.sku} - ${p.name} at ${currencyZAR(p.price)}.`);
  wa.href = `https://wa.me/${cfg.contact.whatsapp_number}?text=${msg}`;
})();
