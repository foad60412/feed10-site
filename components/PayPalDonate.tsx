'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PayPalDonate({ amount }: { amount: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paypalRef = useRef<any>(null);
  const amountRef = useRef(amount);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState<number | null>(null);

  amountRef.current = amount;

  useEffect(() => {
    let cancelled = false;

    const renderButtons = () => {
      if (cancelled || !window.paypal || !containerRef.current) return;
      if (paypalRef.current) return;

      setError('');

      paypalRef.current = window.paypal.Buttons({
        createOrder: async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amountRef.current
            })
          });

          const data = await res.json();

          if (!res.ok || !data.id) {
            const msg = data.error || 'Failed to create PayPal order';
            setError(msg);
            throw new Error(msg);
          }

          return data.id;
        },

        onApprove: async (data: any) => {
          const donorName = localStorage.getItem('donorName') || '';
          const showName = localStorage.getItem('showName') === 'true';

          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderID: data.orderID,
              donorName: donorName.trim() || null,
              showName: showName && donorName.trim().length > 0
            })
          });

          const result = await res.json();

          if (!res.ok) {
            const msg = result.error || 'فشل تأكيد الدفع';
            setError(msg);
            return;
          }

          setSuccessAmount(Number(result.amount || amountRef.current));
          setSuccess(true);

          setTimeout(() => {
            window.location.reload();
          }, 3500);
        },

        onCancel: () => {
          setError('');
        },

        onError: (err: any) => {
          console.error(err);
          setError('حدث خطأ في PayPal. حاول مرة أخرى أو استخدم بطاقة أخرى.');
        }
      });

      paypalRef.current.render(containerRef.current);
    };

    if (window.paypal) {
      renderButtons();
    } else {
      const existing = document.getElementById('paypal-sdk');

      if (existing) {
        existing.addEventListener('load', renderButtons);
      } else {
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = renderButtons;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {success && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] bg-white shadow-2xl">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-emerald-200/60 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-teal-200/60 blur-3xl" />

            <div className="relative p-7 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 shadow-inner">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-3xl text-white">
                  ✓
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-black text-slate-950">
                تم التبرع بنجاح
              </h2>

              <p className="mt-3 text-lg font-bold text-emerald-800">
                شكرًا لدعمك ❤️
              </p>

              <p className="mx-auto mt-4 max-w-sm leading-7 text-slate-600">
                مساهمتك ستساعدنا في توفير سلة غذائية لعائلة محتاجة داخل فلسطين.
              </p>

              {successAmount !== null && (
                <div className="mt-6 rounded-3xl bg-emerald-50 p-5">
                  <p className="text-sm font-black text-emerald-700">
                    مبلغ التبرع
                  </p>
                  <p className="mt-1 text-4xl font-black text-emerald-950">
                    ${successAmount.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-700" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-500">
                يتم تحديث الحملة الآن...
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-2xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} />
    </div>
  );
}