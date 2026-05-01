export function requireAdmin(req: Request) {
  const header = req.headers.get('authorization') || '';
  const token = header.replace('Bearer ', '').trim();
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
}
