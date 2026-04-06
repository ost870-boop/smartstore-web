"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Package, Truck, CheckCircle2, AlertCircle, Users } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ paid: 0, pending: 0, shipping: 0, cancelled: 0 });

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        axios.get('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setStats(res.data))
            .catch(err => {
                console.error(err);
                alert('권한이 없거나 불러오기 실패했습니다.');
            });
    }, []);
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
                    <p className="text-3xl font-black text-gray-900 ml-1">{stats.paid}<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><Package size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">배송 준비중</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">{stats.pending}<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Truck size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">배송중</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">{stats.shipping}<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle size={24} /></div>
                        <h3 className="text-gray-500 font-semibold text-sm">취소/교환 접수</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900 ml-1">{stats.cancelled}<span className="text-lg font-bold text-gray-500 ml-1">건</span></p>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
               <a href="/admin/products" className="bg-white border text-center py-12 border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition group">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition"><Package size={28}/></div>
                   <h2 className="text-lg font-bold text-gray-800">상품/재고 관리</h2>
                   <p className="text-sm text-gray-500 mt-2">B2B 대량 등록 및 단가수정</p>
               </a>
               <a href="/admin/orders" className="bg-white border text-center py-12 border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition group">
                   <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition"><Truck size={28}/></div>
                   <h2 className="text-lg font-bold text-gray-800">주문/발주 관리</h2>
                   <p className="text-sm text-gray-500 mt-2">송장 일괄등록 및 발주서 발급</p>
               </a>
               <a href="/admin/customers" className="bg-white border text-center py-12 border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition group">
                   <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition"><Users size={28}/></div>
                   <h2 className="text-lg font-bold text-gray-800">기업회원 관리</h2>
                   <p className="text-sm text-gray-500 mt-2">사업자 등록 확인 및 도매 승인</p>
               </a>
             </div>
        </div>
    );
}
