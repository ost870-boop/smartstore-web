"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Search } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING:   { label: '결제대기', color: 'bg-gray-100 text-gray-600' },
    PAID:      { label: '결제완료', color: 'bg-amber-100 text-amber-700' },
    PREPARING: { label: '배송준비', color: 'bg-blue-100 text-blue-600' },
    SHIPPING:  { label: '배송중',   color: 'bg-green-100 text-green-700' },
    COMPLETED: { label: '배송완료', color: 'bg-gray-100 text-gray-500' },
    CANCELLED: { label: '취소',     color: 'bg-red-100 text-red-600' },
    FAILED:    { label: '실패',     color: 'bg-red-100 text-red-600' },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const token = Cookies.get('token');

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await axios.put(`/api/admin/orders/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch { alert('상태 변경 실패'); }
    };

    const handleShip = async (orderId: string) => {
        const tr = trackingInput[orderId];
        if (!tr) return alert('송장번호를 입력해주세요');
        try {
            await axios.put(`/api/admin/orders/${orderId}`,
                { status: 'SHIPPING', trackingNumber: tr },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch { alert('처리 실패'); }
    };

    // 클라이언트 필터링
    const filtered = orders.filter(o => {
        if (statusFilter && o.status !== statusFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const name = (o.user?.name || o.guestName || '').toLowerCase();
            const id = o.id.toLowerCase();
            if (!name.includes(q) && !id.includes(q)) return false;
        }
        return true;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">주문/배송 관리</h1>
                <span className="text-sm text-gray-400">총 {filtered.length}건</span>
            </div>

            <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium outline-none"
                        >
                            <option value="">상태 전체보기</option>
                            {Object.entries(STATUS_MAP).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="주문자/주문번호 검색"
                            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none w-64 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-white border-b border-gray-200 text-gray-500 font-semibold">
                            <tr>
                                <th className="py-4 px-4 font-bold">주문번호</th>
                                <th className="py-4 px-4 font-bold">주문자</th>
                                <th className="py-4 px-4 font-bold">주문상품</th>
                                <th className="py-4 px-4 font-bold">결제금액</th>
                                <th className="py-4 px-4 font-bold">진행상태</th>
                                <th className="py-4 px-4 font-bold">송장/처리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-400">주문이 없습니다.</td></tr>
                            ) : filtered.map((o: any) => (
                                <tr key={o.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="font-mono text-xs text-blue-600">{o.id}</span>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('ko-KR')}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="font-medium text-gray-900">{o.user?.name || o.guestName || '비회원'}</span>
                                        {o.guestPhone && <div className="text-[10px] text-gray-400">{o.guestPhone}</div>}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 max-w-[200px]">
                                        <span className="line-clamp-1">{o.items?.[0]?.product?.name || '상품'}</span>
                                        {o.items?.length > 1 && <span className="text-xs text-gray-400"> 외 {o.items.length - 1}건</span>}
                                    </td>
                                    <td className="py-4 px-4 font-bold">{o.finalAmount?.toLocaleString()}원</td>
                                    <td className="py-4 px-4">
                                        <select
                                            value={o.status}
                                            onChange={e => handleStatusChange(o.id, e.target.value)}
                                            className={`px-2 py-1 rounded text-[11px] font-bold outline-none cursor-pointer ${STATUS_MAP[o.status]?.color || 'bg-gray-100'}`}
                                        >
                                            {Object.entries(STATUS_MAP).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-4 px-4">
                                        {(o.status === 'PAID' || o.status === 'PREPARING') ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    value={trackingInput[o.id] || ''}
                                                    onChange={e => setTrackingInput({ ...trackingInput, [o.id]: e.target.value })}
                                                    placeholder="송장번호"
                                                    className="border border-gray-300 rounded text-xs px-2 py-1.5 w-28 outline-none focus:border-blue-500"
                                                />
                                                <button onClick={() => handleShip(o.id)}
                                                    className="bg-slate-800 text-white text-xs px-2 py-1.5 rounded font-bold hover:bg-slate-700 whitespace-nowrap">
                                                    발송
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-gray-500 text-xs">{o.trackingNumber || '-'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
