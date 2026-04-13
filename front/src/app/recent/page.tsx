"use client";
import Link from 'next/link';
import { useRecentStore } from '@/store/useRecentStore';
import { useCartStore } from '@/store/useCartStore';
import { Clock, ShoppingCart, Trash2 } from 'lucide-react';

export default function RecentPage() {
    const { items, clearRecent } = useRecentStore();
    const addItem = useCartStore(s => s.addItem);
    const recentHydrated = useRecentStore(s => s._hasHydrated);
    const cartHydrated = useCartStore(s => s._hasHydrated);

    if (!recentHydrated || !cartHydrated) return null;

    const handleAddToCart = (item: any) => {
        addItem({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl,
        });
        alert('장바구니에 담겼습니다.');
    };

    return (
        <div className="max-w-[1080px] mx-auto py-8 md:py-12 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Clock size={24} className="text-gray-500" />
                    <h1 className="text-2xl font-black text-gray-900">최근 본 상품</h1>
                    <span className="text-sm text-gray-400 font-medium">({items.length}개)</span>
                </div>
                {items.length > 0 && (
                    <button onClick={() => clearRecent()} className="text-xs text-gray-400 hover:text-red-500 underline">전체 삭제</button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
                    <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium mb-2">최근 본 상품이 없습니다.</p>
                    <Link href="/" className="text-sm text-blue-600 underline font-bold">상품 둘러보기</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {items.map((item: any) => (
                        <div key={item.id} className="relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            <Link href={`/products/${item.id}`}>
                                <div className="aspect-square bg-gray-50 overflow-hidden">
                                    {item.imageUrl
                                        ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                                    }
                                </div>
                            </Link>

                            <div className="p-3">
                                {item.category && <span className="text-[10px] text-gray-400 font-semibold">{item.category}</span>}
                                <Link href={`/products/${item.id}`}>
                                    <p className="text-[13px] font-semibold leading-snug line-clamp-2 mt-0.5 text-gray-800 group-hover:text-blue-600">{item.name}</p>
                                </Link>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-base font-black text-gray-900">{item.price?.toLocaleString()}</span>
                                    <span className="text-xs text-gray-500">원</span>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">
                                    {new Date(item.viewedAt).toLocaleDateString('ko-KR')} 조회
                                </div>

                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                                >
                                    <ShoppingCart size={12} /> 장바구니 담기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
