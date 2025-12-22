
export default async (req, context) => {
  try{
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'products';
    const apps = process.env.APPS_SCRIPT_URL;
    const r = await fetch(`${apps}?type=${encodeURIComponent(type)}`);
    const data = await r.json();
    return Response.json(data, {status: r.ok? 200 : 502});
  }catch(err){ return Response.json({error:err.message},{status:500}); }
}
