"use client";
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setIsLogged(!!Cookies.get('token'));
    setIsAdmin(Cookies.get('role') === 'ADMIN');
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data)).catch(console.error);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (keyword.trim()) router.push(`/?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="w-full relative shadow-[0_4px_10px_rgb(0,0,0,0.03)] pb-2 bg-white">
      {/* Topmost bar (Blue) */}
      <div className="bg-[#6b8af0] text-white">
        <div className="max-w-[1280px] mx-auto px-4 h-12 md:h-12 flex items-center justify-between">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white text-[#6b8af0] flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0">
               <div className="grid grid-cols-2 gap-0.5 p-0.5 md:p-1 w-full h-full">
                  <div className="bg-[#6b8af0] opacity-80" />
                  <div className="bg-[#6b8af0]" />
                  <div className="col-span-2 bg-[#6b8af0] opacity-60" />
               </div>
            </div>
            <span className="text-[10px] md:text-xs font-medium opacity-90 truncate max-w-[150px] md:max-w-none">수도 배관 자재 전문. 설비 부속 판매</span>
            <span className="text-[10px] md:text-xs ml-1 md:ml-2 opacity-80 hidden sm:inline">| 관심고객수 4,780 ⓘ</span>
          </div>

          <div className="flex items-center gap-4 md:gap-5 text-xs md:text-sm font-semibold">
            <Link href="/" className="opacity-90 hover:opacity-100 hidden lg:inline">관심 스토어</Link>
            <Link href="/" className="opacity-90 hover:opacity-100 hidden md:inline">마이페이지 ▾</Link>
            {isAdmin && <Link href="/admin" className="text-yellow-300">ADM</Link>}
            
            <Link href="/cart" className="opacity-90 hover:opacity-100 flex items-center gap-1">
              <ShoppingCart size={16} className="md:hidden" />
              <span className="hidden md:inline">장바구니</span>
              {items.length > 0 && <span className="bg-white text-[#6b8af0] text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>}
            </Link>

            {isLogged ? (
               <button onClick={handleLogout} className="opacity-90">로그아웃</button>
            ) : (
               <Link href="/login" className="opacity-90 flex items-center gap-1">
                  <User size={16} className="md:hidden" />
                  <span className="hidden md:inline">로그인</span>
               </Link>
            )}
            
            <form onSubmit={handleSearch} className="relative ml-2 hidden lg:block">
               <input 
                 type="text" 
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
                 placeholder="검색어를 입력해주세요" 
                 className="pl-4 pr-10 py-1.5 rounded-full text-black text-sm w-56 outline-none" 
               />
               <button type="submit" className="absolute right-3 top-2"><Search size={16} className="text-[#6b8af0]" /></button>
            </form>
          </div>
        </div>
      </div>

      {/* Title area */}
      <div className="bg-white">
        <div className="max-w-[1280px] mx-auto h-16 md:h-[100px] flex items-center justify-between px-4">
          <button className="hidden md:flex border border-gray-300 text-gray-700 px-3 py-1.5 text-xs rounded hover:bg-gray-50 items-center gap-1 font-semibold">
             🔔 알림받는중
          </button>
          
          <Link href="/" className="flex items-center md:absolute md:left-1/2 md:-translate-x-1/2 pt-1 md:pt-2">
             <h1 className="text-2xl md:text-[44px] font-extrabold text-[#bad6ff] tracking-tighter">
                <span className="mr-1 relative -top-[1px] md:-top-[2px] text-xl md:text-[40px]">||||</span>채움수도
             </h1>
          </Link>
          
          <div className="text-right flex flex-col items-end">
             <div className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 md:mb-1 mt-1 md:mt-0">
                <span className="hidden sm:inline">스토어등급</span> <span className="text-yellow-500 font-bold border border-yellow-500 rounded-full px-1.5 md:px-2 py-[1px] md:py-0.5 text-[9px] md:text-[10px] flex items-center gap-1">👑 <span className="hidden md:inline">프리미엄 ⓘ</span><span className="md:hidden">VIP</span></span>
             </div>
             <div className="text-[10px] md:text-xs text-gray-400 hidden sm:block">오늘 545 · 전체 439,316</div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pb-2">
           <form onSubmit={handleSearch} className="relative w-full">
               <input 
                 type="text" 
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
                 placeholder="검색어를 입력해주세요" 
                 className="w-full pl-4 pr-10 py-1.5 md:py-2 border border-gray-200 rounded-full text-black text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow bg-gray-50 focus:bg-white" 
               />
               <button type="submit" className="absolute right-3 top-2.5"><Search size={16} className="text-[#6b8af0]" /></button>
            </form>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="max-w-[1280px] mx-auto flex items-center px-4 h-11 md:h-14 text-[13px] md:text-[15px] font-bold text-gray-800 border-t mt-1 md:mt-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link href="/" className="mr-5 md:mr-10 flex items-center gap-1 flex-shrink-0">홈</Link>
        <Link href="/" className="mr-5 md:mr-10 flex-shrink-0">전체상품</Link>
        {categories.map((cat: any) => (
             <Link href={`/?category=${cat.id}`} key={cat.id} className="mr-5 md:mr-10 text-gray-600 font-medium flex-shrink-0 hover:text-black">
                {cat.name} ▾
             </Link>
        ))}
      </div>
    </div>
  );
}
