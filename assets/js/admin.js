let authed=true; function loadEditor(){}
async function addProduct(){
  const sku=document.getElementById('nSku').value.trim();
  const name=document.getElementById('nName').value.trim();
  const price=document.getElementById('nPrice').value.trim();
  const image=document.getElementById('nImage').value.trim();
  const trial=document.getElementById('nTrial').value.trim();
  const desc=document.getElementById('nDesc').value.trim();
  if(!sku||!name||!price||!image){document.getElementById('addStatus').textContent='Please fill SKU, Name, Price, Image';return}
  try{
    const cfg = await (await fetch('config.json')).json();
    const payload = {kind:'add-product', sku, name, price, image, trial_url:trial, description:desc};
    const res = await fetch(cfg.appsScriptUrl, {method:'POST', headers:{'Content-Type':'application/json','X-Auth':cfg.xAuthToken}, body:JSON.stringify(payload)});
    document.getElementById('addStatus').textContent = res.ok?'Product added':'Add failed';
  }catch(e){document.getElementById('addStatus').textContent='Add failed'}
}
