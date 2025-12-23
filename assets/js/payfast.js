
// payfast.js — create hosted payment form post
async function buyNow(sku, amount, itemName){
  const cfg = await waLoadConfig();
  toast('Redirecting to PayFast…');
  // capture optional email for invoice
  let email = prompt('Enter your email for the invoice and download (optional):','');
  const orderId = 'WA-' + Date.now();
  // store for success page
  localStorage.setItem('wa_last_order', JSON.stringify({orderId, sku, amount, email}));

  const endpoint = cfg.payfast.env==='live' ? 'https://www.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process';
  const f = document.createElement('form');
  f.method = 'POST'; f.action = endpoint;
  const fields = {
    merchant_id: cfg.payfast.merchant_id,
    merchant_key: cfg.payfast.merchant_key,
    amount: Number(amount).toFixed(2),
    item_name: itemName,
    item_description: sku,
    return_url: cfg.payfast.return_url,
    cancel_url: cfg.payfast.cancel_url,
    notify_url: cfg.payfast.notify_url,
    m_payment_id: orderId,
    email_address: email||''
  };
  for(const [k,v] of Object.entries(fields)){
    const i = document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; f.appendChild(i);
  }
  document.body.appendChild(f);
  f.submit();
}
