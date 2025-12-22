document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    const items = await res.json();

    const params = new URLSearchParams(location.search);
    const code = params.get('code') || params.get('sku') || (items[0] && items[0].sku);
    const p = items.find(x => x.sku === code) || items[0];
    if (!p) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('code',  p.sku);
    set('name',  p.name);
    set('price', p.price);

    const ph = document.getElementById('imgph');
    if (ph && p.image) {
      const img = new Image(); img.className = 'gallery-item'; img.alt = p.name; img.src = p.image; ph.replaceWith(img);
    }

    const pfAmount   = document.getElementById('pf_amount');
    const pfItemName = document.getElementById('pf_item_name');
    if (pfAmount)   pfAmount.value = Number(p.amount).toFixed(2);
    if (pfItemName) pfItemName.value = p.name;

    // For Sandbox testing, uncomment:
    // document.getElementById('pf').action = 'https://sandbox.payfast.co.za/eng/process';
  } catch (err) {
    console.error('Failed to load products.json', err);
  }
});
