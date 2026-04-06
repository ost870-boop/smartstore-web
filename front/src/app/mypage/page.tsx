"use client";
import { useEffect, useState } from 'react';
import { ShoppingBag, Heart, FileText, Ticket, Clock } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Link from 'next/link';

export default function MyPage() {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/login?redirect=/mypage';
            return;
        }
        axios.get('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } })
           .then(res => setOrders(res.data))
           .catch(console.error);
    }, []);
    const statusCount = (s: string) => orders.filter((o: any) => o.status === s).length;
    const statusLabel: Record<string, string> = {
        PENDING: '결제대기', PAID: '결제완료', PREPARING: '배송준비',
        SHIPPING: '배송중', COMPLETED: '배송완료', CANCELLED: '취소', FAILED: '결제실패'
    };

    return (
        <div className="max-w-[1280px] mx-auto py-10 px-4 flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-[240px] flex-shrink-0 md:border-r border-gray-200 md:pr-4 mb-4 md:mb-0">
                <h2 className="text-2xl font-extrabold mb-2 text-gray-900 tracking-tight">마이페이지</h2>
                <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 shadow-md border-b-4 border-blue-500">
                    <p className="text-xs text-gray-400 font-bold mb-1">나의 기업 등급</p>
                    <p className="font-extrabold text-lg">기본 파트너사</p>
                    <p className="text-[10px] text-gray-300 mt-2">다음 등급까지 1,500,000원</p>
                </div>
                <ul className="flex flex-row md:flex-col gap-4 md:gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide text-sm md:text-[15px] font-semibold text-gray-600">
                    <li className="text-blue-600 font-bold border-b-2 md:border-0 border-blue-600 pb-2 md:pb-0 cursor-pointer flex items-center md:gap-2">
                        <ShoppingBag size={18} className="hidden md:block" /> 주문/배송 조회 (B2B)
                    </li>
                    <Link href="/wishlist" className="hover:text-blue-600 cursor-pointer flex items-center md:gap-2">
                        <Heart size={18} className="hidden md:block" /> 찜 리스트
                    </Link>
                    <Link href="/recent" className="hover:text-blue-600 cursor-pointer flex items-center md:gap-2">
                        <Clock size={18} className="hidden md:block" /> 최근 본 상품
                    </Link>
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
                        <div className="text-blue-600 font-black text-2xl md:text-3xl mb-1">{statusCount('PAID') + statusCount('PENDING')}</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">결제완료</div>
                    </div>
                    <div className="flex-1 border-r border-gray-100 last:border-0">
                        <div className="text-gray-900 font-black text-2xl md:text-3xl mb-1">{statusCount('PREPARING')}</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">배송준비</div>
                    </div>
                    <div className="flex-1 border-r border-gray-100 last:border-0 bg-blue-50/50 -m-6 md:-m-10 py-6 md:py-10">
                        <div className="text-blue-600 font-black text-2xl md:text-3xl mb-1">{statusCount('SHIPPING')}</div>
                        <div className="text-xs md:text-sm font-semibold text-blue-500">배송중</div>
                    </div>
                    <div className="flex-1 last:border-0">
                        <div className="text-gray-900 font-black text-2xl md:text-3xl mb-1">{statusCount('COMPLETED')}</div>
                        <div className="text-xs md:text-sm font-semibold text-gray-500">배송완료</div>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-4 border-b-2 border-gray-900 pb-3">
                   <h3 className="text-lg md:text-xl font-bold text-gray-900">최근 주문내역</h3>
                   <span className="text-xs text-gray-400 font-medium">최근 3개월</span>
                </div>
                {orders.length === 0 ? (
                    <div className="text-center py-24 text-gray-400 border border-gray-100 rounded-2xl bg-gray-50/80 font-medium text-sm">
                        최근 주문/배송 완료된 내역이 없습니다.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((o: any) => (
                            <div key={o.id} className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4 border-b pb-3">
                                    <span className="text-gray-500 font-bold text-xs">{new Date(o.createdAt).toLocaleDateString()} 주문 ({o.id})</span>
                                    <span className={`font-extrabold text-sm px-2 py-0.5 rounded-full text-xs ${o.status === 'PAID' || o.status === 'PENDING' ? 'bg-blue-100 text-blue-600' : o.status === 'SHIPPING' ? 'bg-green-100 text-green-700' : o.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : o.status === 'CANCELLED' || o.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>{statusLabel[o.status] || o.status}</span>
                                </div>
                                {o.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 mb-3 last:mb-0">
                                        <div className="w-16 h-16 bg-gray-50 rounded border flex items-center justify-center">
                                            {item.product?.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover mix-blend-multiply" /> : 'NoImg'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{item.product?.name}</p>
                                            <p className="text-gray-500 text-xs mt-1">{item.price.toLocaleString()}원 | {item.quantity}개</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 pt-3 border-t flex justify-end">
                                    <button className="text-sm font-bold border rounded px-4 py-1.5 hover:bg-gray-50">배송조회</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
