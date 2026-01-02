
const API = 'https://wykiesautomation.co.za/api';

// Load products
if(document.querySelector('#products')){
  fetch(`${API}/products`).then(r=>r.json()).then(data=>{
    const container=document.querySelector('#products');
    if(data.ok){
      data.data.forEach(p=>{
        const card=document.createElement('div');
        card.className='card';
        card.innerHTML=`<h3>${p.name}</h3><p>Price: R ${p.price}</p>`;
        container.appendChild(card);
      });
    }else{
      container.textContent='Failed to load products';
    }
  });
}

// Load price log
if(document.querySelector('#priceLog')){
  fetch(`${API}/price-changes`).then(r=>r.json()).then(data=>{
    const container=document.querySelector('#priceLog');
    if(data.ok){
      data.data.forEach(log=>{
        const item=document.createElement('div');
        item.textContent=`${log.when}: ${log.product_id} changed from R${log.old} to R${log.new}`;
        container.appendChild(item);
      });
    }else{
      container.textContent='Failed to load price log';
    }
  });
}

// Contact form
if(document.querySelector('#contactForm')){
  document.querySelector('#contactForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const formData=new FormData(e.target);
    const payload={};
    formData.forEach((v,k)=>payload[k]=v);
    try{
      // WhatsApp Cloud API integration (simplified)
      const waUrl=`https://wa.me/27716816131?text=${encodeURIComponent('Name:'+payload.name+' Email:'+payload.email+' Message:'+payload.message)}`;
      window.open(waUrl,'_blank');
      // Fallback: send to /api/contact
      await fetch(`${API}/contact`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      alert('Message sent!');
    }catch(err){alert('Error sending message');}
  });
}
