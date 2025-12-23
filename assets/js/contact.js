(async () => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  const { api } = await window.__ensureApi();
  // Load products for dropdown
  try{
    const products = await api.get('products');
    const sel = form.querySelector('select[name=product]');
    products.forEach(p=>{
      const opt = document.createElement('option');
      opt.value = p.sku; opt.textContent = p.name; sel.appendChild(opt);
    });
  }catch{}

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = 'Sending…';
    try{
      await api.post('contact/send', data);
      status.textContent = 'Thanks! We'll get back to you shortly.';
      form.reset();
    }catch(err){ status.textContent = 'Failed: '+err.message; }
  });
})();
