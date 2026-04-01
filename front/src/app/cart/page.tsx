"use client";
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, getTotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    if (!Cookies.get('token')) {
      alert('비회원은 결제할 수 없습니다. 로그인 페이지로 이동합니다.');
      router.push('/login?redirect=/cart');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24 mt-10 bg-white rounded-3xl border border-dashed border-gray-300">
        <p className="text-xl text-gray-500 mb-8">장바구니가 비어있습니다.</p>
        <Link href="/" className="bg-gray-900 px-8 py-4 text-white font-bold rounded-xl hover:bg-black transition">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 md:mt-8 pb-20 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 px-1 md:px-2">장바구니</h1>
      
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8 flex flex-col gap-6 md:gap-8">
        {items.map(item => (
          <div key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 border-b pb-6 md:pb-8 last:border-0 last:pb-0">
            <div className="flex gap-4 w-full sm:w-auto flex-1">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 p-1 relative">
                {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-base md:text-xl text-gray-900 leading-tight line-clamp-2 md:mb-1">{item.name}</h3>
                {item.optionName && <p className="text-[11px] md:text-xs text-blue-600 mt-1 font-semibold border border-blue-200 bg-blue-50 px-2 py-1 inline-block rounded-md">{item.optionName}</p>}
                <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">{item.price.toLocaleString()}원 <span className="text-gray-300 mx-1 md:mx-2">|</span> {item.quantity}개</p>
              </div>
            </div>
            
            <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 border-dashed sm:border-solid">
              <p className="font-extrabold text-lg md:text-2xl text-gray-900">{(item.price * item.quantity).toLocaleString()}원</p>
              <button onClick={() => removeItem(item.productId, item.optionId)} className="mt-0 sm:mt-3 text-red-500 hover:text-red-700 transition-colors flex items-center justify-end gap-1 text-[13px] md:text-sm font-semibold p-2 -mr-2 rounded-lg hover:bg-red-50">
                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" /> 삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 md:mt-10 bg-blue-50/30 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-blue-100">
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <span className="font-semibold text-gray-500 text-sm md:text-lg">총 결제예상금액</span>
          <span className="font-extrabold text-2xl md:text-4xl text-blue-600">{getTotal().toLocaleString()}<span className="text-lg md:text-2xl ml-1">원</span></span>
        </div>
        <button 
          onClick={handleCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:-translate-y-0.5"
        >
          주문하기
        </button>
      </div>
    </div>
  );
}
