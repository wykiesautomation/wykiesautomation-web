(async function(){
  const gallery = document.getElementById('gallery');
  const products = await fetchProducts();
  for(const p of products){
    const card = document.createElement('figure');
    card.className='card';
    card.innerHTML = `<img src='${p.imageUrl}' alt='${p.name}'><figcaption class='content'><strong>${p.sku}</strong> — ${p.name}</figcaption>`;
    gallery.appendChild(card);
  }
})();