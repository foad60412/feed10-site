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

    const onlineThreshold = new Date(now.getTime() - 60 * 1000).toISOString();
    const tryingThreshold = new Date(now.getTime() - 60 * 1000).toISOString();
    const abandonedThreshold = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    const { data: liveSessionsData } = await supabaseAdmin
      .from('visitor_sessions')
      .select('*')
      .gte('last_seen', onlineThreshold)
      .order('last_seen', { ascending: false })
      .limit(100);

    const liveSessions = liveSessionsData || [];

    const onlineNow = liveSessions.length;

    const tryingToDonateNow = liveSessions.filter(s =>
      s.checkout_status === 'checkout_started' &&
      s.started_checkout_at &&
      s.started_checkout_at >= tryingThreshold
    ).length;

    const { data: todaySessions } = await supabaseAdmin
      .from('visitor_sessions')
      .select('checkout_status, visitor_id, started_checkout_at, completed_checkout_at')
      .gte('first_seen', todayStart.toISOString());

    const todayVisitorsSet = new Set<string>();
    let startedCheckoutToday = 0;
    let completedCheckoutToday = 0;
    let abandonedCheckoutToday = 0;

    (todaySessions || []).forEach(s => {
      if (s.visitor_id) todayVisitorsSet.add(s.visitor_id);

      if (s.started_checkout_at) {
        startedCheckoutToday++;
      }

      if (s.completed_checkout_at || s.checkout_status === 'checkout_completed') {
        completedCheckoutToday++;
      }

      const startedLongAgo =
        s.started_checkout_at && s.started_checkout_at < abandonedThreshold;

      const notCompleted =
        !s.completed_checkout_at && s.checkout_status !== 'checkout_completed';

      if (startedLongAgo && notCompleted) {
        abandonedCheckoutToday++;
      }
    });

    const formattedLiveSessions = liveSessions.map(s => {
      const startedLongAgo =
        s.started_checkout_at && s.started_checkout_at < abandonedThreshold;

      const notCompleted =
        !s.completed_checkout_at && s.checkout_status !== 'checkout_completed';

      let liveStatus = s.checkout_status || 'none';

      if (startedLongAgo && notCompleted) {
        liveStatus = 'abandoned_checkout';
      }

      return {
        ...s,
        checkout_status: liveStatus
      };
    });

    return NextResponse.json({
      onlineNow,
      tryingToDonateNow,
      todayVisitors: todayVisitorsSet.size,
      startedCheckoutToday,
      completedCheckoutToday,
      abandonedCheckoutToday,
      liveSessions: formattedLiveSessions
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Stats error' },
      { status: 500 }
    );
  }
}