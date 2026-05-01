import { NextResponse } from 'next/server';

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
    const amount = Number(body.amount);

    if (!amount || amount < 1 || amount > 500) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: 'Donation - Feed 10 Families in Palestine',
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2)
            }
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to create PayPal order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'PayPal create order error' },
      { status: 500 }
    );
  }
}