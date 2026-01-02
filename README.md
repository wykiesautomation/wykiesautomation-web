
# Wykies Automation — Public Site

## Pages
- Home (index.html): Brand-blue hero, CTAs (Docs, WhatsApp, Download Trial)
- Products (products.html): VAT-inclusive prices
- Price Log (price-log.html): Reads from /api
- Documents (documents.html): Downloads
- Contact (contact.html): WhatsApp Cloud API integration + email fallback

## Deployment
1. Push to GitHub repo.
2. Enable GitHub Pages → set custom domain `wykiesautomation.co.za`.
3. Cloudflare DNS: A/AAAA apex → GitHub Pages IP; CNAME www → username.github.io.
4. SSL/TLS: Full (Strict); enable HSTS.
5. Worker routes `/api*` to Apps Script Web App.

## SEO & Analytics
- sitemap.xml + robots.txt included.
- JSON-LD structured data in index.html.
- Google Analytics snippet in index.html.

## Accessibility
- Alt text, keyboard nav, contrast AA+.

## Performance
- Lazy loading images, CSS optimized.
