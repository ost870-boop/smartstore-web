"use client";

import { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([
        { id: 'o_174549_001', name: '김테스트', product: 'PVC 메꾸라 15A 외 2건', amount: 35000, date: '2026-04-01 10:15', status: 'PAID' },
        { id: 'o_174549_002', name: '이설비', product: '철 단조 메꾸라 20A', amount: 15400, date: '2026-04-01 09:20', status: 'SHIPPING', tracking: 'CJK-81923053' },
    ]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">주문/배송 관리</h1>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">엑셀 다운로드</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">송장 일괄등록</button>
                </div>
            </div>

            <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl overflow-hidden">
                 {/* Filters */}
                 <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                     <div className="flex gap-2">
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium outline-none">
                            <option>상태 전체보기</option>
                            <option>결제완료</option>
                            <option>배송준비중</option>
                            <option>배송중</option>
                        </select>
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium outline-none">
                            <option>어제/오늘</option>
                            <option>최근 1주일</option>
                            <option>최근 1개월</option>
                        </select>
                     </div>
                     <div className="relative">
                         <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                         <input type="text" placeholder="주문자/수령인 검색" className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none w-64" />
                     </div>
                 </div>

                 <table className="w-full text-left text-sm">
                     <thead className="bg-white border-b border-gray-200 text-gray-500 font-semibold">
                         <tr>
                             <th className="py-4 px-6 w-10">
                                 <input type="checkbox" className="rounded border-gray-300" />
                             </th>
                             <th className="py-4 px-4 font-bold">주문번호</th>
                             <th className="py-4 px-4 font-bold">주문자</th>
                             <th className="py-4 px-4 font-bold">주문상품</th>
                             <th className="py-4 px-4 font-bold">결제금액</th>
                             <th className="py-4 px-4 font-bold">진행상태</th>
                             <th className="py-4 px-4 font-bold">송장번호/처리</th>
                         </tr>
                     </thead>
                     <tbody>
                         {orders.map(o => (
                             <tr key={o.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                 <td className="py-4 px-6">
                                    <input type="checkbox" className="rounded border-gray-300 mt-1" />
                                 </td>
                                 <td className="py-4 px-4 font-medium text-blue-600">{o.id}</td>
                                 <td className="py-4 px-4 font-medium text-gray-900">{o.name}</td>
                                 <td className="py-4 px-4 text-gray-600">{o.product}</td>
                                 <td className="py-4 px-4 font-bold">{o.amount.toLocaleString()}원</td>
                                 <td className="py-4 px-4">
                                     <span className={`px-2 py-1 flex items-center justify-center w-max rounded text-[11px] font-bold tracking-wider ${o.status === 'PAID' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                         {o.status === 'PAID' ? '결제완료' : '배송중'}
                                     </span>
                                 </td>
                                 <td className="py-4 px-4">
                                     {o.status === 'PAID' ? (
                                        <div className="flex items-center gap-2">
                                            <input type="text" placeholder="송장번호 입력" className="border border-gray-300 rounded text-xs px-2 py-1.5 w-32 outline-none focus:border-blue-500" />
                                            <button className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded font-bold hover:bg-slate-700">발송</button>
                                        </div>
                                     ) : (
                                         <span className="font-semibold text-gray-500 text-xs">{o.tracking}</span>
                                     )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
            </div>
        </div>
    );
}
