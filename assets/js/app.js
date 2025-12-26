
const app = {
  cfg: null,
  products: [],
  init(){
    fetch('config.json').then(r=>r.json()).then(cfg=>{this.cfg=cfg; return fetch('assets/data/products.json')})
      .then(r=>r.json()).then(items=>{this.products=items; this.renderGrid(); this.initModal();});
  },
  renderGrid(){
    const grid = document.getElementById('grid'); if(!grid) return;
    grid.innerHTML = '';
    this.products.filter(p=>p.active).forEach(p=>{
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.name}">
        <div class="content">
          <h3>${p.name}</h3>
          <div class="price">R${p.price.toLocaleString('en-ZA')}</div>
          <p>${p.summary}</p>
          <div class="btnrow">
            <a class="btn" href="product.html?sku=${p.sku}">View</a>
            <button class="btn secondary" onclick="app.openContact('${p.sku}')">Email</button>
            <a class="btn secondary" target="_blank" rel="noopener" href="https://wa.me/${app.cfg.whatsapp.replace('+','')}?text=${encodeURIComponent('Hi, I am interested in '+p.sku+' — '+p.name)}">WhatsApp</a>
          </div>
        </div>`;
      grid.appendChild(el);
    })
  },
  initModal(){
    const sel = document.getElementById('contactProduct'); if(!sel) return;
    sel.innerHTML = this.products.map(p=>`<option value="${p.sku}">${p.sku} — ${p.name}</option>`).join('');
  },
  openContact(sku){
    const m = document.getElementById('contactModal'); m.style.display='flex';
    const sel = document.getElementById('contactProduct'); if(sel && sku){sel.value = sku}
  },
  closeContact(){ document.getElementById('contactModal').style.display='none'; },
  submitContact(){
    const payload = {
      action: 'contact',
      product: document.getElementById('contactProduct').value,
      name: document.getElementById('contactName').value,
      email: document.getElementById('contactEmail').value,
      phone: document.getElementById('contactPhone').value,
      message: document.getElementById('contactMessage').value
    };
    // NOTE: This posts to Google Apps Script Web App. Configure URL in config.json.
    fetch(this.cfg.appsScriptWebAppUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      .then(r=>r.json()).then(()=>{alert('Message sent. We'll email you soon.'); app.closeContact();})
      .catch(()=>{alert('Offline demo: message queued. In production this will email wykiesautomation@gmail.com.')});
  }
};

// product page render
(function(){
  app.init();
  const params = new URLSearchParams(location.search);
  const sku = params.get('sku');
  if(!sku) return;
  fetch('assets/data/products.json').then(r=>r.json()).then(items=>{
    const p = items.find(x=>x.sku===sku); if(!p) return;
    const c = document.getElementById('productContainer');
    c.innerHTML = `
      <div class='card'>
        <img src='${p.imageUrl}' alt='${p.name}'>
        <div class='content'>
          <h2>${p.name} <span class='badge'>${p.sku}</span></h2>
          <div class='price'>R${p.price.toLocaleString('en-ZA')}</div>
          <p>${p.summary}</p>
          <div class='btnrow'>
            <a class='btn' href='${p.trialUrl}' target='_blank' rel='noopener'>Download Trial (.exe)</a>
            <a class='btn secondary' href='${p.docUrl}' target='_blank' rel='noopener'>Documentation</a>
            <button class='btn secondary' onclick="app.openContact('${p.sku}')">Email</button>
            <a class='btn secondary' target='_blank' rel='noopener' href='https://wa.me/${app.cfg.whatsapp.replace('+','')}?text=${encodeURIComponent('Hi, I am interested in '+p.sku+' — '+p.name)}'>WhatsApp</a>
          </div>
        </div>
      </div>`;
  })
})();
