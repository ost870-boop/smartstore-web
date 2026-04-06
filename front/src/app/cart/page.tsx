"use client";
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  // store의 _hasHydrated를 직접 구독 → 별도 isHydrated state 불필요
  const _hasHydrated = useCartStore(s => s._hasHydrated);
  const items = useCartStore(s => s.items);
  const removeItem = useCartStore(s => s.removeItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const getTotal = useCartStore(s => s.getTotal);
  const router = useRouter();

  // hydration 전엔 아무것도 렌더하지 않음 (로딩 스피너도 제거)
  if (!_hasHydrated) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 mt-10">
        <ShoppingBag size={56} className="mx-auto text-gray-200 mb-6" />
        <p className="text-xl font-bold text-gray-400 mb-3">장바구니가 비어있습니다</p>
        <p className="text-sm text-gray-400 mb-8">마음에 드는 상품을 담아보세요</p>
        <Link href="/" className="bg-gray-900 px-8 py-4 text-white font-bold rounded-xl hover:bg-black transition">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8 pb-32 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
        장바구니 <span className="text-blue-600 text-xl">({items.length})</span>
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {items.map(item => (
          <div key={`${item.productId}-${item.optionId}`}
            className="flex items-start gap-4 p-5 md:p-6">
            {/* 이미지 */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
              }
            </div>

            {/* 상품명 + 옵션 */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2 mb-1">{item.name}</p>
              {item.optionName && (
                <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-medium">
                  {item.optionName}
                </span>
              )}
              {/* 단가 */}
              <p className="text-gray-400 text-xs mt-2">{item.price.toLocaleString()}원 / 개</p>

              {/* 수량 조절 */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.optionId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                  >−</button>
                  <span className="w-10 h-8 flex items-center justify-center text-sm font-bold bg-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.optionId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.optionId)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* 금액 */}
            <div className="text-right flex-shrink-0">
              <p className="font-extrabold text-gray-900 text-lg md:text-xl">
                {(item.price * item.quantity).toLocaleString()}원
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 주문 요약 */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>상품금액</span>
          <span>{getTotal().toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>배송비</span>
          <span className="text-green-600 font-bold">
            {getTotal() >= 50000 ? '무료' : '3,000원'}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <span className="font-bold text-gray-700">총 결제금액</span>
          <span className="font-extrabold text-2xl text-blue-600">
            {(getTotal() + (getTotal() >= 50000 ? 0 : 3000)).toLocaleString()}
            <span className="text-base ml-1 font-bold text-black">원</span>
          </span>
        </div>
        {getTotal() < 50000 && (
          <p className="text-xs text-gray-400 mt-2 text-right">
            {(50000 - getTotal()).toLocaleString()}원 더 담으면 무료배송
          </p>
        )}
      </div>

      <button
        onClick={() => router.push('/checkout')}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-5 rounded-xl text-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all"
      >
        주문하기 ({items.reduce((s, i) => s + i.quantity, 0)}개)
      </button>
      <Link href="/" className="block text-center mt-3 text-sm text-gray-400 hover:text-gray-600 underline">
        쇼핑 계속하기
      </Link>
    </div>
  );
}
