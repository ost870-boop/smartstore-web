"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function FailContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="max-w-2xl mx-auto my-20 text-center bg-white p-12 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
         <svg fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">결제에 실패했습니다</h1>
      <p className="text-gray-600 mb-2 text-lg">{message}</p>
      <p className="text-gray-400 mb-10 text-sm bg-gray-50 px-4 py-2 rounded-lg inline-block">에러 코드: <span className="font-mono">{code}</span></p>
      <div>
        <Link href="/cart" className="bg-gray-900 px-10 py-5 text-white font-bold rounded-2xl text-lg hover:bg-black transition shadow-sm w-full md:w-auto inline-block">
          장바구니로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩중...</div>}>
      <FailContent />
    </Suspense>
  );
}
