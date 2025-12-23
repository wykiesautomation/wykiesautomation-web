
import { qs, snackbar } from './ui.js';
import { adminLogin, fetchProducts, updateProduct, fetchPayments, addGalleryImage, resendInvoice, initNav } from './cms.js';

let token = null;

async function loginHandler(){
  const pass = qs('#passphrase').value.trim();
  const res = await adminLogin(pass);
  if(res && res.ok){ token = res.token; snackbar('Logged in'); loadProducts(); loadPayments(); } else { snackbar('Invalid passphrase'); }
}

async function loadProducts(){
  const products = await fetchProducts();
  const tbody = qs('#prod-rows'); tbody.innerHTML='';
  products.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge">${p.sku}</span></td>
      <td><input class="input" value="${p.name}" data-k="name"></td>
      <td><input class="input" value="${p.price}" data-k="price"></td>
      <td><input class="input" value="${p.imageUrl}" data-k="imageUrl"></td>
      <td><input class="input" value="${p.trialUrl||''}" data-k="trialUrl"></td>
      <td><input class="input" value="${p.docUrl||''}" data-k="docUrl"></td>
      <td><select class="input" data-k="active"><option ${p.active?'selected':''} value="true">true</option><option ${!p.active?'selected':''} value="false">false</option></select></td>
      <td><button class="btn" data-sku="${p.sku}">Save</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button').forEach(btn=>btn.addEventListener('click', async (ev)=>{
    const tr = ev.target.closest('tr');
    const payload = { sku: ev.target.dataset.sku };
    tr.querySelectorAll('input,select').forEach(inp=>{ payload[inp.dataset.k] = inp.value; });
    payload.active = String(payload.active).toLowerCase()==='true';
    const res = await updateProduct(payload, token);
    snackbar(res && res.ok ? 'Saved' : 'Save failed');
  }));
}

async function loadPayments(){
  const rows = await fetchPayments();
  const tbody = qs('#pay-rows'); tbody.innerHTML='';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.Timestamp||''}</td>
      <td>${r.InvoiceNo||''}</td>
      <td>${r.OrderID||''}</td>
      <td>${r.pf_payment_id||''}</td>
      <td>${r.Email||''}</td>
      <td>${r.SKU||''}</td>
      <td>${r.TotalInclVAT||''}</td>
      <td><button class="btn" data-inv="${r.InvoiceNo||''}">Resend</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button').forEach(btn=>btn.addEventListener('click', async (ev)=>{
    const inv = ev.target.dataset.inv; if(!inv) return;
    const res = await resendInvoice(inv, token);
    snackbar(res && res.ok ? 'Invoice resent' : 'Resend failed');
  }));
}

async function addGallery(){
  const url = qs('#g-url').value.trim();
  const caption = qs('#g-cap').value.trim();
  if(!url){ snackbar('URL required'); return; }
  const res = await addGalleryImage({ url, caption }, token);
  snackbar(res && res.ok ? 'Image added' : 'Add failed');
}

window.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  qs('#login-btn')?.addEventListener('click', loginHandler);
  qs('#g-add-btn')?.addEventListener('click', addGallery);
});
