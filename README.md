
# Wykies Automation — v2 Full: UI polish + Gallery + Contact + Admin live + Images

This build completes:
- Modern responsive UI styling
- Dynamic gallery from Google Sheet (via Netlify proxy)
- Contact form emails (+ WhatsApp click-to-chat)
- Admin live sync via Apps Script (through Netlify proxy)
- Product images wiring
- (Retains PayFast checkout + ITN + invoice emails from previous build)

## Endpoints
- Read CMS: `/.netlify/functions/cms-read?type=products|gallery`
- Write CMS: `/.netlify/functions/cms-write` (POST: {type:'products'|'gallery'|'contact', ...})
- PayFast: `/.netlify/functions/create-payment` and `/.netlify/functions/payfast-notify`

## Env Vars
See `netlify.toml` comments. Set them on both Public & Admin sites.
