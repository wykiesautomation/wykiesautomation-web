
export default async (req, context) => {
  try{
    const body = await req.json();
    const apps = process.env.APPS_SCRIPT_URL;
    const r = await fetch(apps,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
    const data = await r.text();
    return new Response(data, {status: r.ok? 200 : 502, headers:{'content-type':'application/json'}});
  }catch(err){ return Response.json({error:err.message},{status:500}); }
}
