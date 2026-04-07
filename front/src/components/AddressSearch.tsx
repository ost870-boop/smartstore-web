"use client";
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

interface AddressResult {
  zonecode: string;   // 우편번호
  address: string;    // 기본주소
  jibunAddress: string;
  buildingName: string;
}

interface Props {
  zonecode: string;
  address: string;
  detail: string;
  onZonecodeChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onDetailChange: (v: string) => void;
}

export default function AddressSearch({ zonecode, address, detail, onZonecodeChange, onAddressChange, onDetailChange }: Props) {
  const detailRef = useRef<HTMLInputElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const openPostcode = () => {
    if (!scriptLoaded || !(window as any).daum?.Postcode) return;

    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        const extra = data.buildingName ? ` (${data.buildingName})` : '';
        onZonecodeChange(data.zonecode);
        onAddressChange(addr + extra);
        // 상세주소로 포커스
        setTimeout(() => detailRef.current?.focus(), 100);
      },
      width: '100%',
      height: '400px',
    }).open();
  };

  return (
    <div className="space-y-3">
      {/* 우편번호 + 검색 버튼 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">우편번호</label>
          <input
            type="text"
            value={zonecode}
            readOnly
            placeholder="우편번호"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={openPostcode}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            <Search size={16} /> 주소 검색
          </button>
        </div>
      </div>

      {/* 기본주소 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          기본주소
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            readOnly
            onClick={openPostcode}
            placeholder="주소 검색 버튼을 클릭하세요"
            className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
          />
          <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
        </div>
      </div>

      {/* 상세주소 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">상세주소</label>
        <input
          ref={detailRef}
          type="text"
          value={detail}
          onChange={e => onDetailChange(e.target.value)}
          placeholder="동/호수, 건물명 등 상세주소 입력"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
