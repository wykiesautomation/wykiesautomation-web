
const CONFIG = {};
(async function loadConfig(){
  const res = await fetch('config.json');
  Object.assign(CONFIG, await res.json());
})();

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

const API = {
  async get(endpoint, params={}){
    const url = new URL(CONFIG.appsScriptUrl);
    url.searchParams.set('endpoint', endpoint);
    for(const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString());
    return res.json();
  },
  async post(endpoint, body={}){
    const url = new URL(CONFIG.appsScriptUrl);
    url.searchParams.set('endpoint', endpoint);
    const res = await fetch(url.toString(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return res.json();
  }
};

const Currency = new Intl.NumberFormat('en-ZA', { style:'currency', currency:'ZAR' });

const EmailForm = {
  open(){ qs('#emailModal').style.display = 'flex'; },
  openWithSku(){ this.open(); const sku = new URL(location.href).searchParams.get('sku'); this.populateSkuList(sku); },
  close(){ qs('#emailModal').style.display = 'none'; },
  async populateSkuList(selected){
    const { items } = await API.get('products');
    const sel = qs('#emailSku');
    sel.innerHTML = items.map(p=>`<option value="${p.sku}" ${selected===p.sku?'selected':''}>${p.sku} — ${p.name}</option>`).join('');
  },
  async submit(ev){
    ev.preventDefault();
    const fd = new FormData(ev.target); const data = Object.fromEntries(fd.entries());
    const resp = await API.post('contact', data);
    alert(resp.message || 'Sent');
    this.close();
  }
};
