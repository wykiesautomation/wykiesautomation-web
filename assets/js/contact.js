const WHATSAPP_E164 = '27716816131';
async function fillProductDropdown() {
  const select = document.getElementById('product') || document.getElementById('productSelect');
  if (!select) return;
  try {
    const res = await fetch('products.json', { cache: 'no-store' });
    const products = await res.json();
    products.forEach(p => { const opt = document.createElement('option'); opt.value = p.sku; opt.textContent = `${p.sku} — ${p.name}`; select.appendChild(opt); });
  } catch (e) { console.warn('Could not load products.json to populate select', e); }
}
function buildWaUrl(data) {
  const msg = `Hi Wykies Automation,%0A%0A`+
              `Name: ${encodeURIComponent(data.name||'')}%0A`+
              `Email: ${encodeURIComponent(data.email||'')}%0A`+
              `Phone: ${encodeURIComponent(data.phone||'')}%0A`+
              `Product: ${encodeURIComponent(data.product||'N/A')}%0A%0A`+
              `${encodeURIComponent(data.message||'')}`;
  return `https://wa.me/${WHATSAPP_E164}?text=${msg}`;
}
function wireContactForm() {
  const form = document.getElementById('contactForm') || document.querySelector('form');
  const waLink = document.getElementById('whatsappLink') || document.querySelector('a[href^="https://wa.me/"]');
  if (!form || !waLink) return;
  const updateWa = () => { const data = Object.fromEntries(new FormData(form).entries()); waLink.href = buildWaUrl(data); };
  form.addEventListener('input', updateWa);
  updateWa();
}
document.addEventListener('DOMContentLoaded', () => { fillProductDropdown(); wireContactForm(); });
