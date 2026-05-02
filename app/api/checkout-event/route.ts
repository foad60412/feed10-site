import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const eventType = body.eventType;
    const visitorId = body.visitorId || null;
    const sessionId = body.sessionId || null;
    const amountUsd = body.amountUsd ? Number(body.amountUsd) : null;
    const orderId = body.orderId || null;

    if (!eventType) {
      return NextResponse.json(
        { error: 'Missing eventType' },
        { status: 400 }
      );
    }

    await supabaseAdmin.from('checkout_events').insert({
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
      amount_usd: amountUsd,
      order_id: orderId
    });

    if (sessionId) {
      const updateData: any = {
        checkout_status: eventType,
        last_seen: new Date().toISOString()
      };

      if (amountUsd !== null) {
        updateData.selected_amount_usd = amountUsd;
      }

      if (eventType === 'checkout_started') {
        updateData.started_checkout_at = new Date().toISOString();
      }

      if (eventType === 'checkout_completed') {
        updateData.completed_checkout_at = new Date().toISOString();
      }

      await supabaseAdmin
        .from('visitor_sessions')
        .update(updateData)
        .eq('session_id', sessionId);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Checkout event error' },
      { status: 500 }
    );
  }
}