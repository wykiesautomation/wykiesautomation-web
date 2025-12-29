
(async () => {
  const cfg = await (await fetch('../core/config.json')).json();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const base = cfg.cms.apps_script_base;
  const productsUrl = `${base}?route=products`;
  const notifyUrl = cfg.domains.public + cfg.payfast.notify_url;
  const res = await fetch(productsUrl);
  const products = await res.json();
  const p = products.find(x => String(x.id) === String(id)) || products[0];
  document.getElementById('summary').innerHTML = `
    <h3>${p.name}</h3>
    <p class="price">R${Number(p.price).toLocaleString()}</p>
  `;

  // Populate PayFast form (Worker verifies amount server-side)
  document.getElementById('merchant_id').value = cfg.payfast.merchant_id;
  document.getElementById('item_name').value = p.name;
  document.getElementById('amount').value = Number(p.price).toFixed(2);
  document.getElementById('return_url').value = cfg.domains.public + '/thankyou.html';
  document.getElementById('cancel_url').value = cfg.domains.public + '/cancelled.html';
  document.getElementById('notify_url').value = cfg.domains.public + cfg.payfast.notify_url;
  document.getElementById('custom_str1').value = JSON.stringify({ id: p.id, promo: '' });

  const promoInput = document.getElementById('promo');
  promoInput.addEventListener('change', async () => {
    const resp = await fetch(base, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ route:'validatePromo', code: promoInput.value }) });
    const data = await resp.json();
    document.getElementById('custom_str1').value = JSON.stringify({ id: p.id, promo: promoInput.value });
    // Visible message could be added here based on data.valid
    console.log('Promo validation', data);
  });
})();
