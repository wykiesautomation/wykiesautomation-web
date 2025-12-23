
import { snackbar, store } from './ui.js';
import { CFG } from './cms.js';

export function generateOrderId(){
  const t = Date.now(); return 'WA-' + t;
}

export function redirectToPayFast({ sku, name, amount, buyerEmail }){
  const orderId = generateOrderId();
  store.set('wa_order', { orderId, sku, amount, buyerEmail });
  snackbar('Redirecting to PayFast…');
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = CFG.payfast.env === 'live' ? 'https://www.payfast.co.za/eng/process' : 'https://sandbox.payfast.co.za/eng/process';
  const payload = {
    merchant_id: CFG.payfast.merchant_id,
    merchant_key: CFG.payfast.merchant_key,
    amount: Number(amount).toFixed(2),
    item_name: name,
    item_description: sku,
    return_url: CFG.payfast.return_url,
    cancel_url: CFG.payfast.cancel_url,
    notify_url: CFG.payfast.notify_url,
    email_address: buyerEmail || '',
    m_payment_id: orderId
  };
  for(const [k,v] of Object.entries(payload)){
    const inp = document.createElement('input'); inp.type='hidden'; inp.name=k; inp.value=v; form.appendChild(inp);
  }
  document.body.appendChild(form);
  form.submit();
}
