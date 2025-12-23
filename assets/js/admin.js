
function showToast(text, type){
  const el = document.getElementById('toast');
  const span = document.getElementById('toastText');
  if(!el) return;
  span.textContent = text || '';
  el.className = "toast " + (type||'');
  el.style.display = "block";
  // force reflow then add .show
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ el.classList.remove('show'); }, 2500);
}

const Admin = (() => {
  const cfg = { apiBase: localStorage.getItem('wa_api_base') || '<<APPS_SCRIPT_WEB_APP_URL>>' };
  let token = '';
  async function api(path, body){ const res = await fetch(cfg.apiBase + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, ...body })}); if(!res.ok) throw new Error('API '+res.status); return await res.json(); }
  function rowInput(v){ const i=document.createElement('input'); i.value=v||''; return i; }
  function rowCheck(v){ const i=document.createElement('input'); i.type='checkbox'; i.checked=!!v; return i; }
  async function login(){ token=document.getElementById('passphrase').value.trim(); try{ await api('/auth',{}); document.getElementById('login').style.display='none'; document.getElementById('panel').style.display='block'; refresh(); }catch(e){ document.getElementById('loginStatus').textContent='Login failed'; } }
  async function refresh(){ const data = await api('/load',{});
    const tbody=document.getElementById('prodRows'); tbody.innerHTML='';
    data.products.forEach(p=>{ const tr=document.createElement('tr');
      const iSku=rowInput(p.sku), iName=rowInput(p.name), iPrice=rowInput(p.price), iSum=rowInput(p.summary), iImg=rowInput(p.imageUrl), iTrial=rowInput(p.trialUrl||''), iDoc=rowInput(p.docUrl||''), iAct=rowCheck(p.active!==false);
      const tds=[iSku,iName,iPrice,iSum,iImg,iTrial,iDoc,iAct].map(el=>{ const td=document.createElement('td'); td.append(el); return td; });
      const tdBtn=document.createElement('td'); const save=document.createElement('button'); save.className='btn small'; save.textContent='Save'; save.onclick=async()=>{ await api('/saveProduct',{ product:{ sku:iSku.value, name:iName.value, price:iPrice.value, summary:iSum.value, imageUrl:iImg.value, trialUrl:iTrial.value, docUrl:iDoc.value, active:iAct.checked } }); showToast('Saved ✔','success'); };
      const del=document.createElement('button'); del.className='btn small danger'; del.textContent='Delete'; del.onclick=async()=>{ await api('/deleteProduct',{ sku:p.sku }); refresh(); };
      tdBtn.append(save,del); const row=document.createElement('tr'); [ ...tds, tdBtn ].forEach(td=>tr.append(td)); tbody.append(tr);
    });
    const gBody=document.getElementById('galRows'); gBody.innerHTML='';
    data.gallery.forEach(g=>{ const iUrl=rowInput(g.url), iCap=rowInput(g.caption||''); const tdBtn=document.createElement('td'); const s=document.createElement('button'); s.className='btn small'; s.textContent='Save'; s.onclick=async()=>{ await api('/saveGallery',{ entry:{ url:iUrl.value, caption:iCap.value } }); showToast('Saved ✔','success'); }; const d=document.createElement('button'); d.className='btn small danger'; d.textContent='Delete'; d.onclick=async()=>{ await api('/deleteGallery',{ url:g.url }); refresh(); }; const tr=document.createElement('tr'); const tdU=document.createElement('td'); tdU.append(iUrl); const tdC=document.createElement('td'); tdC.append(iCap); tdBtn.append(s,d); tr.append(tdU,tdC,tdBtn); gBody.append(tr); });
    const pBody=document.getElementById('payRows'); pBody.innerHTML=''; (data.payments||[]).forEach(pm=>{ const tr=document.createElement('tr'); [pm.Timestamp,pm.InvoiceNo,pm.OrderID,pm.Email,pm.SKU,pm.TotalInclVAT,pm.ReleasedAt].forEach(c=>{ const td=document.createElement('td'); td.textContent=c||''; tr.append(td); }); const tdBtn=document.createElement('td'); const resend=document.createElement('button'); resend.className='btn small'; resend.textContent='Resend Invoice'; resend.onclick=async()=>{ try{ const r = await api('/resendInvoice', { invoiceNo: pm.InvoiceNo }); if(r && r.ok){ showToast('Invoice resent ✔','success'); } else { showToast('Resend failed','error'); } } catch(e){ showToast('Resend failed','error'); } }; tdBtn.append(resend); tr.append(tdBtn); pBody.append(tr); });
  }
  async function addProduct(){ await api('/saveProduct',{ product:{ sku:'', name:'', price:'', summary:'', imageUrl:'', trialUrl:'', docUrl:'', active:true } }); refresh(); }
  async function addGallery(){ await api('/saveGallery',{ entry:{ url:'', caption:'' } }); refresh(); }
  return { login, refresh, addProduct, addGallery };
})();
