(function(){
  const mode = 'live'; // add ?sandbox=1 on URL to switch in payfast.js
  document.querySelectorAll('.buy-btn[data-product-id]').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      const productId = btn.dataset.productId;
      const itemName  = btn.dataset.itemName || btn.textContent.trim();
      const amount    = parseFloat(btn.dataset.amount);
      const card = btn.closest('.card');
      const itemDescription = card?.querySelector('.desc')?.textContent?.trim() || '';
      payWithPayFast({ amount, itemName, itemDescription, paymentId: productId, mode });
    }, { passive:true });
  });
})();
