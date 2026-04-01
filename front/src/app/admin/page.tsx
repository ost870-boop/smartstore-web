"use client";

import { Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">오늘의 핵심 지표</h1>
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><CheckCircle2 size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">신규 결제완료</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">12<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Package size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">배송 준비중</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">8<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Truck size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">배송중</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">3<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">취소/교환 접수</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">0<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Quick Actions & Urgent matters */}
               <div className="bg-white border text-center py-20 border-gray-200 rounded-3xl shadow-sm">
                   <h2 className="text-xl font-bold mb-4 text-gray-800">매출 리포트 (차트 영역)</h2>
                   <p className="text-gray-400">데이터 연동 대기중...</p>
               </div>

               <div className="bg-white border text-center py-20 border-gray-200 rounded-3xl shadow-sm">
                   <h2 className="text-xl font-bold mb-4 text-gray-800">문의 내역 (To-do)</h2>
                   <p className="text-gray-400">미답변 문의 0건</p>
               </div>
            </div>
        </div>
    );
}
