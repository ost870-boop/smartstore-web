"use client";

import { ShoppingBag, Heart, FileText, Ticket } from 'lucide-react';

export default function MyPage() {
    return (
        <div className="max-w-[1280px] mx-auto py-10 px-4 flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-[220px] flex-shrink-0 md:border-r border-gray-200 md:pr-4 mb-4 md:mb-0">
                <h2 className="text-2xl font-extrabold mb-4 md:mb-6 text-gray-900 tracking-tight">마이페이지</h2>
                <ul className="flex flex-row md:flex-col gap-4 md:gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm md:text-[15px] font-semibold text-gray-600">
                    <li className="text-blue-600 font-bold border-b-2 md:border-0 border-blue-600 pb-2 md:pb-0 cursor-pointer flex items-center md:gap-2">
                        <ShoppingBag size={18} className="hidden md:block" /> 주문/배송 조회
                    </li>
                    <li className="hover:text-blue-600 cursor-pointer flex items-center md:gap-2">
                        <Heart size={18} className="hidden md:block" /> 찜 리스트
                    </li>
                    <li className="hover:text-blue-600 cursor-pointer flex items-center md:gap-2">
                        <FileText size={18} className="hidden md:block" /> 리뷰 관리
                    </li>
                    <li className="hover:text-blue-600 cursor-pointer flex items-center md:gap-2">
                        <Ticket size={18} className="hidden md:block" /> 쿠폰 관리
                    </li>
                </ul>
            </div>
            
            <div className="flex-1">
                {/* Status Dashboard */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 flex justify-between items-center mb-10 text-center shadow-[0_4px_16px_rgb(0,0,0,0.03)]">
                    <div className="flex-1 border-r border-gray-100 last:border-0 relative">
                        <div className="text-blue-600 font-black text-2xl md:text-3xl mb-1">0</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">결제완료</div>
                    </div>
                    <div className="flex-1 border-r border-gray-100 last:border-0">
                        <div className="text-gray-900 font-black text-2xl md:text-3xl mb-1">0</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">배송준비</div>
                    </div>
                    <div className="flex-1 border-r border-gray-100 last:border-0 bg-blue-50/50 -m-6 md:-m-10 py-6 md:py-10">
                        <div className="text-blue-600 font-black text-2xl md:text-3xl mb-1">0</div>
                        <div className="text-xs md:text-sm font-semibold text-blue-500">배송중</div>
                    </div>
                    <div className="flex-1 last:border-0">
                        <div className="text-gray-900 font-black text-2xl md:text-3xl mb-1">0</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">배송완료</div>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-4 border-b-2 border-gray-900 pb-3">
                   <h3 className="text-lg md:text-xl font-bold text-gray-900">최근 주문내역</h3>
                   <span className="text-xs text-gray-400 font-medium">최근 3개월</span>
                </div>
                
                <div className="text-center py-24 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50/80 font-medium text-sm">
                    최근 주문/배송 완료된 내역이 없습니다.
                </div>
            </div>
        </div>
    );
}
