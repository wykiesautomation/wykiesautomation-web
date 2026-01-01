// Load config
let CONFIG = {};
fetch('config.json').then(r=>r.json()).then(cfg=>{ CONFIG = cfg; init(); }).catch(()=>{ console.warn('No config'); CONFIG={}; init(); });

async function apiGet(path){ const url = CONFIG.appsScriptAPI + path; const r = await fetch(url, {headers:{'Accept':'application/json'}}); if(!r.ok) throw new Error('GET failed'); return r.json(); }
async function apiPost(path, data){ const url = CONFIG.appsScriptAPI + path; const r = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}); if(!r.ok) throw new Error(await r.text()); return r.json(); }

function setCmsStatus(text){ const el = document.getElementById('cmsStatus'); if(el) el.textContent = text; }

// Markdown (safe subset)
function md(m){ if(!m) return ''; let h = m
  .replace(/^### (.*$)/gim, '<h4>$1</h4>')
  .replace(/^## (.*$)/gim, '<h3>$1</h3>')
  .replace(/^# (.*$)/gim, '<h2>$1</h2>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1<\/a>')
  .replace(/\n\n/g, '</p><p>');
  return '<p>'+h+'</p>';
}

// Catalog
const PRODUCTS_FALLBACK = [
  {id:'WA-01', name:'Hybrid Gate Opener (ESP32)', price:1499, image:'assets/gallery/wa-01.png'},
  {id:'WA-03', name:'16-Ch ESP32 Alarm (Standalone)', price:6499, image:'assets/gallery/wa-03.png'},
  {id:'WA-11', name:'GSM Alarm Add-On (Panic & RF)', price:5499, image:'assets/gallery/wa-11.png'}
];
let PRODUCTS = PRODUCTS_FALLBACK;

async function refreshCatalog(){
  try{
    const items = await apiGet('?action=catalog');
    if(Array.isArray(items) && items.length){ PRODUCTS = items; setCmsStatus('CMS: Live'); }
    else { setCmsStatus('CMS: Fallback'); }
  }catch(e){ setCmsStatus('CMS: Fallback'); }
  renderCatalog(); populateContactDropdown();
}

function renderCatalog(){
  const grid = document.getElementById('productGrid'); if(!grid) return; grid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const price = Number(p.price||0).toLocaleString();
    const img = (p.images && p.images[0]) || p.image || 'assets/gallery/wa-01.png';
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <img src="${img}" alt="${p.name||p.id}">
      <div class="body">
        <strong>${p.id} — ${p.name||''}</strong>
        <div class="price">R ${price}</div>
        <div class="row">
          <label>Contact via
            <select data-id="${p.id}" class="pathSelect">
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <button class="btn" onclick="contactFor('${p.id}')">Go</button>
          <button class="btn secondary" onclick="viewDetails('${p.id}')">View Details</button>
          <button class="btn" onclick="checkoutProduct('${p.id}')">Checkout (PayFast)</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function populateContactDropdown(){
  const productSelect = document.getElementById('contactProduct'); if(!productSelect) return; productSelect.innerHTML = '';
  PRODUCTS.forEach(p=>{ const opt = document.createElement('option'); opt.value=p.id; opt.textContent=`${p.id} — ${p.name}`; productSelect.appendChild(opt); });
}

function priceOf(id){ const p = PRODUCTS.find(x=>x.id===id); return p? p.price : ''; }
function contactFor(id){ const sel = document.querySelector(`.pathSelect[data-id='${id}']`); const path = sel? sel.value : 'email'; openPath(path, id); }
function startContact(){ const id = document.getElementById('contactProduct').value; const path = document.getElementById('contactPath').value; openPath(path, id); }
function openPath(path, id){ const price = priceOf(id); const msg = encodeURIComponent(`Hi Wykies Automation, I’m interested in ${id}. Price noted: R ${price}.`);
  if(path==='email'){ const subject = encodeURIComponent(`[${id}] Product enquiry`); const body = msg + encodeURIComponent('\n\nMy name:'); window.location = `mailto:${CONFIG.supportEmail}?subject=${subject}&body=${body}`; }
  else { window.open(`https://wa.me/${CONFIG.whatsappIntl}?text=${msg}`, '_blank'); }
}
function viewDetails(id){ alert('Details for '+id+' coming soon'); }

// PayFast checkout (server-side signing)
async function checkoutProduct(id){ try{ const r = await apiPost('?action=checkout', {product:id, qty:1}); if(r && r.url){ window.open(r.url, '_blank'); } else { alert('Checkout failed: no URL'); } } catch(e){ alert('Checkout error: '+e.message); } }

// Documents
const DOCS = [ {label:'WA‑01 Manual (PDF)', file:'WA-01-Manual.pdf'}, {label:'WA‑03 Specification (PDF)', file:'WA-03-Spec.pdf'}, {label:'Price List (PDF)', file:'Price-List.pdf'} ];
function renderDocs(){ const list = document.getElementById('docList'); if(!list) return; list.innerHTML = '';
  DOCS.forEach(d=>{ const row=document.createElement('div'); row.className='doc-item'; row.innerHTML = `<span>${d.label}</span><div class='doc-actions'><button class='btn secondary' onclick="previewDoc('${d.file}')">Preview</button><button class='btn' onclick="downloadDoc('${d.file}')">Download</button></div>`; list.appendChild(row); });
  const tip=document.createElement('p'); tip.className='note'; tip.textContent='Independent preview/download — no single selection lock.'; list.appendChild(tip);
}
function previewDoc(file){ const f=document.getElementById('docFrame'); if(f) f.src = `docs/${file}`; }
function downloadDoc(file){ const a=document.createElement('a'); a.href=`docs/${file}`; a.download=file; a.click(); }

// Gallery
async function loadGallery(){ try{ const rows = await apiGet('?action=gallery'); const grid = document.getElementById('galleryGrid'); grid.innerHTML=''; (rows||[]).sort((a,b)=>(a.order||0)-(b.order||0)).forEach(r=>{ const src = r.url || `assets/gallery/${r.filename}`; const fig = document.createElement('figure'); fig.className='thumb'; fig.innerHTML = `<img src='${src}' alt='${r.caption||r.filename}' loading='lazy'><figcaption>${r.caption||''}</figcaption>`; fig.onclick=()=>openLightbox(src, r.caption||''); grid.appendChild(fig); }); setCmsStatus('CMS: Live'); } catch(e){ setCmsStatus('CMS: Fallback (Gallery)'); fallbackGallery(); } }
function fallbackGallery(){ const grid=document.getElementById('galleryGrid'); ['wa-01.png','wa-03.png','wa-11.png'].forEach((fn,i)=>{ const cap=['Hybrid Gate Opener','ESP32 Alarm','GSM Alarm Add-On'][i]; const src=`assets/gallery/${fn}`; const fig=document.createElement('figure'); fig.className='thumb'; fig.innerHTML = `<img src='${src}' alt='${cap}' loading='lazy'><figcaption>${cap}</figcaption>`; fig.onclick=()=>openLightbox(src, cap); grid.appendChild(fig); }); }
function openLightbox(src, caption){ document.getElementById('lightboxImg').src=src; document.getElementById('lightboxCap').textContent=caption; document.getElementById('lightbox').classList.add('open'); }

// Legal
const LEGAL_SLUGS = ['privacy','terms','refunds','cookies','paia'];
async function loadLegal(){ try{ const pages = await apiGet('?action=pages'); const bySlug = Object.fromEntries((pages||[]).map(p=>[p.slug,p])); const grid=document.getElementById('legalGrid'); const links=document.getElementById('legalLinks'); grid.innerHTML=''; links.innerHTML=''; LEGAL_SLUGS.forEach(sl=>{ const p = bySlug[sl]; if(!p) return; const div=document.createElement('div'); div.className='legal-card'; div.innerHTML = `<h3 id='${sl}'>${p.title||sl}</h3>` + md(p.content||''); grid.appendChild(div); const a=document.createElement('a'); a.href=`#${sl}`; a.textContent=p.title||sl; links.appendChild(a); }); setCmsStatus('CMS: Live'); } catch(e){ setCmsStatus('CMS: Fallback (Legal)'); }
}

function init(){ renderCatalog(); renderDocs(); loadGallery(); loadLegal(); }
