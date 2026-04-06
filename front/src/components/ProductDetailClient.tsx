"use client";
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishStore } from '@/store/useWishStore';
import { useRecentStore } from '@/store/useRecentStore';
import { Heart, ShoppingCart, Zap, Package } from 'lucide-react';
import Link from 'next/link';
import { BlockRenderer } from '@/components/BlockEditor';

export default function ProductDetailClient({ product }: { product: any }) {
    const addItem = useCartStore(s => s.addItem);
    const cartHydrated = useCartStore(s => s._hasHydrated);
    const wishHydrated = useWishStore(s => s._hasHydrated);
    const toggleItem = useWishStore(s => s.toggleItem);
    const isLiked = useWishStore(s => s.isLiked);
    const { items: recentItems } = useRecentStore();

    const [selectedOptionId, setSelectedOptionId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'info'|'review'|'qna'>('info');
    const [mainImage, setMainImage] = useState(product.imageUrl || product.images?.[0]?.url || '');
    const [added, setAdded] = useState(false);

    // 찜 상태: wishStore hydration 완료 후 정확한 값 반영
    const [liked, setLiked] = useState(false);
    useEffect(() => {
        if (wishHydrated) setLiked(isLiked(product.id));
    }, [wishHydrated, product.id]);

    // 최근 본 상품 등록
    useEffect(() => {
        useRecentStore.getState().addRecent({
            id: product.id,
            name: product.name,
            price: product.price,
            bulkPrice: product.bulkPrice,
            boxQuantity: product.boxQuantity,
            imageUrl: product.imageUrl || product.images?.[0]?.url,
            category: product.category?.name,
        });
    }, [product.id]);

    // ── 가격 계산 ──────────────────────────────────────────
    // price      = 소매 단가 (1개 구매 시)
    // bulkPrice  = 박스 전체 금액 (boxQuantity개)
    // 박스 개당가 = bulkPrice / boxQuantity
    // 박스 할인율 = (1 - 박스개당가/price) * 100
    const selectedOption = product.options?.find((o: any) => o.id === selectedOptionId);
    const salePrice = product.price + (selectedOption?.additionalPrice || 0);
    const boxUnitPrice = product.isBoxRate && product.bulkPrice && product.boxQuantity
        ? Math.floor(product.bulkPrice / product.boxQuantity)
        : null;
    const boxDiscountRate = boxUnitPrice
        ? Math.round((1 - boxUnitPrice / salePrice) * 100)
        : 0;

    const averageRating = product.reviews?.length > 0
        ? (product.reviews.reduce((a: number, r: any) => a + r.rating, 0) / product.reviews.length).toFixed(1)
        : '0.0';
    const reviewCount = product.reviews?.length || 0;

    const handleAddToCart = (goCheckout = false) => {
        if (product.options?.length > 0 && !selectedOptionId) {
            alert('옵션을 선택해주세요.');
            return;
        }
        addItem({
            productId: product.id,
            optionId: selectedOptionId || undefined,
            name: product.name,
            optionName: selectedOption ? `${selectedOption.name}: ${selectedOption.value}` : undefined,
            price: salePrice,
            quantity,
            imageUrl: product.imageUrl || product.images?.[0]?.url,
        });
        if (goCheckout) {
            window.location.href = '/checkout';
        } else {
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        }
    };

    const handleLike = () => {
        toggleItem(product);
        setLiked(!liked);
    };

    // 최근 본 상품 (현재 상품 제외)
    const relatedRecent = recentItems.filter((r: any) => r.id !== product.id).slice(0, 4);

    return (
        <div className="max-w-[1080px] mx-auto mt-6 md:mt-10 pb-32 px-4 md:px-0">
            {/* 상품 상세 */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* 이미지 */}
                <div className="w-full md:w-[480px] flex-shrink-0">
                    <div className="aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
                        {mainImage
                            ? <img src={mainImage} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        }
                    </div>
                    {product.images?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto py-1">
                            {product.images.map((img: any) => (
                                <button key={img.id} onClick={() => setMainImage(img.url)}
                                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-colors ${mainImage === img.url ? 'border-blue-500' : 'border-gray-100 hover:border-gray-300'}`}>
                                    <img src={img.url} className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 정보 + 구매 */}
                <div className="flex-1">
                    {/* 카테고리/브랜드 */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                        <span>{product.category?.name}</span>
                        {product.brand && <><span>·</span><span className="bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-600">{product.brand}</span></>}
                        {product.material && <><span>·</span><span>{product.material}</span></>}
                    </div>

                    {/* 뱃지 */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.isBoxRate && <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded border border-red-200">박스단가 할인</span>}
                        {product.stock <= 5 && product.stock > 0 && <span className="text-[11px] bg-orange-50 text-orange-600 font-bold px-2 py-1 rounded border border-orange-200">재고 {product.stock}개</span>}
                        {product.stock <= 0 && <span className="text-[11px] bg-gray-800 text-white font-bold px-2 py-1 rounded">일시품절</span>}
                        {product.stock > 0 && <span className="text-[11px] bg-green-50 text-green-600 border border-green-200 font-bold px-2 py-1 rounded">당일오후출발</span>}
                    </div>

                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-3">{product.name}</h1>

                    {/* 평점 */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="flex text-yellow-400 text-sm">
                            {'★'.repeat(Math.round(Number(averageRating)))}{'☆'.repeat(5 - Math.round(Number(averageRating)))}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{averageRating}</span>
                        <button onClick={() => setActiveTab('review')} className="text-xs text-gray-400 underline">리뷰 {reviewCount}건</button>
                    </div>

                    {/* ── 가격 구조 ──────────────────────── */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                        {/* 소매가 */}
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm text-gray-500">소매가</span>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">{salePrice.toLocaleString()}원</span>
                            <span className="text-xs text-gray-400">/ 1개</span>
                        </div>

                        {/* 박스 도매가 (있을 때만) */}
                        {boxUnitPrice && (
                            <div className="flex items-center gap-2 mt-2 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                                <Package size={14} className="text-red-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <span className="text-xs text-red-600 font-bold">박스({product.boxQuantity}개) 구매 시</span>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <span className="text-lg font-extrabold text-red-600">{boxUnitPrice.toLocaleString()}원</span>
                                        <span className="text-xs text-red-400">/ 1개</span>
                                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold ml-1">{boxDiscountRate}% 할인</span>
                                    </div>
                                    <span className="text-xs text-red-400">박스 합계: {product.bulkPrice.toLocaleString()}원</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 옵션 선택 */}
                    {product.options?.length > 0 && (
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">옵션 선택</label>
                            <select
                                value={selectedOptionId}
                                onChange={e => setSelectedOptionId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="">옵션을 선택해주세요</option>
                                {product.options.map((opt: any) => (
                                    <option key={opt.id} value={opt.id} disabled={opt.stock <= 0}>
                                        {opt.name}: {opt.value}
                                        {opt.additionalPrice > 0 ? ` (+${opt.additionalPrice.toLocaleString()}원)` : ''}
                                        {opt.stock <= 0 ? ' (품절)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 수량 */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-5 border border-gray-100">
                        <span className="text-sm font-bold text-gray-600">구매 수량</span>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold">−</button>
                            <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold">+</button>
                        </div>
                    </div>

                    {/* 총 금액 */}
                    <div className="flex justify-between items-center mb-5">
                        <span className="font-bold text-gray-600">총 상품금액</span>
                        <span className="text-2xl font-black text-blue-600 tracking-tighter">
                            {(salePrice * quantity).toLocaleString()}<span className="text-base font-bold text-black ml-1">원</span>
                        </span>
                    </div>

                    {/* 구매 버튼 */}
                    <div className="flex gap-2 mb-3">
                        <button onClick={handleLike}
                            className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-colors ${liked ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                        </button>
                        <button
                            onClick={() => handleAddToCart(false)}
                            disabled={product.stock <= 0}
                            className={`flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors disabled:opacity-40 ${added ? 'bg-blue-600 text-white border-blue-600' : ''}`}
                        >
                            <ShoppingCart size={16} />
                            {added ? '담겼습니다!' : '장바구니'}
                        </button>
                        <button
                            onClick={() => handleAddToCart(true)}
                            disabled={product.stock <= 0}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-40"
                        >
                            <Zap size={16} />
                            바로 구매
                        </button>
                    </div>

                    <Link
                        href="/quote"
                        className="block w-full bg-gray-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-900 transition-colors text-center"
                    >
                        대량구매·도매 견적서 요청 (기업회원)
                    </Link>

                    {/* 장바구니 바로가기 (담은 후) */}
                    {added && cartHydrated && (
                        <Link href="/cart"
                            className="block text-center mt-3 text-sm text-blue-600 underline font-bold">
                            장바구니 바로가기 →
                        </Link>
                    )}
                </div>
            </div>

            {/* 탭 */}
            <div className="mt-16 border-b border-gray-200 flex">
                {(['info', 'review', 'qna'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 font-bold text-sm md:text-base border-b-[3px] transition-colors ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'info' ? '상세정보' : tab === 'review' ? `리뷰 (${reviewCount})` : `Q&A (${product.qnas?.length || 0})`}
                    </button>
                ))}
            </div>

            <div className="py-10 min-h-[300px]">
                {activeTab === 'info' && (
                    <div className="max-w-3xl mx-auto">
                        {/* 블록 에디터 콘텐츠 (관리자가 작성한 상세설명) */}
                        {product.descriptionBlocks?.length > 0 ? (
                            <div className="mb-10 border-b pb-10">
                                <BlockRenderer blocks={product.descriptionBlocks} />
                            </div>
                        ) : (
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-10 text-base border-b pb-10">{product.description}</p>
                        )}
                        {product.images?.length > 0 && (
                            <div className="flex flex-col gap-3 mb-12">
                                {product.images.map((img: any) => (
                                    <img key={img.id} src={img.url} alt="상세" className="w-full max-w-xl mx-auto object-contain rounded-lg border border-gray-100" loading="lazy" />
                                ))}
                            </div>
                        )}
                        {/* 배송/반품 안내 (블록에 shipping 타입이 없을 때만 기본 표시) */}
                        {!product.descriptionBlocks?.some((b: any) => b.type === 'shipping') && (
                            <div className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600 space-y-4 border border-gray-100">
                                <p><strong className="text-gray-900">배송 안내</strong><br />기본 택배비 3,000원 · 50,000원 이상 무료배송 · 평일 오후 2시 이전 결제 시 당일 출고</p>
                                <p><strong className="text-gray-900">대량/화물 배송</strong><br />박스 단위 대량 주문 시 화물 배송으로 변경될 수 있으며 추가 운임이 발생할 수 있습니다.</p>
                                <p><strong className="text-gray-900">교환/반품</strong><br />체결된 부속 및 개봉 제품은 반품 불가 · 단순 변심 시 왕복 택배비 6,000원 청구</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'review' && (
                    <div className="max-w-3xl mx-auto">
                        {/* 평점 요약 */}
                        {reviewCount > 0 && (
                            <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-gray-900">{averageRating}</div>
                                    <div className="text-yellow-400 text-xl mt-1">{'★'.repeat(Math.round(Number(averageRating)))}</div>
                                    <div className="text-xs text-gray-400 mt-1">{reviewCount}개 리뷰</div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    {[5,4,3,2,1].map(star => {
                                        const cnt = product.reviews.filter((r: any) => Math.round(r.rating) === star).length;
                                        const pct = reviewCount > 0 ? (cnt / reviewCount) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                <span className="w-6 text-gray-500">{star}★</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="w-6 text-gray-400 text-right">{cnt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {reviewCount > 0 ? (
                            <div className="space-y-5">
                                {product.reviews.map((r: any) => (
                                    <div key={r.id} className="border-b pb-5 last:border-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-yellow-400 font-bold text-sm tracking-wider">{'★'.repeat(Math.round(r.rating))}{'☆'.repeat(5 - Math.round(r.rating))}</span>
                                            <span className="text-gray-500 text-sm font-medium">
                                                {r.user?.name ? r.user.name[0] + '*' + (r.user.name.length > 2 ? r.user.name.slice(2) : '') : '익명'}
                                            </span>
                                            <span className="text-gray-300 text-xs ml-auto">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm">{r.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                <p className="font-medium mb-2">아직 리뷰가 없습니다</p>
                                <p className="text-sm">구매 후 첫 리뷰를 남겨주세요</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'qna' && (
                    <div className="max-w-3xl mx-auto text-center text-gray-400 py-12">
                        <p className="font-medium">등록된 Q&A가 없습니다</p>
                    </div>
                )}
            </div>

            {/* 최근 본 상품 */}
            {relatedRecent.length > 0 && (
                <div className="mt-6 border-t pt-8">
                    <h3 className="font-bold text-gray-900 mb-4">최근 본 상품</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {relatedRecent.map((r: any) => (
                            <Link key={r.id} href={`/products/${r.id}`}
                                className="flex-shrink-0 w-28 hover:opacity-80 transition-opacity">
                                <div className="w-28 h-28 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden mb-2">
                                    {r.imageUrl
                                        ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover mix-blend-multiply" />
                                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                    }
                                </div>
                                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{r.name}</p>
                                <p className="text-xs font-bold text-gray-900 mt-1">{r.price?.toLocaleString()}원</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 모바일 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 md:hidden z-50 pb-safe">
                <button onClick={handleLike}
                    className={`w-12 h-12 flex items-center justify-center border rounded-xl flex-shrink-0 ${liked ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
                <button onClick={() => handleAddToCart(false)}
                    disabled={product.stock <= 0}
                    className="flex-1 border border-blue-600 text-blue-600 font-bold rounded-xl text-sm disabled:opacity-40">
                    장바구니
                </button>
                <button onClick={() => handleAddToCart(true)}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg disabled:opacity-40">
                    바로 구매
                </button>
            </div>
        </div>
    );
}
