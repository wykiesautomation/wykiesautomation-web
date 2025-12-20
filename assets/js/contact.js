(function(){
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYED_WEB_APP_ID/exec'; // TODO: set
  function setStatus(msg, type=''){ statusEl.textContent = msg; statusEl.className = `status ${type}`; }
  function isoNow(){ return new Date().toISOString().split('.')[0]; }
  form.querySelector('input[name="page_url"]').value = window.location.href;
  form.querySelector('input[name="timestamp"]').value = isoNow();
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name')||'').trim();
    const email = String(fd.get('email')||'').trim();
    const message = String(fd.get('message')||'').trim();
    const product = String(fd.get('product')||'').trim();
    if(!name || !email || !message || !product){ setStatus('Please complete Name, Email, Product, and Message.', 'error'); return; }
    submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; setStatus('Sending your message…');
    fd.set('timestamp', isoNow());
    fd.set('subject', `${product} enquiry`);
    try{
      const res = await fetch(APPS_SCRIPT_URL, { method:'POST', body: fd });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if(json && json.ok){ setStatus('Thanks! Your message was sent. Check your email for a confirmation.', 'success'); form.reset(); }
      else { throw new Error(json?.error || 'Failed to send (server)'); }
    }catch(err){
      setStatus('Network error. Attempting fallback…', 'error');
      form.removeEventListener('submit', arguments.callee);
      submitBtn.disabled = false; submitBtn.textContent = 'Send Message';
      form.submit(); // Netlify Forms fallback
      return;
    }
    submitBtn.disabled = false; submitBtn.textContent = 'Send Message';
  }, { passive:false });
})();
