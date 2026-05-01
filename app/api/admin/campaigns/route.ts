import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    requireAdmin(req);
  } catch (e) {
    return e as Response;
  }

  const { data: campaigns } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  const { count: visits } = await supabaseAdmin
    .from('visits')
    .select('*', { count: 'exact', head: true });

  const today = new Date().toISOString().slice(0, 10);
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { count: todayVisitors } = await supabaseAdmin
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('visit_date', today);

  const { count: onlineNow } = await supabaseAdmin
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', oneMinuteAgo);

  const { data: donations } = await supabaseAdmin
    .from('donations')
    .select('amount_usd,status');

  const raised = (donations || [])
    .filter(d => d.status === 'completed')
    .reduce((n, d) => n + Number(d.amount_usd || 0), 0);

  return NextResponse.json({
    campaigns: campaigns || [],
    visits: visits || 0,
    todayVisitors: todayVisitors || 0,
    onlineNow: onlineNow || 0,
    totalRaised: raised
  });
}

export async function POST(req: Request) {
  try {
    requireAdmin(req);
  } catch (e) {
    return e as Response;
  }

  const body = await req.json();

  if (body.action === 'resetVisits') {
    await supabaseAdmin
      .from('visits')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    return NextResponse.json({ ok: true });
  }

  if (body.action === 'close' && body.id) {
    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'closed',
        is_active: false
      })
      .eq('id', body.id);

    return NextResponse.json({ ok: true });
  }

  if (body.action === 'activate' && body.id) {
    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'closed',
        is_active: false
      })
      .eq('status', 'active');

    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'active',
        is_active: true
      })
      .eq('id', body.id);

    return NextResponse.json({ ok: true });
  }

  if (body.action === 'create') {
    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'closed',
        is_active: false
      })
      .eq('status', 'active');

    const campaign = {
      title: body.title || 'Feed 10 Families in Palestine',
      slug: `campaign-${Date.now()}`,
      description:
        body.description ||
        'A transparent campaign to provide food baskets to families in need.',
      goal_usd: Number(body.goal_usd || 500),
      families_target: Number(body.families_target || 10),
      basket_min_usd: Number(body.basket_min_usd || 30),
      basket_max_usd: Number(body.basket_max_usd || 40),
      status: 'active',
      is_active: true
    };

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert(campaign)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}
