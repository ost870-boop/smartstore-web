"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      return;
    }

    const confirmPayment = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch('/api/orders/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });
        if (!res.ok) throw new Error();
        setStatus('success');
        clearCart();
      } catch {
        setStatus('error');
      }
    };
    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart]);

  if (status === 'loading') return <div className="text-center py-20 text-xl font-bold text-blue-600">결제를 확인중입니다...</div>;
  if (status === 'error') return <div className="text-center py-20 text-red-500 text-xl font-bold">결제 승인 과정에서 문제가 발생했습니다. 관리자에게 문의하세요.</div>;

  return (
    <div className="max-w-2xl mx-auto my-20 text-center bg-white p-12 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">결제가 성공적으로<br/>완료되었습니다!</h1>
      <p className="text-gray-500 mb-10 text-lg bg-gray-50 py-3 px-6 rounded-xl inline-block">주문번호: <span className="font-mono">{orderId}</span></p>
      <div>
        <Link href="/" className="bg-blue-600 px-10 py-5 text-white font-bold rounded-2xl text-lg hover:bg-blue-700 transition shadow-sm w-full md:w-auto inline-block">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩중...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
