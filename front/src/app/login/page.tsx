"use client";
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const showError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { showError('이메일을 입력해주세요.'); return; }
    if (!password) { showError('비밀번호를 입력해주세요.'); return; }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        if (res.status === 401 || data.message?.includes('Invalid') || data.message?.includes('credentials')) {
          showError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (res.status === 404) {
          showError('로그인 서버 경로를 찾을 수 없습니다. (404)');
        } else {
          showError(data.message || '로그인에 실패했습니다.');
        }
        return;
      }

      // 성공 - 쿠키 저장
      Cookies.set('token', data.token, { expires: 1 });
      Cookies.set('role', data.role, { expires: 1 });

      // 리다이렉트
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || (data.role === 'ADMIN' ? '/admin' : '/');
      window.location.href = redirect;
    } catch {
      setIsLoading(false);
      showError('현재 로그인 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const hasError = error.length > 0;
  const isServerError = error.includes('서버');

  return (
    <div className="max-w-md mx-auto mt-20 mb-32 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">로그인</h1>
        <p className="text-gray-500 mt-2">채움수도상사에 오신 것을 환영합니다</p>
      </div>

      <form onSubmit={handleLogin} className={`flex flex-col gap-5 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 계정</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition bg-gray-50 focus:bg-white ${hasError && !isServerError ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            placeholder="admin@chaeum.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition bg-gray-50 focus:bg-white ${hasError && !isServerError ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
          />
        </div>

        {/* 에러 메시지 */}
        {hasError && (
          <div className={`rounded-xl px-4 py-3 flex items-start gap-3 ${isServerError ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
            <span className={`text-xl leading-none ${isServerError ? 'text-amber-500' : 'text-red-500'}`}>&#9888;</span>
            <div>
              <p className={`text-sm font-bold ${isServerError ? 'text-amber-700' : 'text-red-600'}`}>{error}</p>
              <p className={`text-xs mt-1 ${isServerError ? 'text-amber-500' : 'text-red-400'}`}>
                {isServerError ? '네트워크 상태를 확인해주세요.' : '이메일과 비밀번호를 다시 확인해주세요.'}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-wait transition shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <div className="text-center mt-4 text-sm text-gray-500">
          아직 회원이 아니신가요? <a href="/signup" className="text-blue-600 font-bold underline">회원가입</a>
        </div>
      </form>

      {/* 테스트 계정 안내 */}
      <div className="mt-10 text-center text-sm bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
        <p className="font-bold text-gray-800 mb-4 text-base">테스트 계정</p>
        <button
          type="button"
          onClick={() => { setEmail('admin@chaeum.com'); setPassword('admin123'); setError(''); }}
          className="w-full bg-white p-3 rounded-xl mb-3 border shadow-sm text-left hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
        >
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">관리자</span>
          <p className="text-sm mt-1"><span className="font-mono font-medium text-gray-900">admin@chaeum.com</span> <span className="text-gray-400">/ admin123</span></p>
        </button>
        <button
          type="button"
          onClick={() => { setEmail('user@test.com'); setPassword('admin123'); setError(''); }}
          className="w-full bg-white p-3 rounded-xl border shadow-sm text-left hover:border-green-300 hover:bg-green-50/50 transition-colors cursor-pointer"
        >
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">구매자</span>
          <p className="text-sm mt-1"><span className="font-mono font-medium text-gray-900">user@test.com</span> <span className="text-gray-400">/ admin123</span></p>
        </button>
      </div>

      {/* SNS 간편 로그인 */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-[11px] text-gray-400 font-bold mb-4 tracking-tight">SNS 간편 로그인</p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/oauth/naver');
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else setError(data.error || '네이버 로그인 설정이 필요합니다.');
              } catch { setError('네이버 로그인 서버에 연결할 수 없습니다.'); }
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#03c75a] text-white font-bold py-3.5 rounded-xl hover:bg-[#02b350] transition-colors"
          >
            <span className="text-xl font-black">N</span> 네이버 로그인
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/oauth/kakao');
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else setError(data.error || '카카오 로그인 설정이 필요합니다.');
              } catch { setError('카카오 로그인 서버에 연결할 수 없습니다.'); }
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#fee500] text-[#3c1e1e] font-bold py-3.5 rounded-xl hover:bg-[#fdd800] transition-colors"
          >
            <span className="text-lg">K</span> 카카오 로그인
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3">OAuth 키가 설정되면 실제 간편 로그인이 동작합니다.</p>
      </div>
    </div>
  );
}
