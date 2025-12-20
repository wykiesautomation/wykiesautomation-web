// PayFast client helper — LIVE by default
function payWithPayFast({ amount, itemName, paymentId, mode = 'live' }) {
  const host = mode === 'live' ? 'www.payfast.co.za' : 'sandbox.payfast.co.za';

  // LIVE credentials provided by user
  const merchant_id  = (mode === 'sandbox') ? '10000100' : '32913011';
  const merchant_key = (mode === 'sandbox') ? '46f0cd694581a' : '8wd7iwcgippud';

  if (mode === 'live' && (!merchant_id || !merchant_key)) {
    alert('Live PayFast merchant_id/merchant_key missing.');
    return;
  }

  const f = document.createElement('form');
  f.method = 'post';
  f.action = `https://${host}/eng/process`;

  const fields = {
    merchant_id, merchant_key,
    return_url: window.location.origin + '/success.html',
    cancel_url:  window.location.origin + '/cancel.html',
    notify_url:  window.location.origin + '/.netlify/functions/payfast-notify',
    m_payment_id: paymentId,
    amount: Number(amount).toFixed(2),
    item_name: itemName
  };

  Object.entries(fields).forEach(([k,v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    f.appendChild(input);
  });

  document.body.appendChild(f);
  f.submit();
}
