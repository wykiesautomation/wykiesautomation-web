
async function fetchProducts(){
  try{ const r = await fetch('/.netlify/functions/cms-read?type=products'); if(r.ok) return (await r.json()).products; }catch(e){}
  const r2 = await fetch('/data/products.json'); return await r2.json();
}

const params = new URLSearchParams(location.search);
const sku = params.get('sku');

async function init(){
  const PRODUCTS = await fetchProducts();
  const p = PRODUCTS.find(x=>x.sku===sku);
  const el = document.getElementById('productDetail');
  if(!p){ el.innerHTML = '<p>Product not found.</p>'; return; }
  el.innerHTML = `
    <div><img src="${p.image}" alt="${p.sku}"></div>
    <div>
      <h2>${p.name}</h2>
      <div class="price" style="margin-bottom:10px">${p.price}</div>
      <p>${p.description||''}</p>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class='btn' onclick='openDialog()'>Buy via PayFast</button>
        <button class='btn ghost' onclick="location.href='index.html'">Back</button>
      </div>
    </div>`;
  document.getElementById('goPayFast').onclick = ()=> createPayment(p);
}

function openDialog(){ document.getElementById('checkoutDialog').style.display='flex'; }
function closeDialog(){ document.getElementById('checkoutDialog').style.display='none'; }

async function createPayment(p){
  const first = document.getElementById('firstName').value || '';
  const last = document.getElementById('lastName').value || '';
  const email = document.getElementById('email').value || '';
  const cell = document.getElementById('cell').value || '';
  try{
    const resp = await fetch('/.netlify/functions/create-payment',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sku: p.sku, name_first:first, name_last:last, email_address:email, cell_number:cell })
    });
    const data = await resp.json();
    if(!resp.ok) throw new Error(data.error || 'Failed to start payment');
    const form = document.createElement('form');
    form.method = 'POST'; form.action = data.action;
    for(const [k,v] of Object.entries(data.fields)){
      const input = document.createElement('input'); input.type='hidden'; input.name=k; input.value=v; form.appendChild(input);
    }
    document.body.appendChild(form); form.submit();
  }catch(err){ alert('Error: '+err.message); }
}

init();
