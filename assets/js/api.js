(function(){
  async function getConfig(){
    const res = await fetch('/config.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Missing config.json');
    const cfg = await res.json();
    if(!cfg.appsScriptUrl) throw new Error('appsScriptUrl not set');
    return cfg;
  }
  async function ensureApi(){
    if(window.__api) return window.__apiReady;
    const ready = (async()=>{
      const cfg = await getConfig();
      const base = cfg.appsScriptUrl.replace(/\/$/,'');
      const token = localStorage.getItem('wa_admin_token') || '';
      async function send(method, route, data, opts={}){
        const url = `${base}?route=${encodeURIComponent(route)}`;
        const headers = {'Content-Type':'application/json'};
        if(token) headers['X-Auth']=token;
        const res = await fetch(url, {method, headers, body: data?JSON.stringify(data):undefined});
        if(!res.ok){
          const t = await res.text();
          throw new Error(`${res.status} ${t}`);
        }
        const ct = res.headers.get('content-type')||'';
        if(ct.includes('application/json')) return res.json();
        return res.text();
      }
      return {
        base,
        token,
        setToken:(t)=>{localStorage.setItem('wa_admin_token', t);},
        clearToken:()=>{localStorage.removeItem('wa_admin_token');},
        get:(route)=>send('GET', route),
        post:(route,data)=>send('POST', route, data),
      };
    })();
    window.__api = true;
    window.__ensureApi = () => ready;
    return ready;
  }
  window.__ensureApi = ensureApi;
})();
