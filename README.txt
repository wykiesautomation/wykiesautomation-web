WykiesAutomation — Patched Build (Apps Script live)

1) Upload all files to your GitHub repo root.
2) GitHub Pages: Settings → Pages → Source = main /root.
3) config.json already points to your Apps Script /exec and token.
4) index/product/gallery now read from Google Sheets via Apps Script.
5) contact + admin add/update + gallery post to Apps Script (with X-Auth).

Headers expected in Google Sheet (Products tab):
  id | name | summary | price | image

Gallery tab headers (at least):
  url | (optional) title | (optional) sku | (optional) created_at
