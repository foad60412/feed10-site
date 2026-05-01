import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await res.json();
  return data.access_token;
}

async function verifyWebhook(req: NextRequest, body: any) {
  const accessToken = await getAccessToken();

  const res = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      cert_url: req.headers.get('paypal-cert-url'),
      auth_algo: req.headers.get('paypal-auth-algo'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body
    })
  });

  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const isValid = await verifyWebhook(req, body);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  const eventType = body.event_type;

  // 🎯 أهم حدث
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const capture = body.resource;

    const amount = capture.amount.value;
    const orderID = capture.supplementary_data?.related_ids?.order_id;

    // هنا تحفظ في قاعدة البيانات
    console.log('✅ Payment completed:', amount, orderID);

    // مثال (عدّل حسب مشروعك):
    /*
    await supabase.from('donations').insert({
      amount: Number(amount),
      order_id: orderID,
      status: 'completed'
    });
    */
  }

  return NextResponse.json({ received: true });
}