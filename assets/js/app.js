
function openWhatsApp(sku){
  const msg = encodeURIComponent('Hi Wykies Automation, I am interested in ' + sku + ' from your website.');
  window.open('https://wa.me/27716816131?text=' + msg, '_blank');
}
