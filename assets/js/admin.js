(function(){
  const PASS = 'Ford@20132016'; // NOTE: In production, authenticate server-side only.
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.addEventListener('click', async ()=>{
    const pass = document.getElementById('pass').value;
    const msg = document.getElementById('msg');
    if(pass!==PASS){ msg.textContent='Incorrect passphrase'; return; }
    document.getElementById('login').style.display='none';
    document.getElementById('panel').style.display='block';
    const list = await fetchProducts();
    const wrap = document.getElementById('adminProducts');
    wrap.innerHTML='';
    for(const p of list){
      const el = document.createElement('div');
      el.className='card';
      el.innerHTML = `
        <div class='content'>
          <h3>${p.sku} — ${p.name}</h3>
          <label>Price <input type='number' step='0.01' value='${p.price}'/></label>
          <label>Image URL <input type='text' value='${p.imageUrl}'/></label>
          <label>Trial URL <input type='text' value='${p.trialUrl||''}'/></label>
          <label>Docs URL <input type='text' value='${p.docUrl||''}'/></label>
          <div style='margin-top:8px'>
            <button class='btn secondary' disabled>Save (connect API)</button>
          </div>
        </div>`;
      wrap.appendChild(el);
    }
  });
})();