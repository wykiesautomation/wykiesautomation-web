(function(){
  const mode = 'live';
  document.querySelectorAll('.buy-btn[data-product-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const itemName  = btn.dataset.itemName;
      const amount    = parseFloat(btn.dataset.amount);
      payWithPayFast({ amount, itemName, paymentId: productId, mode });
    });
  });
})();
