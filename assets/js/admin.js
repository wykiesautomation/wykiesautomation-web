
const Admin = {
  async login(){
    const pass = qs('#passphrase').value.trim();
    const res = await API.post('adminLogin', { passphrase: pass });
    if(res.ok){ qs('#loginPanel').style.display='none'; qs('#editor').style.display='block'; this.loadAll(); }
    else { qs('#loginStatus').textContent = res.message || 'Access denied'; }
  },
  async loadAll(){
    const products = await API.get('products');
    const cont = qs('#productsEditor');
    cont.innerHTML = products.items.map(p=>{
      return `
      <div class=card>
        <div class=content>
          <div><span class=badge>${p.sku}</span></div>
          <div class=form>
            <div><label>Name</label><input data-sku="${p.sku}" name="name" value="${p.name||''}"/></div>
            <div><label>Price</label><input data-sku="${p.sku}" name="price" type=number step=0.01 value="${p.price}"/></div>
            <div class=full><label>Summary</label><input data-sku="${p.sku}" name="summary" value="${p.summary||''}"/></div>
            <div class=full><label>Description</label><textarea data-sku="${p.sku}" name="description" rows=4>${p.description||''}</textarea></div>
            <div class=full><label>Image URL</label><input data-sku="${p.sku}" name="imageUrl" value="${p.imageUrl||''}"/></div>
            <div><label>Trial URL</label><input data-sku="${p.sku}" name="trialUrl" value="${p.trialUrl||''}"/></div>
            <div><label>Doc URL</label><input data-sku="${p.sku}" name="docUrl" value="${p.docUrl||''}"/></div>
            <div><button onclick="Admin.saveProduct('${p.sku}')">Save</button></div>
          </div>
        </div>
      </div>`;
    }).join('');

    const gallery = await API.get('gallery');
    qs('#galleryList').innerHTML = gallery.items.map(g=>`<img src="${g.url}" alt="${g.caption||''}">`).join('');

    const payments = await API.get('payments');
    qs('#payments').innerHTML = payments.items.map(pm=>{
      return `<div class=card><div class=content>
        <div><span class=badge>${pm.InvoiceNo||pm.OrderID||''}</span></div>
        <div>${pm.Email} • ${Currency.format(pm.TotalInclVAT||0)}</div>
        <div class=kicker>${pm.ReleasedAt?('Released '+pm.ReleasedAt):'Pending'}</div>
        <div><button onclick="Admin.resendInvoice('${pm.InvoiceNo}')">Resend Invoice</button></div>
      </div></div>`;
    }).join('');
  },
  async saveProduct(sku){
    const fields = qsa(`[data-sku='${sku}']`);
    const body = { sku };
    fields.forEach(el=>body[el.getAttribute('name')] = el.value);
    const res = await API.post('updateProduct', body);
    alert(res.message || 'Saved');
  },
  async addGallery(){
    const url = qs('#galleryUrl').value.trim();
    const caption = qs('#galleryCaption').value.trim();
    const res = await API.post('addGallery', { url, caption });
    alert(res.message || 'Added');
    this.loadAll();
  },
  async resendInvoice(inv){
    const res = await API.post('resendInvoice', { invoiceNo: inv });
    alert(res.message || 'Sent');
  }
};
