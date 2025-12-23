(async () => {
  const loginBox = document.getElementById('login-box');
  const adminUI = document.getElementById('admin-ui');
  const passEl = document.getElementById('passphrase');
  const statusEl = document.getElementById('login-status');
  const tableBody = document.querySelector('#products-table tbody');
  const { api } = await window.__ensureApi();
  const token = (await window.__ensureApi()).token;
  async function show(){
    try{
      if(token){
        await api.get('admin/ping');
        loginBox.classList.add('hidden');
        adminUI.classList.remove('hidden');
        await loadProducts();
        return;
      }
    }catch{}
    loginBox.classList.remove('hidden');
    adminUI.classList.add('hidden');
  }
  async function loadProducts(){
    const products = await api.get('products');
    tableBody.innerHTML='';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${p.sku}</code></td>
        <td><input value="${p.name||''}"></td>
        <td><input value="${p.price||''}"></td>
        <td><input value="${p.image||''}"></td>
        <td><input value="${p.trial||''}"></td>
        <td><select><option value="true" ${String(p.enabled)!=='false'?'selected':''}>true</option><option value="false" ${String(p.enabled)==='false'?'selected':''}>false</option></select></td>
        <td><button class='btn'>Save</button></td>`;
      const [nameEl, priceEl, imgEl, trialEl, enSel] = tr.querySelectorAll('input,select');
      tr.querySelector('button').addEventListener('click', async ()=>{
        try{
          await api.post('admin/updateProduct', { sku: p.sku, name: nameEl.value, price: priceEl.value, image: imgEl.value, trial: trialEl.value, enabled: enSel.value });
          alert('Saved');
        }catch(e){ alert('Error: '+e.message); }
      });
      tableBody.appendChild(tr);
    });
  }
  document.getElementById('login-btn').addEventListener('click', async ()=>{
    const pass = passEl.value.trim();
    if(!pass) return;
    try{
      const { token } = await api.post('admin/login', { passphrase: pass });
      (await window.__ensureApi()).setToken(token);
      statusEl.textContent = 'Logged in';
      await show();
    }catch(e){ statusEl.textContent = 'Login failed'; }
  });
  document.getElementById('logout-btn').addEventListener('click', async ()=>{
    (await window.__ensureApi()).clearToken();
    await show();
  });
  document.getElementById('refresh-btn').addEventListener('click', loadProducts);

  // Gallery add
  document.getElementById('g-add').addEventListener('click', async ()=>{
    const url = document.getElementById('g-img-url').value;
    const title = document.getElementById('g-title').value;
    const sku = document.getElementById('g-sku').value;
    const s = document.getElementById('g-status');
    try{
      await api.post('admin/addGallery', { url, title, sku });
      s.textContent = 'Added';
    }catch(e){ s.textContent = 'Error: '+e.message; }
  });

  await show();
})();
