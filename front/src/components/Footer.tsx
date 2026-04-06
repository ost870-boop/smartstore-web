"use client";
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const STORAGE_KEY = 'smartstore-settings';
const DEFAULTS = {
  storeName: '채움수도상사',
  storeSlogan: '현장 직납 배관자재 온라인 최저가 도매',
  csPhone: '1588-0000',
  csHours: '평일 09:00 ~ 18:00 (토/일/공휴일 휴무)',
  csEmail: 'cs@chaeumsudo.com',
  shippingFee: '3,000원 (50,000원 이상 무료배송)',
  shippingNote: '평일 오후 2시 이전 결제 시 당일 출고',
  returnPolicy: '수령 후 7일 이내 교환/반품 가능 (미개봉 상태)\n단순 변심: 왕복 택배비 6,000원',
  bizName: '채움수도상사',
  bizNumber: '123-45-67890',
  bizOwner: '홍길동',
  bizAddress: '서울특별시 강남구 테헤란로 123',
  bizEmail: 'biz@chaeumsudo.com',
};

export default function Footer() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setS({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* 고객센터 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">고객센터</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone size={14} /> <span className="text-white font-bold text-lg">{s.csPhone}</span></p>
              <p className="flex items-center gap-2"><Clock size={14} /> {s.csHours}</p>
              <p className="flex items-center gap-2"><Mail size={14} /> {s.csEmail}</p>
            </div>
          </div>

          {/* 배송/교환 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">배송/교환 안내</h3>
            <div className="space-y-1.5 text-sm">
              <p>배송비: {s.shippingFee}</p>
              <p>{s.shippingNote}</p>
              <p className="text-gray-500 mt-2 whitespace-pre-line text-xs">{s.returnPolicy}</p>
            </div>
          </div>

          {/* 사업자 정보 */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">사업자 정보</h3>
            <div className="space-y-1.5 text-xs">
              <p>상호: {s.bizName} | 대표: {s.bizOwner}</p>
              <p>사업자등록번호: {s.bizNumber}</p>
              <p className="flex items-center gap-1"><MapPin size={12} /> {s.bizAddress}</p>
              <p>이메일: {s.bizEmail}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          <p>&copy; 2026 {s.storeName}. All rights reserved. | {s.storeSlogan}</p>
        </div>
      </div>
    </footer>
  );
}
