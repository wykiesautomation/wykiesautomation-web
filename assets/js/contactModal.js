
(() => {
  const modal   = document.getElementById('contactModal');
  const form    = document.getElementById('contactForm');
  const cfSku   = document.getElementById('cfSku');
  const cfName  = document.getElementById('cfName');
  const cfEmail = document.getElementById('cfEmail');
  const cfPhone = document.getElementById('cfPhone');
  const cfMsg   = document.getElementById('cfMsg');
  const btnWA   = document.getElementById('cfWhatsApp');

  document.querySelectorAll('[data-open="contactModal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      cfSku.value = btn.getAttribute('data-sku') || '';
      modal.classList.remove('hidden');
      cfName.focus();
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => { el.addEventListener('click', () => modal.classList.add('hidden')); });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

  // WhatsApp quick contact
  btnWA.addEventListener('click', (e) => {
    e.preventDefault();
    const lines = [
      `Hi Wykies Automation,`,
      ``,
      `I'm interested in ${cfSku.value || 'your products'}.`,
      ``,
      `Message:`,
      `${(cfMsg.value || '').trim()}`,
      ``,
      `Name: ${cfName.value || ''}`,
      `Email: ${cfEmail.value || ''}`,
      `Phone: ${cfPhone.value || ''}`
    ];
    const text = encodeURIComponent(lines.join('\n'));
    const waUrl = `https://wa.me/27716816131?text=${text}`;
    window.open(waUrl, '_blank', 'noopener');
  });

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHuhjZ7YP7XMfJVrPlaBimM8dOweFtb6dCOe8QUOZlYAllepuSuJU7F52kzd20eMJZgQ/exec';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      sku: (cfSku.value || '').trim(),
      name: (cfName.value || '').trim(),
      email: (cfEmail.value || '').trim(),
      phone: (cfPhone.value || '').trim(),
      message: (cfMsg.value || '').trim(),
      source: 'public-site',
      site: location.origin
    };
    try {
      const res = await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed');
      alert('Thanks! We\u2019ve received your message and emailed you a confirmation.');
      form.reset();
      modal.classList.add('hidden');
    } catch (err) {
      console.error(err);
      alert('Sorry, there was a problem. Please email wykiesautomation@gmail.com or use WhatsApp.');
    }
  });
})();
