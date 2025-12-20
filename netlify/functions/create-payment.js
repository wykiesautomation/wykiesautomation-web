const crypto = require('crypto');
const PF_PASSPHRASE = process.env.PF_PASSPHRASE || '';
function md5(s){ return crypto.createHash('md5').update(s,'utf8').digest('hex'); }
function sign(data){
  const keys = Object.keys(data).filter(k=>k!=='signature' && data[k]!=='' && data[k]!==null && data[k]!==undefined).sort((a,b)=>a.localeCompare(b));
  let s = keys.map(k=>`${k}=${encodeURIComponent(String(data[k])).replace(/%20/g,'+')}`).join('&');
  if(PF_PASSPHRASE){ s += `&passphrase=${encodeURIComponent(PF_PASSPHRASE).replace(/%20/g,'+')}`; }
  return md5(s);
}
exports.handler = async (event)=>{
  if(event.httpMethod!=='POST') return { statusCode:405, body:'Method Not Allowed' };
  const payload = JSON.parse(event.body||'{}');
  const signature = sign(payload);
  return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...payload, signature }) };
};
