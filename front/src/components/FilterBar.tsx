'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`);
  }

  return (
      <div className="border-t md:border-t-2 border-black pt-3 md:pt-4 mb-3 md:mb-4 flex justify-between items-center px-1 md:px-0 overflow-x-auto scrollbar-hide">
         <div className="flex gap-1.5 md:gap-2 flex-shrink-0 mr-4">
            <button className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex-shrink-0 break-keep">무료배송</button>
            <select 
               className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm outline-none bg-white cursor-pointer"
               onChange={(e) => handleFilter('material', e.target.value)}
               value={searchParams.get('material') || ''}
            >
                <option value="">재질 전체 ▾</option>
                <option value="PVC">PVC</option>
                <option value="스텐(STS)">스텐(STS)</option>
                <option value="동">동관</option>
                <option value="황동(신주)">황동(신주)</option>
                <option value="주철">주철</option>
            </select>
            <select 
               className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm outline-none bg-white cursor-pointer"
               onChange={(e) => handleFilter('usage', e.target.value)}
               value={searchParams.get('usage') || ''}
            >
                <option value="">용도 전체 ▾</option>
                <option value="수도용">수도용</option>
                <option value="가스용">가스용</option>
                <option value="농수관용">농수관용</option>
                <option value="산업용">산업용</option>
            </select>
            <select 
               className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm outline-none bg-white cursor-pointer"
               onChange={(e) => handleFilter('brand', e.target.value)}
               value={searchParams.get('brand') || ''}
            >
                <option value="">브랜드 전체 ▾</option>
                <option value="KS배관">KS배관</option>
                <option value="동아크레도">동아크레도</option>
                <option value="영남메탈">영남메탈</option>
                <option value="성일하이텍">성일하이텍</option>
                <option value="신진기계">신진기계</option>
            </select>
         </div>
      </div>
  )
}
