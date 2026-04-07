"use client";
import { useState, memo } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Check, Building2, User } from 'lucide-react';
import AddressSearch from '@/components/AddressSearch';

type MemberType = 'personal' | 'business';

// Input을 컴포넌트 밖에 정의 → 리렌더 시 포커스 유지
const FormInput = memo(({ label, value, error, type = 'text', placeholder, required = true, onChange }: {
  label: string; value: string; error?: string; type?: string; placeholder?: string; required?: boolean; onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition text-sm bg-gray-50 focus:bg-white ${error ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
));
FormInput.displayName = 'FormInput';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [memberType, setMemberType] = useState<MemberType>('personal');
  const [form, setForm] = useState({
    name: '', email: '', password: '', passwordConfirm: '',
    phone: '', zonecode: '', address: '', addressDetail: '',
    company: '', bizNumber: '', manager: '',
  });
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false, sms: false });
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const pwStrength = (pw: string) => {
    if (pw.length < 8) return { level: 0, text: '8자 이상 입력', color: 'text-gray-400' };
    const has = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(pw)).length;
    if (has <= 2) return { level: 1, text: '약함', color: 'text-red-500' };
    if (has === 3) return { level: 2, text: '보통', color: 'text-amber-500' };
    return { level: 3, text: '강함', color: 'text-green-600' };
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '이름을 입력해주세요.';
    if (!form.email.trim()) e.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '올바른 이메일 형식이 아닙니다.';
    if (!form.password) e.password = '비밀번호를 입력해주세요.';
    else if (form.password.length < 8) e.password = '8자 이상 입력해주세요.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.phone.trim()) e.phone = '연락처를 입력해주세요.';
    if (memberType === 'business') {
      if (!form.company.trim()) e.company = '회사명을 입력해주세요.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!agreements.terms || !agreements.privacy) {
      setErrors({ agree: '필수 약관에 동의해주세요.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: [form.zonecode && `(${form.zonecode})`, form.address, form.addressDetail].filter(Boolean).join(' ') || undefined,
          role: 'USER',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ submit: data.message || '회원가입에 실패했습니다.' });
        setIsLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setErrors({ submit: '서버에 연결할 수 없습니다.' });
      setIsLoading(false);
    }
  };

  // 완료 화면
  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-16 mb-32 text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} strokeWidth={3} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">회원가입 완료!</h1>
        <p className="text-gray-500 mb-2">{form.name}님, 채움수도상사에 오신 것을 환영합니다.</p>
        {memberType === 'business' && (
          <p className="text-sm text-blue-600 font-medium bg-blue-50 rounded-lg px-4 py-2 inline-block mb-6">사업자회원 혜택: 박스 할인가 + 견적서 발급 + 전용 고객센터</p>
        )}
        <Link href="/login" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-sm mt-6">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const pw = pwStrength(form.password);
  const allAgreed = agreements.terms && agreements.privacy && agreements.marketing && agreements.sms;

  // FormInput은 컴포넌트 밖에 정의됨 → 포커스 유지됨

  return (
    <div className="max-w-lg mx-auto mt-8 mb-32 px-4">
      {/* 혜택 배너 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 mb-6 text-center">
        <p className="font-bold text-lg mb-1">채움수도상사 회원가입</p>
        <p className="text-blue-200 text-sm">기업회원 가입 시 박스할인 + 견적서 발급 + 전용 고객센터 혜택</p>
      </div>

      {/* 진행 단계 */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['회원 유형', '정보 입력', '약관 동의'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > i + 1 ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <div className={`w-8 h-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

        {/* Step 1: 회원 유형 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">회원 유형을 선택해주세요</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setMemberType('personal')}
                className={`border-2 rounded-xl p-6 text-center transition-all ${memberType === 'personal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <User size={32} className={`mx-auto mb-3 ${memberType === 'personal' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`font-bold ${memberType === 'personal' ? 'text-blue-600' : 'text-gray-700'}`}>개인회원</p>
                <p className="text-[10px] text-gray-400 mt-1">일반 소비자/개인 구매</p>
              </button>
              <button onClick={() => setMemberType('business')}
                className={`border-2 rounded-xl p-6 text-center transition-all ${memberType === 'business' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Building2 size={32} className={`mx-auto mb-3 ${memberType === 'business' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className={`font-bold ${memberType === 'business' ? 'text-blue-600' : 'text-gray-700'}`}>사업자회원</p>
                <p className="text-[10px] text-gray-400 mt-1">기업/자영업 대량구매</p>
              </button>
            </div>
            {memberType === 'business' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
                사업자회원은 <strong>박스 단위 할인가</strong>, <strong>견적서 발급</strong>, <strong>전용 고객센터</strong> 혜택이 제공됩니다.
              </div>
            )}
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
              다음 단계
            </button>
          </div>
        )}

        {/* Step 2: 정보 입력 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {memberType === 'business' ? '사업자' : '개인'}회원 정보 입력
            </h2>
            <div className="space-y-4">
              <FormInput label="이름" value={form.name} error={errors.name} placeholder="홍길동" onChange={v => set('name', v)} />
              <FormInput label="이메일" value={form.email} error={errors.email} type="email" placeholder="example@company.com" onChange={v => set('email', v)} />

              {/* 비밀번호 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="8자 이상 (영문+숫자+특수문자)"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none transition text-sm bg-gray-50 focus:bg-white ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= pw.level ? (pw.level === 1 ? 'bg-red-400' : pw.level === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${pw.color}`}>{pw.text}</span>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호 확인 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPwConfirm ? 'text' : 'password'}
                    value={form.passwordConfirm}
                    onChange={e => set('passwordConfirm', e.target.value)}
                    placeholder="비밀번호 재입력"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none transition text-sm bg-gray-50 focus:bg-white ${errors.passwordConfirm ? 'border-red-400' : form.passwordConfirm && form.password === form.passwordConfirm ? 'border-green-400' : 'border-gray-200 focus:border-blue-500'}`}
                  />
                  <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPwConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.passwordConfirm && form.password === form.passwordConfirm && (
                  <p className="text-green-600 text-xs mt-1 font-medium flex items-center gap-1"><Check size={12} /> 비밀번호가 일치합니다</p>
                )}
                {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1 font-medium">{errors.passwordConfirm}</p>}
              </div>

              <FormInput label="휴대폰번호" value={form.phone} error={errors.phone} type="tel" placeholder="010-0000-0000" onChange={v => set('phone', v)} />

              {/* 배송 주소 */}
              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-bold text-gray-700 mb-3">배송 주소 <span className="text-xs text-gray-400 font-normal">(주문 시 자동 입력됩니다)</span></p>
                <AddressSearch
                  zonecode={form.zonecode}
                  address={form.address}
                  detail={form.addressDetail}
                  onZonecodeChange={v => set('zonecode', v)}
                  onAddressChange={v => set('address', v)}
                  onDetailChange={v => set('addressDetail', v)}
                />
              </div>

              {/* 사업자 정보 */}
              {memberType === 'business' && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-bold text-gray-700 mb-3">사업자 정보</p>
                  <div className="space-y-4">
                    <FormInput label="회사명" value={form.company} error={errors.company} placeholder="(주)채움건설" onChange={v => set('company', v)} />
                    <FormInput label="사업자등록번호" value={form.bizNumber} error={errors.bizNumber} placeholder="000-00-00000" required={false} onChange={v => set('bizNumber', v)} />
                    <FormInput label="담당자명" value={form.manager} error={errors.manager} placeholder="구매 담당자" required={false} onChange={v => set('manager', v)} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50">이전</button>
              <button onClick={() => { if (validateStep2()) setStep(3); }} className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">다음 단계</button>
            </div>
          </div>
        )}

        {/* Step 3: 약관 동의 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">약관 동의</h2>

            {/* 전체 동의 */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4 cursor-pointer border-2 border-gray-200">
              <input type="checkbox" checked={allAgreed}
                onChange={() => {
                  const v = !allAgreed;
                  setAgreements({ terms: v, privacy: v, marketing: v, sms: v });
                  setErrors(prev => ({ ...prev, agree: '' }));
                }}
                className="w-5 h-5 rounded" />
              <span className="font-bold text-gray-900">전체 동의합니다</span>
            </label>

            <div className="space-y-3 mb-6">
              {[
                { key: 'terms', label: '이용약관 동의', required: true },
                { key: 'privacy', label: '개인정보처리방침 동의', required: true },
                { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
                { key: 'sms', label: 'SMS/알림톡 수신 동의', required: false },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={(agreements as any)[item.key]}
                    onChange={() => {
                      setAgreements(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }));
                      setErrors(prev => ({ ...prev, agree: '' }));
                    }}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700">
                    {item.required ? <span className="text-red-500 mr-1">[필수]</span> : <span className="text-gray-400 mr-1">[선택]</span>}
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {errors.agree && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium mb-4">{errors.agree}</div>
            )}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium mb-4">{errors.submit}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50">이전</button>
              <button onClick={handleSubmit} disabled={isLoading}
                className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition">
                {isLoading ? '가입 처리중...' : '회원가입 완료'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 링크 */}
      <div className="text-center mt-6 text-sm text-gray-500">
        이미 회원이신가요? <Link href="/login" className="text-blue-600 font-bold underline">로그인</Link>
      </div>

      {/* SNS 간편가입 */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-center text-[11px] text-gray-400 font-bold mb-4">SNS 간편 가입</p>
        <div className="flex flex-col gap-3">
          <button onClick={async () => {
            try {
              const res = await fetch('/api/oauth/naver');
              const data = await res.json();
              if (data.url) window.location.href = data.url;
              else setErrors({ submit: data.error || '네이버 로그인 설정이 필요합니다.' });
            } catch { setErrors({ submit: '네이버 서버 연결 실패' }); }
          }}
            className="w-full flex items-center justify-center gap-2 bg-[#03c75a] text-white font-bold py-3 rounded-xl hover:bg-[#02b350] transition">
            <span className="text-xl font-black">N</span> 네이버로 시작하기
          </button>
          <button onClick={async () => {
            try {
              const res = await fetch('/api/oauth/kakao');
              const data = await res.json();
              if (data.url) window.location.href = data.url;
              else setErrors({ submit: data.error || '카카오 로그인 설정이 필요합니다.' });
            } catch { setErrors({ submit: '카카오 서버 연결 실패' }); }
          }}
            className="w-full flex items-center justify-center gap-2 bg-[#fee500] text-[#3c1e1e] font-bold py-3 rounded-xl hover:bg-[#fdd800] transition">
            <span className="text-lg">K</span> 카카오로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
