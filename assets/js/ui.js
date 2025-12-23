
export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }
export function snackbar(msg){
  let el = document.getElementById('snackbar');
  if(!el){ el = document.createElement('div'); el.id='snackbar'; el.className='snackbar'; document.body.appendChild(el); }
  el.textContent = msg; el.style.display='block';
  setTimeout(()=>{ el.style.display='none'; }, 2500);
}
export function money(v){ return 'R' + Number(v).toFixed(2); }
export const store = {
  set(key,obj){ localStorage.setItem(key, JSON.stringify(obj)); },
  get(key){ try{ return JSON.parse(localStorage.getItem(key)||'null'); }catch(e){ return null; } },
  del(key){ localStorage.removeItem(key); }
};
