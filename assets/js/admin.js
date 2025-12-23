let cfg = null;
async function ensureCfg(){ if(!cfg){ cfg = await (await fetch('config.json').catch(()=>fetch('config.sample.json'))).json(); } return cfg; }

function isAuthed(){ return localStorage.getItem('adminAuthed')==='yes'; }
function show(id, s){ const el=document.getElementById(id); if(el) el.style.display=s? 'block':'none'; }

async function login(){
  const pass = document.getElementById('passphrase').value.trim();
  // Passphrase required by spec (can be changed in Apps Script)
  if(pass === 'Ford@20132016'){
    localStorage.setItem('adminAuthed','yes');
    show('loginPanel', false); show('adminContent', true);
    loadProducts(); loadPayments();
  } else {
    const s=document.getElementById('loginStatus'); s.textContent='Incorrect passphrase'; s.style.display='block';
  }
}

async function api(action, payload){
  const c = await ensureCfg();
  const body = JSON.stringify(Object.assign({action}, payload||{}));
  const res = await fetch(c.appsScriptApiUrl, {method: 'POST', body});
  return res.json();
}

async function loadProducts(){
  const data = await api('listProducts');
  const t = document.getElementById('productsTable');
  t.innerHTML = '<tr><th>SKU</th><th>Name</th><th>Price</th><th>Image</th><th>Trial</th><th>Docs</th><th>Active</th><th>Save</th></tr>' +
    data.map(p=>`<tr>
      <td>${p.sku}</td>
      <td><input value="${p.name}" data-sku="${p.sku}" data-field="name"></td>
      <td><input value="${p.price}" data-sku="${p.sku}" data-field="price" type="number"></td>
      <td><input value="${p.imageUrl||''}" data-sku="${p.sku}" data-field="imageUrl"></td>
      <td><input value="${p.trialUrl||''}" data-sku="${p.sku}" data-field="trialUrl"></td>
      <td><input value="${p.docUrl||''}" data-sku="${p.sku}" data-field="docUrl"></td>
      <td><input type="checkbox" ${p.active? 'checked':''} data-sku="${p.sku}" data-field="active"></td>
      <td><button class="btn" onclick="saveRow('${p.sku}')">Save</button></td>
    </tr>`).join('');
}

async function saveRow(sku){
  const rowInputs = Array.from(document.querySelectorAll(`[data-sku='${sku}']`));
  const payload = { sku };
  for(const inp of rowInputs){
    let val = inp.type==='checkbox' ? inp.checked : inp.value;
    payload[inp.getAttribute('data-field')] = val;
  }
  const r = await api('updateProduct', payload);
  alert(r.ok? 'Saved' : 'Failed');
}

async function loadPayments(){
  const r = await api('listPayments');
  const d = document.getElementById('paymentsList');
  d.innerHTML = '<table class="table"><tr><th>Time</th><th>Invoice</th><th>Order</th><th>Email</th><th>SKU</th><th>Total</th><th>Actions</th></tr>' +
    r.map(p=>`<tr>
      <td>${p.Timestamp||''}</td>
      <td>${p.InvoiceNo||''}</td>
      <td>${p.OrderID||''}</td>
      <td>${p.Email||''}</td>
      <td>${p.SKU||''}</td>
      <td>${p.TotalInclVAT||''}</td>
      <td><button class="btn" onclick="resendInvoice('${p.InvoiceNo}')">Resend</button></td>
    </tr>`).join('') + '</table>';
}

async function resendInvoice(inv){
  const r = await api('resendInvoice', {invoiceNo: inv});
  alert(r.ok? 'Resent' : 'Failed');
}

async function uploadImage(){
  const sku = document.getElementById('imgSku').value.trim();
  const file = document.getElementById('imgFile').files[0];
  if(!sku || !file){ alert('SKU and image required'); return; }
  const c = await ensureCfg();
  const fd = new FormData(); fd.append('action','uploadImage'); fd.append('sku', sku); fd.append('file', file);
  const res = await fetch(c.appsScriptApiUrl, {method:'POST', body: fd});
  const json = await res.json();
  const s = document.getElementById('uploadStatus'); s.style.display='block'; s.textContent = json.ok? 'Uploaded' : 'Failed';
  if(json.url){ // update product image
    await api('updateProduct', {sku, imageUrl: json.url});
    loadProducts();
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('uploadImgBtn').addEventListener('click', uploadImage);
  if(isAuthed()){ show('loginPanel', false); show('adminContent', true); loadProducts(); loadPayments(); }
});
