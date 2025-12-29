
<!-- public/app.js -->
<script>
// ------- Config loader -------
async function loadConfig() {
  try {
    const res = await fetch('./config/config.json', { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (_) {}
  try {
function currencyR(z){ return 'R ' + Number(z||0).toFixed(0); }    const res = await fetch('./config/config.example.json', { cache: 'no-store' });
function showNotice(hostId, text, kind='error') {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = `
    <div style="background:#f8fbff;border:1px solid #d7e3f5;color:${kind==='error'?'#a10000':'#0a3a83'};padding:12px;border-radius:10px">
      ${text}
    </div>`;
}

// ------- Hero CTA wiring (optional) -------
function wireHeroCTAs(cfg) {
  const btnTrial  = document.getElementById('cta-trial');
  const btnDocs   = document.getElementById('cta-docs');
  const btnWhats  = document.getElementById('cta-whatsapp');
  const btnContact= document.getElementById('cta-contact');

  if (btnTrial)  btnTrial.onclick  = () => location.href = '#products';
  if (btnDocs)   btnDocs.onclick   = () => location.href = 'docs.html';
  if (btnWhats)  btnWhats.onclick  = () => window.open('https://wa.me/27716816131', '_blank');
  if (btnContact)btnContact.onclick= () => location.href = '#workspace';
}

// ------- Workspace binding (Ask & Quote) -------
function bindForm(formId, url, msgId){
  const form = document.getElementById(formId);
  const msg  = document.getElementById(msgId);
  if (!form || !msg) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    msg.textContent = 'Sending…'; msg.className='msg';
    const data = Object.fromEntries(new FormData(form).entries());
    // Honeypot fields (spam prevention)
    if (data.company || data.fax) { msg.textContent = 'Blocked (spam)'; msg.className='msg error'; return; }
    try {
      const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      const j   = await res.json();
      if (!j.ok) throw new Error(j.error || 'Failed');
      msg.textContent = 'Sent! We’ll email you shortly.'; msg.className='msg success';
      form.reset();
    } catch (err) {
      msg.textContent = 'Error: ' + (err.message || 'Failed to send'); msg.className = 'msg error';
    }
  });
}

// ------- Main renderer -------
async function renderHome(){
  let cfg;
  try { cfg = await loadConfig(); }
  catch (e) {
    showNotice('product-grid', e.message);
    return;
  }

  wireHeroCTAs(cfg);

  // Fetch data
  let products = [], gallery = [];
  try {
    const [rp, rg] = await Promise.all([
      fetch(cfg.scriptUrl + '?route=products'),
      fetch(cfg.scriptUrl + '?route=gallery')
    ]);
    if (rp.ok) { const jp = await rp.json(); if (jp.ok) products = jp.items || []; }
    if (rg.ok) { const jg = await rg.json(); if (jg.ok) gallery = jg.items || []; }
  } catch (_) {}

  const grid = document.getElementById('product-grid');
  const gp   = document.getElementById('gallery-preview');

  if (!products.length) {
    showNotice('product-grid', 'We could not load products right now. Please refresh in a moment.');
    return;
  }

  function draw(list){
    grid.innerHTML = '';
    list.filter(p => String(p.active).toLowerCase()==='true').forEach(p => {
      grid.insertAdjacentHTML('beforeend', `
        <article class="card" data-sku="${p.sku}">
          ${p.imageUrl ? `${p.imageUrl}` : ''}
          <h3>${p.name || p.sku}</h3>
          <p class="tiny muted">SKU: ${p.sku || ''}</p>
          <p class="muted">${p.summary || ''}</p>
          <p class="price">${currencyR(p.price_incl)}</p>
          <div class="actions">
            product.html?sku=${p.sku}View Details</a>
            ${p.trialUrl ? `${p.trialUrl}Download Trial</a>` : ''}
          </div>
        </article>`);
    });
  }
  draw(products);

  // Search
  const search = document.getElementById('product-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = (search.value||'').toLowerCase();
      const filtered = !q ? products
        : products.filter(p => [p.sku, p.name, p.summary].join(' ').toLowerCase().includes(q));
      draw(filtered);
    });
  }

  // Gallery preview
  gp.innerHTML = '';
  (gallery || []).slice(0, 6).forEach(g => {
    gp.insertAdjacentHTML('beforeend', `
      <figure class="card">
        <img src="${g.thumbUrl || g.imageUrl || ''}" alt="${g.caption || ged">${g.caption || g.name || ''}</figcaption>
      </figure>`);
  });

  // Workspace dropdowns + form binding (if present)
  const askSel   = document.getElementById('askSku');
  const quoteSel = document.getElementById('quoteSku');
  [askSel, quoteSel].forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '<option value="">Select a product</option>' +
      products.filter(p => String(p.active).toLowerCase()==='true')
              .map(p => `<option value="${p.sku}">${p.sku} — ${p.name}</option>`).join('');
  });
  bindForm('askForm',   cfg.scriptUrl+'?route=contact.ask',   'askMsg');
  bindForm('quoteForm', cfg.scriptUrl+'?route=contact.quote', 'quoteMsg');
}

// Auto-run on pages that have product grid
if (document.getElementById('product-grid')) renderHome();
</script>
    if (res.ok) return await res.json();
  } catch (_) {}
  throw new Error('Config not found: add public/config/config.json with scriptUrl + sheetId');
}

// ------- Helpers -------
