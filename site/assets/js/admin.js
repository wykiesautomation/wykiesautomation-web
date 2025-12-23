/* Admin logic */
let CFG = null; const cfgUrl='../../config.json';
async function loadConfig(){ if(!CFG){ const r=await fetch(cfgUrl); CFG=await r.json(); } }
async function login(){ await loadConfig();
  const pass=document.getElementById('passphrase').value;
  const r = await fetch(CFG.appsScriptWebAppUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({route:'login', passphrase: pass})});
  const res = await r.json();
  const s=document.getElementById('loginStatus');
  if(res.ok){ s.textContent='Logged in'; document.getElementById('login').classList.add('hidden'); document.getElementById('admin').classList.remove('hidden'); loadAdminData(res.token); }
  else { s.textContent='Login failed'; }
}

async function loadAdminData(token){
  // load products
  const r = await fetch(`${CFG.appsScriptWebAppUrl}?route=products`, { headers:{'X-Auth': token}});
  const data = await r.json();
  const skuSel = document.getElementById('sku'); const gskuSel=document.getElementById('gsku');
  data.products.forEach(p=>{ const o=document.createElement('option'); o.value=p.sku; o.textContent=p.sku+' — '+p.name; skuSel.appendChild(o); const og=o.cloneNode(true); gskuSel.appendChild(og); });
  skuSel.onchange=()=>{
    const p = data.products.find(x=>x.sku===skuSel.value);
    if(!p) return;
    document.getElementById('name').value=p.name; document.getElementById('price').value=p.price; document.getElementById('imageUrl').value=p.imageUrl||''; document.getElementById('trialUrl').value=p.trialUrl||''; document.getElementById('docUrl').value=p.docUrl||''; document.getElementById('active').checked=!!p.active;
  };
  document.getElementById('saveBtn').onclick=async()=>{
    const body={route:'updateProduct', sku: skuSel.value, name: document.getElementById('name').value, price: Number(document.getElementById('price').value), imageUrl: document.getElementById('imageUrl').value, trialUrl: document.getElementById('trialUrl').value, docUrl: document.getElementById('docUrl').value, active: document.getElementById('active').checked};
    const r2=await fetch(CFG.appsScriptWebAppUrl,{method:'POST', headers:{'Content-Type':'application/json','X-Auth': token}, body: JSON.stringify(body)});
    const res=await r2.json(); alert(res.ok?'Saved':'Save failed');
  };
  document.getElementById('addImageBtn').onclick=async()=>{
    const body={route:'addGalleryImage', sku: gskuSel.value, imageUrl: document.getElementById('gimage').value};
    const r3=await fetch(CFG.appsScriptWebAppUrl,{method:'POST', headers:{'Content-Type':'application/json','X-Auth': token}, body: JSON.stringify(body)});
    const res=await r3.json(); alert(res.ok?'Added':'Add failed');
  };
  // payments
  const rp = await fetch(`${CFG.appsScriptWebAppUrl}?route=payments`, { headers:{'X-Auth': token}}); const payments=await rp.json();
  const cont=document.getElementById('payments');
  payments.rows.forEach(row=>{
    const div=document.createElement('div'); div.textContent=`${row.Timestamp} | ${row.InvoiceNo} | ${row.Email} | ${row.SKU} | R${row.TotalInclVAT}`; div.dataset.invoice=row.InvoiceNo; cont.appendChild(div);
  });
  document.getElementById('resendInvoiceBtn').onclick=async()=>{
    const selected = cont.querySelector('div'); if(!selected) return alert('Select a payment row first');
    const inv=selected.dataset.invoice; const r4=await fetch(CFG.appsScriptWebAppUrl,{method:'POST', headers:{'Content-Type':'application/json','X-Auth': token}, body: JSON.stringify({route:'resendInvoice', invoiceNo: inv})}); const res=await r4.json(); alert(res.ok?'Sent':'Failed');
  };
}

document.getElementById('loginBtn').onclick=login;
