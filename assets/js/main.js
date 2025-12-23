const cfg = (async ()=> await (await fetch('/config.json')).json())();
const fmtZAR = v => new Intl.NumberFormat('en-ZA', {style:'currency', currency:'ZAR'}).format(v);

async function loadProducts(){
  const c = await cfg; document.getElementById('year').innerText = new Date().getFullYear();
  const res = await fetch(`${c.APP_SCRIPT_BASE}?route=products`);
  const data = await res.json();
  const wrap = document.getElementById('products');
  wrap.innerHTML = '';
  data.products.filter(p=>p.active).forEach(p=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `
      <img src="${p.imageUrl || '/assets/images/placeholder.png'}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="price">${fmtZAR(p.price)}</div>
      <p>${p.summary||''}</p>
      <div class="btnrow">
        <a class="btn" href="/product.html?sku=${encodeURIComponent(p.sku)}">Details</a>
        <button class="btn" onclick="payfastCheckout('${p.sku}')">Buy</button>
        <a class="btn secondary" href="${p.trialUrl || '#'}" target="_blank">Trial</a>
        <a class="btn secondary" href="${p.docUrl || '#'}" target="_blank">Docs</a>
      </div>`;
    wrap.appendChild(div);
  })
}

async function payfastCheckout(sku){
  const c = await cfg;
  const res = await fetch(`${c.APP_SCRIPT_BASE}?route=payfastInit&sku=${encodeURIComponent(sku)}`);
  const pf = await res.json();
  // Build and submit offsite form to PayFast
  const form = document.createElement('form');
  form.action = pf.processUrl; // live or sandbox URL provided by backend
  form.method = 'POST';
  for(const [k,v] of Object.entries(pf.fields)){
    const input = document.createElement('input');
    input.type='hidden'; input.name=k; input.value=v; form.appendChild(input);
  }
  document.body.appendChild(form); form.submit();
}

loadProducts();
