
// Wykies Automation — Public JS
document.addEventListener('DOMContentLoaded',()=>{
  const wa = [
    {sku:'WA-01', name:'3D Printer Control V1', price:'R1,499', img:'wa-01.png'},
    {sku:'WA-02', name:'Plasma Cutter Control V1', price:'R2,499', img:'wa-02.png'},
    {sku:'WA-03', name:'ECU/TCU Control System V1', price:'R6,499', img:'wa-03.png'},
    {sku:'WA-07', name:'Hybrid Gate Controller V1', price:'R1,800', img:'wa-07.png'},
    {sku:'WA-10', name:'12CH Hybrid Alarm V1', price:'R1,299', img:'wa-10.png'},
    {sku:'WA-12', name:'TCU Gearbox Controller V1', price:'R4,500', img:'wa-12.png'}
  ];
  const grid = document.querySelector('#grid');
  if(grid){
    grid.innerHTML = wa.map(p=>`<article class=card>
      <img src="assets/img/${p.img}" alt="${p.name}">
      <div class=pad>
        <div class=price>${p.price}</div>
        <h3>${p.name}</h3>
        <p>SKU: ${p.sku}</p>
        <a class="btn" href="product.html?sku=${p.sku}">View Details</a>
      </div>
    </article>`).join('');
  }
});
