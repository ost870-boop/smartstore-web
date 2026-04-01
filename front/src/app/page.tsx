import Link from 'next/link';
import { ArrowUpDown, Grid, LayoutList } from 'lucide-react';

async function getProducts(queryStr: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${API_URL}/api/products?${queryStr}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; search?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.category) query.append('categoryId', params.category);
  if (params.sort) query.append('sort', params.sort);
  if (params.search) query.append('search', params.search);
  
  const products = await getProducts(query.toString());

  return (
    <div className="max-w-[1280px] mx-auto pb-20 px-4">
      
      {/* Header section */}
      <div className="flex justify-between items-end mt-6 md:mt-12 mb-3 md:mb-4 px-1 md:px-0">
         <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
           {params.search ? `'${params.search}' 검색결과` : '전체상품'}
         </h2>
         <div className="text-[11px] md:text-sm text-gray-500">홈 <span className="hidden md:inline">&gt;</span> <span className="text-black font-semibold">총 {products.length}개</span> <span className="hidden md:inline">▾</span></div>
      </div>

      {/* Filter Badges */}
      <div className="border-t md:border-t-2 border-black pt-3 md:pt-4 mb-3 md:mb-4 flex justify-between items-center px-1 md:px-0 overflow-x-auto scrollbar-hide">
         <div className="flex gap-1.5 md:gap-2 flex-shrink-0 mr-4">
            <button className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex-shrink-0 break-keep">무료배송</button>
            <button className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm flex-shrink-0 break-keep">혜택정보 ▾</button>
            <button className="border border-gray-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 shadow-sm flex-shrink-0 break-keep">가격대 ▾</button>
         </div>
      </div>

      {/* Sort row */}
      <div className="border-t border-b border-gray-200 py-2.5 md:py-3.5 flex justify-between items-center bg-white z-10 sticky top-[104px] md:top-[152px] mb-6 md:mb-8 overflow-x-auto scrollbar-hide px-1 md:px-0">
         <div className="flex gap-3 md:gap-4 text-[12px] md:text-[13px] font-medium text-gray-400 flex-shrink-0">
            <Link href={`/?${new URLSearchParams({...params, sort: 'popular'}).toString()}`} className={`cursor-pointer flex items-center gap-1 flex-shrink-0 ${params.sort === 'popular' || !params.sort ? 'text-black font-bold' : 'hover:text-black'}`}>
              {(!params.sort || params.sort === 'popular') && '✓ '}인기도순
            </Link>
            <Link href={`/?${new URLSearchParams({...params, sort: 'newest'}).toString()}`} className={`cursor-pointer flex-shrink-0 ${params.sort === 'newest' ? 'text-black font-bold' : 'hover:text-black'}`}>| &nbsp;최신순</Link>
            <Link href={`/?${new URLSearchParams({...params, sort: 'price_asc'}).toString()}`} className={`cursor-pointer flex-shrink-0 ${params.sort === 'price_asc' ? 'text-black font-bold' : 'hover:text-black'}`}>| &nbsp;낮은 가격순</Link>
            <Link href={`/?${new URLSearchParams({...params, sort: 'price_desc'}).toString()}`} className={`cursor-pointer hidden sm:inline flex-shrink-0 ${params.sort === 'price_desc' ? 'text-black font-bold' : 'hover:text-black'}`}>| &nbsp;높은 가격순</Link>
         </div>
         <div className="hidden md:flex items-center gap-4 text-[13px] font-semibold text-gray-700 tracking-tight flex-shrink-0 ml-4">
            <span className="cursor-pointer border border-transparent hover:border-gray-200 px-2 py-1 rounded">40개씩 보기 ▾</span>
            <div className="flex bg-gray-100 rounded overflow-hidden border">
               <button className="p-1 px-[0.4rem] bg-black text-white"><Grid size={15} strokeWidth={3} /></button>
               <button className="p-1 px-[0.4rem] hover:bg-gray-200"><LayoutList size={15} className="text-gray-400" /></button>
            </div>
         </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12">
        {products.map((p: any) => {
          const rating = 5.0; // Mock average 
          const originalPrice = p.originalPrice || p.price + 3000;
          const reviewsCount = p._count?.reviews || 0;

          return (
            <Link href={`/products/${p.id}`} key={p.id} className="group cursor-pointer">
              <div className="relative flex flex-col h-full">
                {/* Image Section */}
                <div className="relative aspect-square bg-white border border-gray-100 md:border-0 rounded-lg md:rounded-none flex items-center justify-center mb-3 overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="object-cover w-[80%] md:w-[70%] h-[80%] md:h-[70%] drop-shadow-sm md:drop-shadow-md group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
                  ) : (
                    <span className="text-gray-300 text-xs md:text-base">No Image</span>
                  )}
                  {/* BEST tag */}
                  <div className="absolute top-0 left-0 bg-black text-white text-[9px] md:text-[11px] font-extrabold px-1.5 md:px-3 py-1 md:py-1.5 tracking-wider">BEST</div>
                </div>

                {/* Details Section */}
                <div className="px-1 flex flex-col flex-1">
                  <h3 className="text-[13px] md:text-[15px] font-medium text-gray-800 leading-[1.3] line-clamp-2 hover:underline mb-1 whitespace-pre-wrap">{p.name}</h3>
                  <p className="text-gray-400 text-[11px] md:text-[12px] mb-[4px] md:mb-[6px] truncate">{p.description}</p>
                  
                  <div className="flex items-baseline gap-0.5 md:gap-1 mt-auto flex-wrap">
                    <span className="font-extrabold text-[18px] md:text-[22px] font-sans tracking-tighter text-gray-900">{p.price.toLocaleString()}</span>
                    <span className="font-bold text-gray-900 text-[12px] md:text-[14px]">원</span>
                    {originalPrice > p.price && (
                        <span className="text-gray-400 text-[10px] md:text-[11px] ml-1 flex items-center break-keep line-through">
                          {originalPrice.toLocaleString()}원
                        </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px] md:text-[11px] text-gray-500 font-medium">
                     <span className="border border-red-500 text-red-500 px-[3px] py-[1px] rounded-[3px] leading-none mb-[1px] font-bold shrink-0">오늘출발</span> <span className="truncate">평일 14시 마감</span>
                  </div>
                  
                  <div className="flex gap-1 items-center mt-2 md:mt-[10px] text-[11px] md:text-[12px] font-bold text-gray-700 pb-2">
                    <span className="text-red-500">★{rating.toFixed(1)}</span>
                    <span className="text-gray-300 font-normal">·</span>
                    <span className="text-gray-400">리뷰 {reviewsCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {products.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
              조건에 맞는 상품이 존재하지 않습니다.
          </div>
      )}
    </div>
  );
}
