"use client";
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, AlertCircle, TrendingUp, ShoppingBag, Download } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
    PENDING: '결제대기', PAID: '결제완료', PREPARING: '배송준비',
    SHIPPING: '배송중', COMPLETED: '배송완료', CANCELLED: '취소',
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) return;
        fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : null)
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    if (!stats) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-32 bg-gray-100 rounded-2xl" /></div>;

    const maxDailySales = Math.max(...(stats.dailySales || []).map((d: any) => d.revenue), 1);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">대시보드</h1>
                <a href="/api/admin/orders/csv" target="_blank"
                    className="flex items-center gap-1.5 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
                    <Download size={16} /> 주문 CSV 다운로드
                </a>
            </div>

            {/* 매출 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: '오늘 매출', value: stats.todayRevenue, sub: `${stats.todayOrders}건`, color: 'text-blue-600' },
                    { label: '이번주 매출', value: stats.weekRevenue, color: 'text-green-600' },
                    { label: '이번달 매출', value: stats.monthRevenue, color: 'text-purple-600' },
                    { label: '총 매출', value: stats.totalRevenue, color: 'text-gray-900' },
                ].map(c => (
                    <div key={c.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 mb-2">{c.label}</p>
                        <p className={`text-xl md:text-2xl font-black ${c.color}`}>{(c.value || 0).toLocaleString()}<span className="text-sm font-bold text-gray-400 ml-0.5">원</span></p>
                        {c.sub && <p className="text-xs text-gray-400 mt-1">{c.sub}</p>}
                    </div>
                ))}
            </div>

            {/* 주문 상태 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                    { label: '결제완료', value: stats.paid, icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
                    { label: '결제대기', value: stats.pending, icon: AlertCircle, color: 'bg-amber-50 text-amber-500' },
                    { label: '배송중', value: stats.shipping, icon: Truck, color: 'bg-indigo-50 text-indigo-500' },
                    { label: '배송완료', value: stats.completed, icon: Package, color: 'bg-green-50 text-green-600' },
                    { label: '취소', value: stats.cancelled, icon: AlertCircle, color: 'bg-red-50 text-red-500' },
                ].map(c => (
                    <div key={c.label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}><c.icon size={20} /></div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                            <p className="text-xl font-black text-gray-900">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 7일 매출 추이 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} /> 최근 7일 매출</h2>
                    <div className="flex items-end gap-2 h-32">
                        {(stats.dailySales || []).map((d: any) => (
                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[9px] text-gray-400">{d.revenue > 0 ? `${(d.revenue / 10000).toFixed(0)}만` : ''}</span>
                                <div className="w-full bg-blue-100 rounded-t" style={{ height: `${Math.max((d.revenue / maxDailySales) * 100, 4)}%` }}>
                                    <div className="w-full h-full bg-blue-500 rounded-t opacity-80" />
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium">{d.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TOP5 상품 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><ShoppingBag size={18} /> 판매 TOP 5</h2>
                    {(stats.topProducts || []).length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">판매 데이터가 없습니다.</p>
                    ) : (
                        <div className="space-y-3">
                            {(stats.topProducts || []).map((p: any, i: number) => (
                                <div key={p.productId} className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                    <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.name}</span>
                                    <span className="text-xs text-gray-400">{p.totalQty}개</span>
                                    <span className="text-sm font-bold text-gray-900">{(p.totalRevenue || 0).toLocaleString()}원</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 최근 주문 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-base font-bold text-gray-800">최근 주문</h2>
                    <Link href="/admin/orders" className="text-xs text-blue-600 font-bold hover:underline">전체보기</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium">주문번호</th>
                                <th className="py-3 px-4 text-left font-medium">주문자</th>
                                <th className="py-3 px-4 text-left font-medium">상품</th>
                                <th className="py-3 px-4 text-right font-medium">금액</th>
                                <th className="py-3 px-4 text-center font-medium">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentOrders || []).length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-400">주문이 없습니다.</td></tr>
                            ) : (stats.recentOrders || []).map((o: any) => (
                                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs text-blue-600">{o.id}</td>
                                    <td className="py-3 px-4 text-gray-800">{o.customerName}</td>
                                    <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]">{o.productSummary}</td>
                                    <td className="py-3 px-4 text-right font-bold">{(o.finalAmount || 0).toLocaleString()}원</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100">{STATUS_LABEL[o.status] || o.status}</span>
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
