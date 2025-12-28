
(function(){
  const KEY='wa_theme';
  function apply(theme){ const r=document.documentElement; r.dataset.theme=theme; localStorage.setItem(KEY,theme); const btn=document.getElementById('waThemeBtn'); if(btn) btn.textContent='Theme: '+theme; }
  function cycle(){ const cur=localStorage.getItem(KEY)||'system'; const next={system:'dark',dark:'light',light:'system'}[cur]||'system'; apply(next); }
  document.addEventListener('DOMContentLoaded',()=>{ const saved=localStorage.getItem(KEY)||'system'; apply(saved); const btn=document.getElementById('waThemeBtn'); if(btn) btn.addEventListener('click', cycle); });
  window.WATheme = { apply, cycle };
})();
