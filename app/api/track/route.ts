import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const visitorId = body.visitorId;
    const path = body.path || '/';

    if (!visitorId) {
      return NextResponse.json({ ok: false, error: 'visitorId is required' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      null;

    const userAgent = req.headers.get('user-agent') || null;

    const { data: existing } = await supabaseAdmin
      .from('visits')
      .select('id')
      .eq('visitor_id', visitorId)
      .eq('visit_date', today)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from('visits')
        .update({
          last_seen: new Date().toISOString(),
          path,
          ip,
          user_agent: userAgent
        })
        .eq('id', existing.id);

      return NextResponse.json({ ok: true, counted: false, active: true });
    }

    const { error } = await supabaseAdmin.from('visits').insert({
      visitor_id: visitorId,
      visit_date: today,
      last_seen: new Date().toISOString(),
      path,
      ip,
      user_agent: userAgent
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, counted: true, active: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}