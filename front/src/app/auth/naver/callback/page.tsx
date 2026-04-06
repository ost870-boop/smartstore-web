"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

function NaverCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setStatus('error');
      setErrorMsg('인증 코드가 없습니다.');
      return;
    }

    fetch('/api/oauth/naver/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          Cookies.set('token', data.token, { expires: 7 });
          Cookies.set('role', data.role, { expires: 7 });
          window.location.href = data.role === 'ADMIN' ? '/admin' : '/';
        } else {
          setStatus('error');
          setErrorMsg(data.error || '네이버 로그인 실패');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('서버 연결 실패');
      });
  }, [searchParams]);

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-10">
        <p className="text-red-500 font-bold text-lg mb-4">네이버 로그인 실패</p>
        <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
        <a href="/login" className="text-blue-600 underline font-bold">로그인 페이지로 돌아가기</a>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600 font-bold">네이버 로그인 처리 중...</p>
    </div>
  );
}

export default function NaverCallbackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">로딩중...</div>}>
      <NaverCallbackContent />
    </Suspense>
  );
}
