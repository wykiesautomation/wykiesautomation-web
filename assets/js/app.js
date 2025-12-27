
(async function(){
  const cfg = await (await fetch('config.json')).json();
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox?.querySelector('img');
  function openLightbox(src, alt){ if(!lightbox) return; lbImg.src = src; lbImg.alt = alt; lightbox.classList.add('show'); }
  lightbox?.addEventListener('click',()=> lightbox.classList.remove('show'))

  async function fetchJSON(path){
    try{
      const res = await fetch(`${cfg.appsScriptUrl}?path=${encodeURIComponent(path)}`);
      return await res.json();
    }catch(e){ console.warn('CMS fetch failed', e); return []; }
  }

  // Populate products
  const productsEl = document.getElementById('products') || document.getElementById('productGrid');
  if(productsEl){
    const items = await fetchJSON('products');
    const visible = items.filter(p => p.active !== false);
    productsEl.innerHTML = visible.map(p => `
      <div class="card">
        <img src="assets/img/${p.imageFile || (p.sku||'unknown').toLowerCase().replace('-', '')}.png" alt="${p.name} image" loading="lazy"/>
        <h3>${p.name}</h3>
        <div class="price">R${Number(p.price).toLocaleString('en-ZA')}</div>
        <p style="color:#94a3b8">${p.summary||''}</p>
        <div class="btns">
          <button class="btn primary" onclick='checkout("${p.sku}", ${Number(p.price)})'>PayFast Checkout</button>
          ${p.trialUrl?`<a class="btn secondary" href="${p.trialUrl}">Download Trial</a>`:''}
          ${p.docUrl?`<a class="btn secondary" href="${p.docUrl}">View Docs</a>`:''}
          <a class="btn whatsapp" href="https://wa.me/${cfg.adminWhatsApp.replace('+','') }?text=Hi%2C%20I%20want%20${encodeURIComponent(p.name)}%20(${p.sku})">WhatsApp</a>
        </div>
      </div>`).join('');
  }

  // Populate gallery
  const galleryEl = document.getElementById('gallery') || document.getElementById('galleryPreview');
  if(galleryEl){
    const g = await fetchJSON('gallery');
    galleryEl.innerHTML = g.map(img => `
      <div class="card">
        <img src="assets/img/${img.file}" alt="${img.alt}" loading="lazy" onclick='openLightbox("assets/img/${img.file}", "${img.alt}")'/>
        <h3>${img.caption||''}</h3>
      </div>`).join('');
  }

  // Wire hero Trial/Docs buttons site-wide
  const heroTrialBtn = document.getElementById('heroTrialBtn');
  const heroDocsBtn  = document.getElementById('heroDocsBtn');
  (async function wireHeroShortcuts(){
    try {
      const products = await fetchJSON('products');
      const trialItem = products.find(p => p.trialUrl);
      const docItem   = products.find(p => p.docUrl);
      if (heroTrialBtn) heroTrialBtn.href = (trialItem && trialItem.trialUrl) ? trialItem.trialUrl : "product.html";
      if (heroDocsBtn)  heroDocsBtn.href  = (docItem && docItem.docUrl) ? docItem.docUrl : "product.html";
    } catch(e) {
      console.warn('Hero shortcuts wiring failed', e);
      if (heroTrialBtn) heroTrialBtn.href = "product.html";
      if (heroDocsBtn)  heroDocsBtn.href  = "product.html";
    }
  })();

  // PayFast offsite form POST
  window.checkout = function(sku, amount){
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.payfast.co.za/eng/process';
    form.innerHTML = `
    <input type="hidden" name="merchant_id" value="${cfg.merchantId}">

    <input type="hidden" name="merchant_key" value="${cfg.merchantKey}">

    <input type="hidden" name="amount" value="${Number(amount).toFixed(2)}">

    <input type="hidden" name="item_name" value="${sku}">

    <input type="hidden" name="item_description" value="${sku} purchase">

    <input type="hidden" name="email_address" value="">

    <input type="hidden" name="m_payment_id" value="${sku}-${Date.now()}">

    <input type="hidden" name="return_url" value="${location.origin}/product.html">

    <input type="hidden" name="cancel_url" value="${location.origin}/product.html">

    <input type="hidden" name="notify_url" value="https://admin.wykiesautomation.co.za/api/itn">`;
    document.body.appendChild(form); form.submit();
  }
})();
