
const PASS = 'Ford@20132016';
let LOCAL = [];

async function login(){
  const pw = document.getElementById('pass').value;
  if (pw === PASS){
    document.getElementById('panel').style.display='block';
    const r = await fetch('/.netlify/functions/cms-read?type=products');
    const data = r.ok ? (await r.json()).products : (await (await fetch('/data/products.json')).json());
    LOCAL = data;
    renderProducts();
    await pullGallery();
  } else { alert('Incorrect passphrase'); }
}

function renderProducts(){
  document.getElementById('products').textContent = JSON.stringify(LOCAL, null, 2);
}

async function pullProducts(){
  const r = await fetch('/.netlify/functions/cms-read?type=products');
  if (r.ok){ LOCAL = (await r.json()).products; renderProducts(); }
}

async function pushProducts(){
  const r = await fetch('/.netlify/functions/cms-write',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'products', data:LOCAL})});
  alert(r.ok ? 'Pushed to Google Sheet' : 'Push failed');
}

async function pullGallery(){
  const r = await fetch('/.netlify/functions/cms-read?type=gallery');
  const g = r.ok ? (await r.json()).gallery : [];
  document.getElementById('gallery').textContent = JSON.stringify(g, null, 2);
}

async function addImage(){
  const data = {type:'gallery', url:document.getElementById('imgurl').value, title:document.getElementById('imgtitle').value};
  const r = await fetch('/.netlify/functions/cms-write',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
  alert(r.ok ? 'Added' : 'Failed');
  await pullGallery();
}
