"use client";
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import { useWishStore } from '@/store/useWishStore';
import { useRecentStore } from '@/store/useRecentStore';
import { useSearchStore } from '@/store/useSearchStore';

export default function HomePageContent({ initialProducts, initialCategories, params }: {
  initialProducts: any[];
  initialCategories: any[];
  params: { category?: string; sort?: string; search?: string; material?: string; usage?: string; brand?: string };
}) {
  const toggleItem = useWishStore(s => s.toggleItem);
  const isLiked = useWishStore(s => s.isLiked);
  const wishHydrated = useWishStore(s => s._hasHydrated);
  const { items: recentItems } = useRecentStore();
  const liveQuery = useSearchStore(s => s.liveQuery);

  // ── 통합 파이프라인: 검색 → 정렬 ──────────────────────────
  // 1단계: 검색 필터 (client-side, 즉시 반응)
  //   liveQuery: Navbar onChange마다 업데이트
  //   params.search: URL 파라미터 (Enter 제출, 서버 사전 필터 후 내려온 결과에 추가 적용)
  // 2단계: 정렬 (client-side)
  //   params.sort: URL 정렬 파라미터를 client에서도 동일하게 적용
  //   → 검색 중 정렬 클릭해도 검색 결과 내에서 즉시 정렬

  const activeQuery = liveQuery || params.search || '';

  // 1단계: 검색 필터
  const filteredProducts = activeQuery.trim()
    ? initialProducts.filter(p => {
        const q = activeQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q))
        );
      })
    : initialProducts;

  // 2단계: 정렬 (client-side - URL 파라미터 기준)
  const sortedProducts = (() => {
    const arr = [...filteredProducts];
    if (params.sort === 'price_asc')  return arr.sort((a, b) => a.price - b.price);
    if (params.sort === 'price_desc') return arr.sort((a, b) => b.price - a.price);
    if (params.sort === 'newest')     return arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    // 기본: 인기순 (리뷰 많은 순)
    return arr.sort((a, b) => (b._count?.reviews || 0) - (a._count?.reviews || 0));
  })();

  // ── 가격 표시 헬퍼 ───────────────────────────────────────
  // boxDiscountRate: 박스 구매 시 절감율 (개당 소매가 대비)
  const getBoxDiscount = (p: any) => {
    if (!p.isBoxRate || !p.bulkPrice || !p.boxQuantity) return null;
    const boxUnit = Math.floor(p.bulkPrice / p.boxQuantity);
    const rate = Math.round((1 - boxUnit / p.price) * 100);
    return rate > 0 ? rate : null;
  };

  const ProductCard = (p: any) => {
    const reviewCount = p._count?.reviews || 0;
    const rating = reviewCount > 0 && p.reviews?.length > 0
      ? (p.reviews.reduce((a: number, r: any) => a + r.rating, 0) / p.reviews.length).toFixed(1)
      : null;
    const isSoldOut = p.stock <= 0;
    const boxDiscountRate = getBoxDiscount(p);
    const liked = wishHydrated && isLiked(p.id);

    return (
      <Link href={`/products/${p.id}`} className="group block">
        <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all">
          {/* 이미지 */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {p.imageUrl
              ? <img src={p.imageUrl} alt={p.name} className={`w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'opacity-40 grayscale' : ''}`} />
              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
            }
            {isSoldOut && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded tracking-widest">일시품절</span>
              </div>
            )}
            {boxDiscountRate && !isSoldOut && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                박스{boxDiscountRate}%↓
              </span>
            )}
            {/* 찜 버튼 */}
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); toggleItem(p); }}
              className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
          </div>

          {/* 정보 */}
          <div className="p-3">
            {p.brand && <span className="text-[10px] text-gray-400 font-semibold">{p.brand}</span>}
            <p className={`text-[13px] font-semibold leading-snug line-clamp-2 mt-0.5 ${isSoldOut ? 'text-gray-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
              {p.name}
            </p>

            {/* 가격 */}
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-black tracking-tight ${isSoldOut ? 'text-gray-300' : 'text-gray-900'}`}>
                  {p.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">원</span>
              </div>
              {boxDiscountRate && (
                <div className="text-[11px] text-red-500 font-bold mt-0.5">
                  박스구매 시 {boxDiscountRate}% 할인
                </div>
              )}
            </div>

            {/* 평점 + 리뷰 */}
            {rating && (
              <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-600">{rating}</span>
                <span>({reviewCount})</span>
              </div>
            )}

            {/* 배송 + 재질 */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.price >= 50000 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {p.price >= 50000 ? '무료배송' : '택배 3,000원'}
              </span>
              {p.material && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{p.material}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // ── 섹션 분류 ─────────────────────────────────────────────
  const bestProducts = [...initialProducts]
    .sort((a, b) => (b._count?.reviews || 0) - (a._count?.reviews || 0))
    .slice(0, 8);

  const newProducts = [...initialProducts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  const recommendedProducts = [...initialProducts]
    .filter(p => p.stock > 0)
    .sort((a, b) => {
      const aRate = getBoxDiscount(a) || 0;
      const bRate = getBoxDiscount(b) || 0;
      return bRate - aRate;
    })
    .slice(0, 8);

  // 카테고리별 (최대 3개 카테고리, 각 4개)
  const byCategory = initialCategories.slice(0, 4).map(cat => ({
    category: cat,
    products: initialProducts.filter(p => p.categoryId === cat.id).slice(0, 4)
  })).filter(g => g.products.length > 0);

  const reviewRichProducts = [...initialProducts]
    .filter(p => (p._count?.reviews || 0) >= 1)
    .sort((a, b) => (b._count?.reviews || 0) - (a._count?.reviews || 0))
    .slice(0, 4);

  // 최근 본 상품 (홈 표시용)
  const recentForHome = recentItems.slice(0, 4);

  // 오늘의 특가 (재고 있고 박스할인 가장 큰 상품)
  const todayDeal = [...initialProducts]
    .filter(p => p.stock > 0 && getBoxDiscount(p))
    .sort((a, b) => (getBoxDiscount(b) || 0) - (getBoxDiscount(a) || 0))
    .slice(0, 4);

  const Section = ({ title, products, href }: { title: string; products: any[]; href?: string }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
        {href && <Link href={href} className="text-xs text-gray-400 hover:text-gray-600 underline">전체보기</Link>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map(p => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>
  );

  return (
    <div className="max-w-[1280px] mx-auto pb-20 px-4 mt-4 md:mt-6">

      {/* 히어로 배너 */}
      <div className="-mx-4 md:mx-0 bg-gray-900 rounded-none md:rounded-2xl overflow-hidden relative h-[220px] md:h-[380px] mb-8 group">
        <img
          src="https://plus.unsplash.com/premium_photo-1663100650953-ce20dc681ff5?q=80&w=2600&auto=format&fit=crop"
          alt="배관자재 전문몰"
          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-14">
          <span className="text-amber-400 font-bold tracking-widest text-[10px] md:text-xs mb-2 border border-amber-400 w-max px-2 py-0.5 rounded uppercase">B2B 기업회원 전용</span>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 tracking-tighter">
            현장 직납 배관자재<br />온라인 최저가 도매
          </h1>
          <div className="flex gap-2">
            <Link href="/quote" className="bg-amber-500 text-gray-900 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-xs md:text-sm hover:bg-amber-400 transition inline-block">견적 요청</Link>
            <button className="bg-white/10 text-white border border-white/30 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-xs md:text-sm hover:bg-white/20 transition hidden md:block">카탈로그 다운로드</button>
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        <Link href="/" className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${!params.category ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
          전체
        </Link>
        {initialCategories.map(c => (
          <Link key={c.id} href={`/?category=${c.id}`}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-colors ${params.category === c.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {c.name}
          </Link>
        ))}
      </div>

      {/* 필터 + 정렬 */}
      <FilterBar />
      <div className="flex gap-4 text-[12px] text-gray-400 mb-6 mt-2 overflow-x-auto">
        {[
          { label: '인기순', value: 'popular' },
          { label: '최신순', value: 'newest' },
          { label: '낮은가격', value: 'price_asc' },
          { label: '높은가격', value: 'price_desc' },
        ].map(s => (
          <Link key={s.value}
            href={`/?${new URLSearchParams({ ...params, sort: s.value }).toString()}`}
            className={`whitespace-nowrap font-medium ${params.sort === s.value || (!params.sort && s.value === 'popular') ? 'text-black font-bold underline' : 'hover:text-black'}`}>
            {s.label}
          </Link>
        ))}
        <span className="ml-auto text-gray-400 whitespace-nowrap">총 {activeQuery.trim() ? sortedProducts.length : initialProducts.length}개</span>
      </div>

      {/* 실시간 검색 결과 */}
      {activeQuery.trim() && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-black text-gray-900">'{activeQuery}' 검색결과</h2>
            <span className="text-sm text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{sortedProducts.length}개</span>
            {params.sort && <span className="text-xs text-gray-400">· {params.sort === 'price_asc' ? '낮은가격순' : params.sort === 'price_desc' ? '높은가격순' : params.sort === 'newest' ? '최신순' : '인기순'}</span>}
          </div>
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400">
              <p className="text-base font-medium mb-1">'{activeQuery}'에 대한 검색 결과가 없습니다.</p>
              <p className="text-sm">상품명, 브랜드, 재질로 다시 검색해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {sortedProducts.map(p => <ProductCard key={p.id} {...p} />)}
            </div>
          )}
        </div>
      )}

      {/* 카테고리 필터 결과 */}
      {params.category && !activeQuery.trim() && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-black text-gray-900">
              {initialCategories.find(c => c.id === params.category)?.name}
            </h2>
            <span className="text-sm text-gray-400 font-medium">({sortedProducts.length}개)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {sortedProducts.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>
      )}

      {/* 기본 홈 섹션들 (검색/필터 없을 때) */}
      {!activeQuery.trim() && !params.category && (
        <>
          {/* 최근 본 상품 */}
          {recentForHome.length > 0 && (
            <section className="mb-10">
              <h2 className="text-base font-black text-gray-700 mb-3">최근 본 상품</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {recentForHome.map((r: any) => (
                  <Link key={r.id} href={`/products/${r.id}`} className="flex-shrink-0 w-24 hover:opacity-80 transition-opacity">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden mb-1.5">
                      {r.imageUrl
                        ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover mix-blend-multiply" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">No img</div>
                      }
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium line-clamp-2 leading-snug">{r.name}</p>
                    <p className="text-[11px] font-black text-gray-900 mt-0.5">{r.price?.toLocaleString()}원</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Section title="🔥 베스트 상품" products={bestProducts} />

          {/* 리뷰 강화 섹션 */}
          {reviewRichProducts.length > 0 && (
            <section className="mb-12 bg-yellow-50 rounded-2xl p-5 md:p-6 border border-yellow-100">
              <h2 className="text-lg font-black text-gray-900 mb-1">⭐ 리뷰 많은 검증 상품</h2>
              <p className="text-xs text-gray-400 mb-4">실제 구매자들이 검증한 상품입니다</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {reviewRichProducts.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            </section>
          )}

          {/* 오늘의 특가 */}
          {todayDeal.length > 0 && (
            <section className="mb-12 bg-red-50 rounded-2xl p-5 md:p-6 border border-red-100">
              <h2 className="text-lg font-black text-red-600 mb-1">🔥 오늘의 특가</h2>
              <p className="text-xs text-gray-400 mb-4">박스 구매 시 최대 할인 상품</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {todayDeal.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            </section>
          )}

          <Section title="✨ 신상품" products={newProducts} />
          <Section title="📦 박스할인 추천 상품" products={recommendedProducts} />

          {/* 카테고리별 상품 */}
          {byCategory.map(({ category, products }) => (
            <section key={category.id} className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900">{category.name}</h2>
                <Link href={`/?category=${category.id}`} className="text-xs text-gray-400 hover:text-gray-600 underline">전체보기</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {products.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            </section>
          ))}

          {/* 실시간 리뷰 */}
          <section className="mb-12 bg-gray-50 rounded-2xl p-5 md:p-8 border border-gray-100">
            <h3 className="text-base font-black text-gray-900 mb-4">💬 사업자 고객 실시간 리뷰</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { text: '"현장 단가를 크게 줄였습니다. PVC 배관 상태 좋고 배송도 빠릅니다."', user: '이*비', grade: '파트너사', date: '2026.04.01' },
                { text: '"스텐 부속은 여기가 최고. 박스 단위 할인폭이 엄청납니다!"', user: '박*건', grade: 'S등급 기업회원', date: '2026.03.31' },
                { text: '"불량 하나 없이 꼼꼼하게 포장 출고. 재구매 확정입니다."', user: '김*설', grade: '파트너사', date: '2026.03.30' },
              ].map((r, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100">
                  <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed mb-3">"{r.text}"</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{r.user} ({r.grade})</span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {initialProducts.length === 0 && !activeQuery.trim() && !params.category && (
        <p className="text-center py-20 text-gray-400">상품이 없습니다.</p>
      )}
    </div>
  );
}
