"use client";

import { MessageSquareReply, Star } from 'lucide-react';

export default function AdminCustomersPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">고객 문의 / 리뷰 관리</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reviews */}
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-bold mb-6 flex justify-between items-center text-gray-800">
                        최근 상품 리뷰 <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">+3 NEW</span>
                    </h2>
                    <div className="space-y-4">
                        <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex text-amber-400 gap-0.5 mb-1.5"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
                                    <div className="text-xs font-bold text-gray-500">김*트 · PVC 임시 메꾸라</div>
                                </div>
                                <span className="text-[11px] font-semibold text-gray-400">2026-04-01</span>
                            </div>
                            <p className="text-sm text-gray-800 mb-4 leading-relaxed font-medium">배송도 빠르고 품질도 너무 좋습니다. 다음 현장에서도 무조건 여기서 시킵니다.</p>
                            <button className="text-xs font-black text-blue-600 flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4"><MessageSquareReply size={14}/> 판매자 답글 달기</button>
                        </div>
                    </div>
                </div>

                {/* Q&A */}
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-bold mb-6 flex justify-between items-center text-gray-800">
                        미답변 상품 문의 <span className="text-sm font-extrabold text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse">1 REQUIRE</span>
                    </h2>
                    <div className="space-y-4">
                        <div className="border border-red-100 p-5 rounded-xl bg-red-50/30 hover:bg-white hover:border-red-200 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-xs font-bold text-gray-500">박*비 · 스텐 주름관 속발소</div>
                                <span className="text-[11px] font-semibold text-gray-400">2026-04-01</span>
                            </div>
                            <p className="text-sm text-gray-800 font-bold mb-4 flex items-start gap-2 leading-relaxed">
                                <span className="text-red-500 font-black text-base leading-none">Q</span> 
                                이거 20A 규격 파이프에도 맞나요? 급한데 답변 부탁드립니다.
                            </p>
                            <div className="mt-4 flex gap-2 w-full">
                                <input type="text" placeholder="답변을 입력하세요..." className="flex-1 border border-gray-300 rounded-lg text-xs px-3 py-2 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-white font-medium" />
                                <button className="bg-slate-800 text-white font-bold text-xs px-4 rounded-lg hover:bg-slate-700 transition-colors shadow-sm">답변 등록</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
