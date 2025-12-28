# Wykies Automation — Public Site

This bundle is ready for **GitHub Pages** deployment.

## Structure
- `index.html`, `gallery.html`, `product.html`
- `legal/privacy.html`, `legal/terms.html`, `legal/refunds.html`
- `assets/logo-blue.png`, `assets/img/wa-01.png/.webp`, `wa-02`, `wa-03`
- `docs/WA-01.pdf`, `WA-02.pdf`, `WA-03.pdf`
- `styles.css`, `app.js`, `.nojekyll`

## Deployment (GitHub Pages)
1. Create a repo (e.g. `wykiesautomation-site`).
2. Upload these files to the root of the `main` branch.
3. In **Settings → Pages**, set **Source** to `Deploy from a branch`, Branch = `main` / root.
4. (Optional) Add `CNAME` with `wykiesautomation.co.za` to enable the custom domain.
5. Update DNS for the apex domain to GitHub Pages IPs (A records): 185.199.108.153 / .109.153 / .110.153 / .111.153 — see GitHub docs.

## CMS and Data
- `app.js` pulls Products and Settings from the Google Sheet ID you provided and falls back to local samples.

## Notes
- Replace placeholder docs and images when ready.
- Update `legal/privacy.html` with the Information Officer details.
