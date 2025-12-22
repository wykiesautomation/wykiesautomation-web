
// server/payfast-itn.js
// Generic Express-based PayFast ITN handler (no Netlify). Run on any Node.js host.
// Usage: node server.js (with Express). Ensure your server exposes POST /payfast/itn
// and points PayFast notify_url to https://your-domain/payfast/itn

import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.urlencoded({ extended: true })); // PayFast posts x-www-form-urlencoded

// Config via env vars
const { PAYFAST_PASSPHRASE = '', SHEET_API_URL = '' } = process.env;

function genSignature(params){
  const entries = Object.keys(params)
    .filter(k => k !== 'signature' && params[k] !== '')
    .sort()
    .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g,'+')}`);
  const str = entries.join('&') + (PAYFAST_PASSPHRASE ? `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE).replace(/%20/g,'+')}` : '');
  return crypto.createHash('md5').update(str).digest('hex');
}

app.post('/payfast/itn', async (req, res) => {
  try {
    const data = req.body || {};
    const expected = genSignature(data);
    if(String(data.signature).toLowerCase() !== expected){
      return res.status(400).json({ status:'invalid_signature' });
    }
    // TODO: verify PayFast source IP and amount vs your SKU price.

    // Notify Apps Script to send emails + PDF invoice
    if(SHEET_API_URL){
      await fetch(`${SHEET_API_URL}/itn`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itn:data }) });
    }
    res.json({ status:'ok' });
  } catch (e){
    console.error(e);
    res.status(500).json({ error:'server_error' });
  }
});

export default app;
