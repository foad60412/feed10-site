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
  const [error, setError] = useState('');

  // نخزن المبلغ بدون إعادة render
  const amountRef = useRef(amount);
  amountRef.current = amount;

  useEffect(() => {
    let cancelled = false;

    const renderButtons = () => {
      if (cancelled || !window.paypal || !containerRef.current) return;

      // 🔴 مهم: لا نعيد render إذا تم إنشاؤه مسبقًا
      if (paypalRef.current) return;

      setError('');

      paypalRef.current = window.paypal.Buttons({
        createOrder: async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amountRef.current // ✅ نستخدم ref بدل state
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
            alert(msg);
            return;
          }

          alert('تم التبرع بنجاح ❤️');
          window.location.reload();
        },

        onError: (err: any) => {
          console.error(err);
          setError('حدث خطأ في PayPal. تحقق من الإعدادات.');
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
  }, []); // ✅ فقط مرة واحدة

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-2xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} />
    </div>
  );
}