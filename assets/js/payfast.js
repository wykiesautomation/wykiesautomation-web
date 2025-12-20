(function(){
  let submitting = false;
  function currentMode(){
    const params = new URLSearchParams(window.location.search);
    return params.get('sandbox') === '1' ? 'sandbox' : 'live';
  }
  async function signServerSideIfAvailable(fields){
    // Optional server-side signer (enable if you deploy /.netlify/functions/create-payment)
    // try{
    //   const res = await fetch('/.netlify/functions/create-payment', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(fields) });
    //   if(res.ok) return await res.json();
    // }catch(e){}
    return fields;
  }
  window.payWithPayFast = async function({ amount, itemName, itemDescription='', paymentId, mode }){
    if(submitting) return; submitting = true; setTimeout(()=>submitting=false, 4000);
    const effectiveMode = mode || currentMode();
    const host = effectiveMode==='sandbox' ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    const merchant_id  = (effectiveMode==='sandbox') ? '10000100' : '32913011';
    const merchant_key = (effectiveMode==='sandbox') ? '46f0cd694581a' : '8wd7iwcgippud';
    const fields = {
      merchant_id, merchant_key,
      return_url: window.location.origin + '/success.html',
      cancel_url: window.location.origin + '/cancel.html',
      notify_url: window.location.origin + '/.netlify/functions/payfast-notify',
      m_payment_id: paymentId,
      amount: Number(amount).toFixed(2),
      item_name: itemName,
      item_description: itemDescription
    };
    const payload = await signServerSideIfAvailable(fields);
    const f = document.createElement('form'); f.method='post'; f.action=`https://${host}/eng/process`;
    Object.entries(payload).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!==''){ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v; f.appendChild(i);} });
    document.body.appendChild(f); f.submit();
  }
})();
