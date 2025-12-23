
// api.js — helper to call Apps Script Web App + load config
const CONFIG_URL = 'config/config.json';
let WA_CFG = null;

async function waLoadConfig(){
  if(WA_CFG) return WA_CFG;
  const res = await fetch(CONFIG_URL+`?t=${Date.now()}`);
  if(!res.ok) throw new Error('Failed to load config.json');
  WA_CFG = await res.json();
  return WA_CFG;
}

function toast(msg, ms=2200){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg; t.style.display='block';
  setTimeout(()=> t.style.display='none', ms);
}

async function waApi(action, payload={}){
  const cfg = await waLoadConfig();
  const url = new URL(cfg.appsScriptUrl);
  if(action) url.searchParams.set('action', action);
  const isGet = ['products','gallery','payments'].includes(action);
  const opts = isGet ? { method:'GET' } : {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({action, ...payload})
  };
  const res = await fetch(url, opts);
  if(!res.ok) throw new Error('Server error');
  return res.json();
}

function currencyZAR(v){ return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(v||0)); }

