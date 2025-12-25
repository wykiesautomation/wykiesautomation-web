
const CONFIG_URL = 'config.json';
let CONFIG = null;

async function loadConfig() {
  const res = await fetch(CONFIG_URL);
  CONFIG = await res.json();
}

function money(value) {
  return new Intl.NumberFormat('en-ZA', { style:'currency', currency:'ZAR' }).format(Number(value));
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<div>Loading…</div>';
  try {
    const res = await fetch(`${CONFIG.apiBase}?action=products&sheetId=${CONFIG.sheetId}`);
    const data = await res.json();
    grid.innerHTML = '';
    (data.products||[]).forEach(p => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <h3>${p.name}</h3>
        <p class='price'>${money(p.price)} (incl. VAT)</p>
        <p>${p.description||''}</p>
        <button data-id='${p.id}' data-name='${p.name}' data-amount='${p.price}'>Checkout</button>
      `;
      grid.appendChild(div);
    });
    grid.querySelectorAll('button').forEach(btn => btn.addEventListener('click', checkout));
  } catch(err) {
    grid.innerHTML = '<div class="card">Failed to load products.</div>';
    console.error(err);
  }
}

function checkout(e) {
  const btn = e.currentTarget;
  const amount = btn.getAttribute('data-amount');
  const name = btn.getAttribute('data-name');
  const mPaymentId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // Build a PayFast form and submit (no passphrase client-side)
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.payfast.co.za/eng/process';

  const fields = {
    merchant_id: CONFIG.merchantId,
    merchant_key: CONFIG.merchantKey,
    amount: Number(amount).toFixed(2),
    item_name: name,
    return_url: 'https://wykiesautomation.co.za/thank-you.html',
    cancel_url: 'https://wykiesautomation.co.za/cancel.html',
    notify_url: 'https://wykiesautomation.co.za/api/payfast-itn',
    m_payment_id: mPaymentId,
    email_address: ''
  };
  Object.entries(fields).forEach(([k,v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k; input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

async function setupContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.textContent = 'Sending…';
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(`${CONFIG.apiBase}?action=contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      status.textContent = data?.message || 'Sent.';
      form.reset();
    } catch(err) {
      console.error(err);
      status.textContent = 'Failed to send.';
    }
  });
}

(async () => {
  await loadConfig();
  await loadProducts();
  await setupContactForm();
})();
