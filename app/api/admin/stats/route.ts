import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    requireAdmin(req);
  } catch (e) {
    return e as Response;
  }

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

  return NextResponse.json({
    todayVisitors: todayVisitors || 0,
    onlineNow: onlineNow || 0
  });
}