"use client";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method');
  const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
  const isBank = method === 'bank';
  const methodLabel = method === 'card' ? '카드결제' : method === 'easy' ? '간편결제' : method === 'bank' ? '무통장입금' : '결제';

  return (
    <div className="max-w-2xl mx-auto my-12 md:my-20 text-center bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-4 md:mx-auto">
      <div className={`w-20 h-20 md:w-24 md:h-24 ${isBank ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'} rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8`}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-10 h-10 md:w-12 md:h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
        {isBank ? '주문이 접수되었습니다!' : '주문이 완료되었습니다!'}
      </h1>
      <p className="text-gray-500 text-base md:text-lg mb-2">주문해 주셔서 감사합니다.</p>
      <p className="text-gray-400 text-sm mb-8">
        {isBank ? '아래 계좌로 입금 확인 후 출고 처리됩니다.' : '담당자 확인 후 빠르게 출고 처리해 드리겠습니다.'}
      </p>

      <div className="bg-gray-50 rounded-2xl p-5 md:p-6 mb-8 text-left space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">주문번호</span>
          <span className="font-mono font-bold text-gray-900 text-xs md:text-sm">{orderId || '-'}</span>
        </div>
        {amount && (
          <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
            <span className="text-gray-500 font-medium">결제금액</span>
            <span className="font-bold text-blue-600 text-base md:text-lg">{Number(amount).toLocaleString()}원</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
          <span className="text-gray-500 font-medium">결제수단</span>
          <span className="text-gray-700 font-medium">{methodLabel}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
          <span className="text-gray-500 font-medium">주문상태</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isBank ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {isBank ? '입금대기' : '결제완료'}
          </span>
        </div>
        {isBank && (
          <div className="border-t border-gray-200 pt-3 text-left">
            <p className="text-xs text-gray-500 font-medium mb-1">입금 계좌</p>
            <p className="text-sm font-bold text-gray-900">기업은행 123-456789-01-011 (채움수도상사)</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {token && (
          <Link
            href="/mypage"
            className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-xl text-base hover:bg-black transition text-center"
          >
            주문내역 보기
          </Link>
        )}
        <Link
          href="/"
          className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl text-base hover:bg-blue-700 transition shadow-sm text-center"
        >
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">주문 정보 확인중...</div>}>
      <OrderCompleteContent />
    </Suspense>
  );
}
