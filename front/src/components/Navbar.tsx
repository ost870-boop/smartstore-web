"use client";
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useSearchStore, POPULAR_SEARCHES } from '@/store/useSearchStore';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';

import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const _hasHydrated = useCartStore(s => s._hasHydrated);
  const getTotalItems = useCartStore(s => s.getTotalItems);
  const cartCount = _hasHydrated ? getTotalItems() : 0;
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const setLiveQuery = useSearchStore(s => s.setLiveQuery);
  const clearQuery = useSearchStore(s => s.clearQuery);
  const addRecentSearch = useSearchStore(s => s.addRecentSearch);
  const removeRecentSearch = useSearchStore(s => s.removeRecentSearch);
  const clearRecentSearches = useSearchStore(s => s.clearRecentSearches);
  const recentSearches = useSearchStore(s => s.recentSearches);

  const [searchFocused, setSearchFocused] = useState(false);

  // 홈이 아닌 페이지로 이동하면 검색어 초기화
  useEffect(() => {
    if (pathname !== '/') clearQuery();
  }, [pathname]);

  useEffect(() => {
    setIsLogged(!!Cookies.get('token'));
    setIsAdmin(Cookies.get('role') === 'ADMIN');
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data)).catch(console.error);
  }, []);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    if (pathname === '/') {
      setLiveQuery(val);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    window.location.href = '/';
  };

  const executeSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) { clearQuery(); return; }
    setKeyword(trimmed);
    setLiveQuery(trimmed);
    addRecentSearch(trimmed);
    setSearchFocused(false);
    if (pathname !== '/') router.push(`/?search=${encodeURIComponent(trimmed)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword);
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
            {isAdmin && <Link href="/admin" className="text-yellow-300">ADM</Link>}
            
            <Link href="/cart" className="opacity-90 hover:opacity-100 flex items-center gap-1">
              <ShoppingCart size={16} className="md:hidden" />
              <span className="hidden md:inline">장바구니</span>
              {cartCount > 0 && <span className="bg-white text-[#6b8af0] text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-full font-bold">{cartCount}</span>}
            </Link>

            {isLogged ? (
               <button onClick={handleLogout} className="opacity-90">로그아웃</button>
            ) : (
               <Link href="/login" className="opacity-90 flex items-center gap-1">
                  <User size={16} className="md:hidden" />
                  <span className="hidden md:inline">로그인</span>
               </Link>
            )}
            
            <div className="relative ml-2 hidden lg:block">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={keyword}
                  onChange={handleKeywordChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="상품명, 규격, 브랜드로 검색"
                  className="pl-4 pr-11 py-2 rounded-l-full text-black text-sm w-60 outline-none border-2 border-r-0 border-white focus:border-white"
                />
                <button type="submit" className="bg-white hover:bg-gray-100 transition-colors h-[38px] w-10 flex items-center justify-center rounded-r-full border-2 border-l-0 border-white flex-shrink-0">
                  <Search size={18} className="text-[#6b8af0]" strokeWidth={2.5} />
                </button>
              </form>
              {searchFocused && !keyword && (
                <div className="absolute top-full mt-1 left-0 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50 text-gray-800">
                  {recentSearches.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500">최근 검색어</span>
                        <button onMouseDown={() => clearRecentSearches()} className="text-[10px] text-gray-400 hover:text-red-500">전체삭제</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map(s => (
                          <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-50 hover:text-blue-600">
                            <span onMouseDown={() => executeSearch(s)}>{s}</span>
                            <button onMouseDown={() => removeRecentSearch(s)} className="text-gray-400 hover:text-red-500 text-[10px] leading-none">&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-gray-500 mb-2 block">인기 검색어</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCHES.map((s, i) => (
                        <span key={s} onMouseDown={() => executeSearch(s)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <span className="text-blue-400 font-bold text-[10px]">{i + 1}</span> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
             <h1 className="text-2xl md:text-[44px] font-extrabold text-[#bad6ff] tracking-tighter flex items-center gap-2 md:gap-3">
                {/* 로고 아이콘: 2x2 그리드 (가로줄+세로줄 패턴) */}
                <span className="inline-grid grid-cols-2 gap-[3px] md:gap-[4px] w-[28px] h-[28px] md:w-[44px] md:h-[44px]">
                  {/* 좌상: 가로줄 3개 */}
                  <span className="flex flex-col justify-between py-[2px] md:py-[3px]">
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                  </span>
                  {/* 우상: 세로줄 3개 */}
                  <span className="flex flex-row justify-between px-[2px] md:px-[3px]">
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                  </span>
                  {/* 좌하: 세로줄 3개 */}
                  <span className="flex flex-row justify-between px-[2px] md:px-[3px]">
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="h-full w-[2.5px] md:w-[4px] bg-[#bad6ff] rounded-sm" />
                  </span>
                  {/* 우하: 가로줄 3개 */}
                  <span className="flex flex-col justify-between py-[2px] md:py-[3px]">
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                    <span className="w-full h-[2.5px] md:h-[4px] bg-[#bad6ff] rounded-sm" />
                  </span>
                </span>
                채움수도
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
        <div className="lg:hidden px-4 pb-2 relative">
           <form onSubmit={handleSearch} className="flex items-center w-full">
               <input
                 type="text"
                 value={keyword}
                 onChange={handleKeywordChange}
                 onFocus={() => setSearchFocused(true)}
                 onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                 placeholder="상품명, 규격, 브랜드로 검색"
                 className="flex-1 pl-4 pr-2 py-2 border-2 border-r-0 border-[#6b8af0] rounded-l-full text-black text-sm outline-none bg-gray-50 focus:bg-white"
               />
               <button type="submit" className="bg-[#6b8af0] hover:bg-[#5a7be0] transition-colors h-[42px] w-12 flex items-center justify-center rounded-r-full flex-shrink-0 active:scale-95">
                 <Search size={18} className="text-white" strokeWidth={2.5} />
               </button>
            </form>
            {searchFocused && !keyword && (
              <div className="absolute top-full left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50">
                {recentSearches.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500">최근 검색어</span>
                      <button onMouseDown={() => clearRecentSearches()} className="text-[10px] text-gray-400 hover:text-red-500">전체삭제</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map(s => (
                        <span key={s} className="inline-flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-50">
                          <span onMouseDown={() => executeSearch(s)}>{s}</span>
                          <button onMouseDown={() => removeRecentSearch(s)} className="text-gray-400 hover:text-red-500 text-[10px]">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-gray-500 mb-2 block">인기 검색어</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((s, i) => (
                      <span key={s} onMouseDown={() => executeSearch(s)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100">
                        <span className="text-blue-400 font-bold text-[10px]">{i + 1}</span> {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
