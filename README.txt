# Public Site CTAs Patch (v2: folder links)

Using the same Google Drive **folder** for all products for now. You can swap to per-product files later.

Trials folder: https://drive.google.com/drive/folders/1s1K3xz57PqELaX9q2UIlH0eepArA-4aa?usp=sharing
Docs folder:   https://drive.google.com/drive/folders/1DyWdZZqZAQdJFZp98ZGATOQTCf-4gvwY?usp=sharing
Apps Script URL: https://script.google.com/macros/s/AKfycbwHuhjZ7YP7XMfJVrPlaBimM8dOweFtb6dCOe8QUOZlYAllepuSuJU7F52kzd20eMJZgQ/exec

Files to add to your site:
- /assets/css/modal.css
- /assets/js/contactModal.js
- /products/WA-01.html
- /products/WA-02.html
- /products/WA-03.html

Update Home product cards with buttons:

```html
<a class="btn outline" href="https://drive.google.com/drive/folders/1s1K3xz57PqELaX9q2UIlH0eepArA-4aa?usp=sharing" target="_blank">Download Trial</a>
<a class="btn outline" href="https://drive.google.com/drive/folders/1DyWdZZqZAQdJFZp98ZGATOQTCf-4gvwY?usp=sharing" target="_blank">View Documents</a>
<a class="btn primary" href="/products/WA-01.html">Buy</a>
<a class="btn" href="mailto:wykiesautomation@gmail.com?subject=WA-01%20Enquiry">Contact</a>
<button class="btn outline" data-open="contactModal" data-sku="WA-01">Leave Info</button>
```

(Repeat for WA-02 / WA-03 with their product page links.)

Next (security): move PayFast signing to your admin proxy and remove `passphrase` from the client pages.
