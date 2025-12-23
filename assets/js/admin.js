
// admin.js — simple passphrase login + CRUD via Apps Script
let ADMIN_TOKEN=null;

async function adminLogin(){
  const pass = (document.getElementById('passphrase').value||'').trim();
  const r = await waApi('login',{passphrase:pass});
  if(r.ok){ ADMIN_TOKEN = r.token; document.getElementById('loginBox').classList.add('hidden'); document.getElementById('adminApp').classList.remove('hidden'); loadProducts(); loadGallery(); loadPayments(); toast('Welcome, admin'); }
  else{ toast('Invalid passphrase', 2600); }
}

async function loadProducts(){
  const r = await waApi('products');
  const tbody = document.getElementById('prodRows');
  tbody.innerHTML='';
  r.items.forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `
      <td><code>${p.sku}</code></td>
      <td><input class="input" id="n-${p.sku}" value="${p.name||''}"></td>
      <td><input class="input" id="pr-${p.sku}" type="number" step="0.01" value="${p.price||0}"></td>
      <td><input class="input" id="s-${p.sku}" value="${p.summary||''}"></td>
      <td><input class="input" id="i-${p.sku}" value="${p.imageUrl||''}"></td>
      <td><input class="input" id="t-${p.sku}" value="${p.trialUrl||''}"></td>
      <td><input class="input" id="d-${p.sku}" value="${p.docUrl||''}"></td>
      <td><select id="a-${p.sku}"><option ${String(p.active).toLowerCase()==='true'?'selected':''}>true</option><option ${String(p.active).toLowerCase()!=='true'?'selected':''}>false</option></select></td>
      <td><button class="btn" onclick="saveProduct('${p.sku}')">Save</button></td>`;
    tbody.appendChild(tr);
  });
}

async function saveProduct(sku){
  const payload={
    sku,
    name: document.getElementById('n-'+sku).value,
    price: document.getElementById('pr-'+sku).value,
    summary: document.getElementById('s-'+sku).value,
    imageUrl: document.getElementById('i-'+sku).value,
    trialUrl: document.getElementById('t-'+sku).value,
    docUrl: document.getElementById('d-'+sku).value,
    active: document.getElementById('a-'+sku).value
  };
  const r = await waApi('updateProduct', payload);
  toast(r.ok?'Saved':'Error saving');
}

async function loadGallery(){
  const r = await waApi('gallery');
  const tbody = document.getElementById('galRows');
  tbody.innerHTML='';
  r.items.forEach((g,idx)=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td><input class="input" id="gu-${idx}" value="${g.url||''}"></td>
      <td><input class="input" id="gc-${idx}" value="${g.caption||''}"></td>
      <td><select id="ga-${idx}"><option ${String(g.active).toLowerCase()==='true'?'selected':''}>true</option><option ${String(g.active).toLowerCase()!=='true'?'selected':''}>false</option></select></td>`;
    tbody.appendChild(tr);
  });
}

async function addGallery(){
  const url = document.getElementById('newUrl').value.trim();
  const caption = document.getElementById('newCaption').value.trim();
  const r = await waApi('addGalleryImage',{url,caption});
  toast(r.ok?'Added':'Error adding');
  if(r.ok){ document.getElementById('newUrl').value=''; document.getElementById('newCaption').value=''; loadGallery(); }
}

async function loadPayments(){
  const r = await waApi('payments');
  const tbody = document.getElementById('payRows');
  tbody.innerHTML='';
  (r.items||[]).forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `
      <td>${p.Timestamp||''}</td>
      <td>${p.InvoiceNo||''}</td>
      <td>${p.OrderID||''}</td>
      <td>${p.pf_payment_id||''}</td>
      <td>${p.Email||''}</td>
      <td>${p.SKU||''}</td>
      <td>${p.TotalInclVAT||''}</td>
      <td>${p.ReleasedAt||''}</td>
      <td><button class="btn secondary" onclick="resend('${p.InvoiceNo||''}')">Resend</button></td>`;
    tbody.appendChild(tr);
  });
}

async function resend(inv){
  if(!inv) return;
  const r = await waApi('resendInvoice',{invoiceNo:inv});
  toast(r.ok?('Resent '+inv):'Resend failed');
}
