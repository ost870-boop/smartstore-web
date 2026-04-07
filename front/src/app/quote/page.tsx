"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FileText, Phone, Mail, Building2, CheckCircle } from 'lucide-react';

const API = ''; // 상대경로 → Next.js rewrite → localhost:5000

export default function QuotePage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    items: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.phone || !form.items) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    // MVP: 실제 이메일 발송 없이 성공 처리
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center px-4">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">견적 요청이 접수되었습니다</h1>
        <p className="text-gray-500 mb-2">영업일 기준 1~2일 내 담당자가 연락드립니다.</p>
        <p className="text-gray-400 text-sm mb-8">급한 문의는 <strong className="text-gray-700">1588-0000</strong>으로 전화 주세요.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 md:my-12 px-4 pb-20">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-600 text-sm font-bold mb-2">
          <FileText size={16} />
          <span>B2B 대량구매 서비스</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">견적 요청서</h1>
        <p className="text-gray-500 text-sm">50만원 이상 대량 구매 시 추가 할인이 적용됩니다. 담당자가 맞춤 견적을 제공해 드립니다.</p>
      </div>

      {/* 혜택 안내 */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 grid grid-cols-3 gap-4 text-center">
        {[
          { label: '50만원 이상', desc: '추가 3% 할인' },
          { label: '100만원 이상', desc: '추가 5% 할인' },
          { label: '200만원 이상', desc: '추가 8% 할인' },
        ].map((b, i) => (
          <div key={i}>
            <div className="font-bold text-blue-700 text-sm">{b.label}</div>
            <div className="text-xs text-blue-500 mt-0.5">{b.desc}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 기업 정보 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={16} className="text-gray-400" /> 기업 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">기업명 / 상호 <span className="text-red-500">*</span></label>
              <input name="companyName" value={form.companyName} onChange={handleChange}
                placeholder="예: (주)ABC건설" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">담당자 성함 <span className="text-red-500">*</span></label>
              <input name="contactName" value={form.contactName} onChange={handleChange}
                placeholder="담당자 이름" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                <Phone size={11} /> 연락처 <span className="text-red-500">*</span>
              </label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="010-0000-0000" type="tel" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                <Mail size={11} /> 이메일
              </label>
              <input name="email" value={form.email} onChange={handleChange}
                placeholder="example@company.com" type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition" />
            </div>
          </div>
        </div>

        {/* 요청 상품 */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" /> 견적 요청 상품
          </h2>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">상품명 및 수량 <span className="text-red-500">*</span></label>
            <textarea name="items" value={form.items} onChange={handleChange} rows={5} required
              placeholder={"예시:\n- PE 수도관 15A × 100m\n- 스텐 볼밸브 25A × 50개\n- PVC 엘보 90도 20A × 200개"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition resize-none" />
            <p className="text-xs text-gray-400 mt-1">상품 페이지 URL 또는 상품코드를 함께 기입하시면 더 빠른 처리가 가능합니다.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">추가 요청사항</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="납기일, 배송지, 결제 방법, 기타 요청사항"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition resize-none" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] transition-all disabled:opacity-60">
          {loading ? '접수 중...' : '견적 요청 접수하기'}
        </button>
        <p className="text-center text-xs text-gray-400">
          또는 전화 문의: <strong className="text-gray-600">1588-0000</strong> (평일 09:00 ~ 18:00)
        </p>
      </form>
    </div>
  );
}
