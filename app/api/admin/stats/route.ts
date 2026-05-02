import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');

    if (!auth || auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const onlineThreshold = new Date(now.getTime() - 60 * 1000).toISOString(); // آخر دقيقة = أونلاين

    // ===== LIVE SESSIONS =====
    const { data: liveSessionsData } = await supabaseAdmin
      .from('visitor_sessions')
      .select('*')
      .gte('last_seen', onlineThreshold)
      .order('last_seen', { ascending: false })
      .limit(100);

    const liveSessions = liveSessionsData || [];

    // ===== ONLINE NOW =====
    const onlineNow = liveSessions.length;

    // ===== TRYING TO DONATE NOW =====
    const tryingToDonateNow = liveSessions.filter(s =>
      s.checkout_status === 'amount_selected' ||
      s.checkout_status === 'checkout_started'
    ).length;

    // ===== TODAY STATS =====
    const { data: todaySessions } = await supabaseAdmin
      .from('visitor_sessions')
      .select('checkout_status, visitor_id')
      .gte('first_seen', todayStart.toISOString());

    const todayVisitorsSet = new Set<string>();
    let startedCheckoutToday = 0;
    let completedCheckoutToday = 0;
    let abandonedCheckoutToday = 0;

    (todaySessions || []).forEach(s => {
      if (s.visitor_id) {
        todayVisitorsSet.add(s.visitor_id);
      }

      if (s.checkout_status === 'checkout_started') {
        startedCheckoutToday++;
      }

      if (s.checkout_status === 'checkout_completed') {
        completedCheckoutToday++;
      }

      if (
        s.checkout_status === 'checkout_failed' ||
        s.checkout_status === 'checkout_cancelled'
      ) {
        abandonedCheckoutToday++;
      }
    });

    const todayVisitors = todayVisitorsSet.size;

    return NextResponse.json({
      onlineNow,
      tryingToDonateNow,
      todayVisitors,
      startedCheckoutToday,
      completedCheckoutToday,
      abandonedCheckoutToday,
      liveSessions
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Stats error' },
      { status: 500 }
    );
  }
}