
// Simple helper: warn if merchant credentials are not set
for (const form of document.querySelectorAll('.pf-form')) {
  const mid = form.querySelector('input[name="merchant_id"]').value;
  const mkey = form.querySelector('input[name="merchant_key"]').value;
  form.addEventListener('submit', (e) => {
    if (mid === 'YOUR_MERCHANT_ID' || mkey === 'YOUR_MERCHANT_KEY') {
      e.preventDefault();
      alert('Please set your PayFast merchant_id and merchant_key before going live.');
    }
  });
}

// Optional: add sandbox toggle by changing action URL
const url = new URL(window.location.href);
if (url.searchParams.get('sandbox') === '1') {
  document.querySelectorAll('.pf-form').forEach(f => f.action = 'https://sandbox.payfast.co.za/eng/process');
}
