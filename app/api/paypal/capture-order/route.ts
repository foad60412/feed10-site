import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const PAYPAL_API =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error_description || 'Failed to get PayPal access token');
  }

  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderID = body.orderID;
    const donorName = body.donorName || null;
    const showName = Boolean(body.showName);

    if (!orderID) {
      return NextResponse.json(
        { error: 'Missing PayPal order ID' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to capture PayPal payment' },
        { status: 500 }
      );
    }

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const amount = Number(capture?.amount?.value || 0);
    const currency = capture?.amount?.currency_code || 'USD';
    const paypalCaptureId = capture?.id;
    const status = capture?.status === 'COMPLETED' ? 'completed' : 'pending';

    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('status', 'active')
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: 'No active campaign found' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin.from('donations').insert({
      campaign_id: campaign.id,
      donor_name: donorName,
      show_name: showName,
      amount_usd: amount,
      currency,
      status,
      paypal_order_id: orderID,
      paypal_capture_id: paypalCaptureId
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      status,
      amount,
      currency
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'PayPal capture error' },
      { status: 500 }
    );
  }
}