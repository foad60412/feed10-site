import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

function getDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) return 'iPhone / iPad';
  if (/android/.test(ua)) return 'Android';
  if (/macintosh|mac os/.test(ua)) return 'Mac';
  if (/windows/.test(ua)) return 'Windows';
  return 'Other';
}

function getBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  return 'Other';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const visitorId = body.visitorId;
    const sessionId = body.sessionId;
    const path = body.path || '/';

    if (!visitorId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing visitorId or sessionId' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || '';

    const country =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      null;

    const city =
      req.headers.get('x-vercel-ip-city') ||
      null;

    const device = getDevice(userAgent);
    const browser = getBrowser(userAgent);

    const { data: existing } = await supabaseAdmin
      .from('visitor_sessions')
      .select('id, first_seen')
      .eq('session_id', sessionId)
      .maybeSingle();

    const now = new Date();

    if (existing) {
      const firstSeen = new Date(existing.first_seen);
      const durationSeconds = Math.max(
        0,
        Math.floor((now.getTime() - firstSeen.getTime()) / 1000)
      );

      const { error } = await supabaseAdmin
        .from('visitor_sessions')
        .update({
          visitor_id: visitorId,
          path,
          country,
          city,
          device,
          browser,
          user_agent: userAgent,
          status: 'online',
          last_seen: now.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('session_id', sessionId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin
        .from('visitor_sessions')
        .insert({
          visitor_id: visitorId,
          session_id: sessionId,
          path,
          country,
          city,
          device,
          browser,
          user_agent: userAgent,
          status: 'online',
          last_seen: now.toISOString()
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Session tracking error' },
      { status: 500 }
    );
  }
}