
// In buildProductCard(p)
- <div style="position:relative">
+ <div class="image-wrap">
    ${p.imageUrl||
    <span class="price-badge">${formatRand(p.price)}</span>
  </div>
