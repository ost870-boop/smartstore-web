"use client";
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const STORAGE_KEY = 'smartstore-settings';

const DEFAULT_SETTINGS = {
  storeName: '채움수도상사',
  storeSlogan: '현장 직납 배관자재 온라인 최저가 도매',
  csPhone: '1588-0000',
  csHours: '평일 09:00 ~ 18:00 (토/일/공휴일 휴무)',
  csEmail: 'cs@chaeumsudo.com',
  shippingFee: '3,000원 (50,000원 이상 무료배송)',
  shippingNote: '평일 오후 2시 이전 결제 시 당일 출고\n대량주문 시 화물 배송 가능 (추가 운임 발생)',
  returnPolicy: '수령 후 7일 이내 교환/반품 가능 (미개봉 상태)\n단순 변심: 왕복 택배비 6,000원\n교환/반품 불가: 체결 부속, 개봉 제품, 맞춤 제작 상품',
  bizName: '채움수도상사',
  bizNumber: '123-45-67890',
  bizOwner: '홍길동',
  bizAddress: '서울특별시 강남구 테헤란로 123',
  bizEmail: 'biz@chaeumsudo.com',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, field, type = 'text', rows }: { label: string; field: keyof typeof settings; type?: string; rows?: number }) => (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      {rows ? (
        <textarea value={settings[field]} onChange={e => setSettings({ ...settings, [field]: e.target.value })}
          rows={rows} className="w-full border rounded-lg px-3 py-2 outline-none text-sm resize-y" />
      ) : (
        <input type={type} value={settings[field]} onChange={e => setSettings({ ...settings, [field]: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 outline-none text-sm" />
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">스토어 설정</h1>
        <button onClick={handleSave}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          <Save size={16} /> {saved ? '저장됨!' : '설정 저장'}
        </button>
      </div>

      <div className="space-y-8">
        {/* 스토어 기본정보 */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">스토어 기본정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="스토어명" field="storeName" />
            <Field label="슬로건" field="storeSlogan" />
          </div>
        </section>

        {/* 고객센터 */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">고객센터 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="대표 전화번호" field="csPhone" />
            <Field label="운영시간" field="csHours" />
            <Field label="고객센터 이메일" field="csEmail" />
          </div>
        </section>

        {/* 배송 정책 */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">배송 정책</h2>
          <div className="space-y-4">
            <Field label="배송비 안내" field="shippingFee" />
            <Field label="배송 상세 안내" field="shippingNote" rows={3} />
          </div>
        </section>

        {/* 교환/반품 정책 */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">교환/반품 정책</h2>
          <Field label="교환/반품 안내" field="returnPolicy" rows={4} />
        </section>

        {/* 사업자 정보 */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">사업자 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="상호명" field="bizName" />
            <Field label="사업자등록번호" field="bizNumber" />
            <Field label="대표자명" field="bizOwner" />
            <Field label="사업장 주소" field="bizAddress" />
            <Field label="사업자 이메일" field="bizEmail" />
          </div>
        </section>
      </div>
    </div>
  );
}
