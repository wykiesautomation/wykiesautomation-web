
const { SHEET_API_URL, ADMIN_PASSPHRASE } = window.__env || {};
const PRODUCTS_ENDPOINT = (SHEET_API_URL || '/cms') + '/products';
const UPDATE_PRODUCT_ENDPOINT = (SHEET_API_URL || '/cms') + '/products/update';
const ADD_GALLERY_ENDPOINT = (SHEET_API_URL || '/cms') + '/gallery/add';

function showPanel(){ document.getElementById('panel').hidden=false; document.getElementById('login').hidden=true; }
async function login(){
  const input = document.getElementById('passphrase').value;
  if(!ADMIN_PASSPHRASE){alert('Admin locked until passphrase env var is set.'); return;}
  if(input===ADMIN_PASSPHRASE){ showPanel(); loadProductsAdmin(); } else { alert('Incorrect passphrase'); }
}
async function loadProductsAdmin(){
  const res = await fetch(PRODUCTS_ENDPOINT);
  const products = await res.json();
  const container = document.getElementById('products-admin');
  container.innerHTML='';
  products.forEach(p=>{
    const form = document.createElement('form'); form.className='card';
    form.innerHTML = `
      <h3>${p.sku} — ${p.name}</h3>
      <label>Name <input name="name" value="${p.name}"/></label>
      <label>Price <input name="price" value="${p.price}"/></label>
      <label>Image URL <input name="image" value="${p.image}"/></label>
      <label>Description <textarea name="description">${p.description||''}</textarea></label>
      <label>Trial URL <input name="trial_url" value="${p.trial_url||''}"/></label>
      <input type="hidden" name="sku" value="${p.sku}"/>
      <button>Save</button>`;
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(UPDATE_PRODUCT_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
      alert(res.ok?'Saved':'Failed');
    });
    container.appendChild(form);
  });
}
async function addGallery(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  const res = await fetch(ADD_GALLERY_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
  alert(res.ok?'Added':'Failed');
}
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('gallery-form').addEventListener('submit', addGallery);
});
