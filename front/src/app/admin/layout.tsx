"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PackageSearch, Users, ShoppingCart, MessageSquare, Ticket, Settings, LogOut, BarChart3 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        const role = Cookies.get('role');
        if (!token || role !== 'ADMIN') {
            window.location.href = '/login?redirect=/admin';
            return;
        }
        setAuthorized(true);
    }, []);

    if (!authorized) {
        return <div className="flex items-center justify-center min-h-screen text-gray-400">권한 확인 중...</div>;
    }

    const menu = [
        { label: '대시보드', path: '/admin', icon: <BarChart3 size={20} /> },
        { label: '상품 관리', path: '/admin/products', icon: <PackageSearch size={20} /> },
        { label: '주문/배송 관리', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { label: '고객 관리 (리뷰/문의)', path: '/admin/customers', icon: <MessageSquare size={20} /> },
        { label: '쿠폰 관리', path: '/admin/coupons', icon: <Ticket size={20} /> },
        { label: '설정', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('role');
        window.location.href = '/login';
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-[240px] bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col fixed h-full z-10 transition-transform">
                <div className="h-16 flex items-center px-6 bg-slate-950 font-black text-white text-lg tracking-tight shadow-md">
                    SMARTAdmin <span className="text-blue-500 font-normal ml-1 text-sm">PRO</span>
                </div>
                
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menu.map(m => {
                        const isActive = pathname === m.path;
                        return (
                            <Link 
                                key={m.path} 
                                href={m.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-slate-800 hover:text-white'}`}
                            >
                                {m.icon}
                                {m.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors p-2 w-full">
                        <LogOut size={16} /> 로그아웃
                    </button>
                    <div className="mt-2 text-[10px] text-slate-600 px-2">v2.1.0-beta</div>
                </div>
            </aside>

            {/* Main Content Space */}
            <main className="flex-1 ml-[240px] flex flex-col min-h-screen relative overflow-hidden">
                {/* Header Navbar */}
                <header className="h-16 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between px-8 z-10 font-medium">
                    <div className="text-gray-500">
                        {menu.find(m => m.path === pathname)?.label || '관리자 페이지'}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/" className="px-4 py-1.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-white transition-colors text-xs font-bold shadow-sm">쇼핑몰 바로가기 홈</Link>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200 shadow-sm">최</div>
                        <span className="font-bold text-gray-800 mr-2">최고관리자</span>
                    </div>
                </header>

                {/* Dashboard Viewport */}
                <div className="p-8 pb-32 flex-1 overflow-y-auto w-full max-w-[1400px]">
                    {children}
                </div>
            </main>
        </div>
    );
}
