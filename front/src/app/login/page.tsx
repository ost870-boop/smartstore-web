"use client";
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      Cookies.set('token', data.token, { expires: 1 });
      Cookies.set('role', data.role, { expires: 1 });
      
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      window.location.href = redirect;
    } catch (e: any) {
      alert('로그인 실패: ' + (e.response?.data?.message || '이메일과 비밀번호를 다시 확인해주세요.'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 mb-32 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">로그인</h1>
        <p className="text-gray-500 mt-2">채움수도상사에 오신 것을 환영합니다</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 계정</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
            placeholder="admin@chaeumsudo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white" 
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-0.5">
          로그인
        </button>
      </form>

      <div className="mt-10 text-center text-sm text-gray-500 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
        <p className="font-bold text-gray-800 mb-4 text-base">테스트 계정안내 (Seed DB)</p>
        <div className="bg-white p-3 rounded-xl mb-3 border shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-1">관리자 권한</span>
          <p><span className="text-gray-900 font-mono font-medium">admin@chaeumsudo.com</span> / admin123</p>
        </div>
        <div className="bg-white p-3 rounded-xl border shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded mb-1">일반 구매자</span>
          <p><span className="text-gray-900 font-mono font-medium">user@chaeumsudo.com</span> / user123</p>
        </div>
      </div>
    </div>
  );
}
