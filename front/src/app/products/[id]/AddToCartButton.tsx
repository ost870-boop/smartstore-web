"use client";
import { useCartStore } from '@/store/useCartStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);
  const router = useRouter();

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    const go = confirm('장바구니에 추가되었습니다! 장바구니로 이동하시겠습니까?');
    if (go) router.push('/cart');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <label className="text-gray-500 font-medium">구매 수량</label>
        <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-lg font-medium text-gray-600">-</button>
          <span className="px-6 py-3 bg-white text-center w-20 font-semibold">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-lg font-medium text-gray-600">+</button>
        </div>
      </div>
      
      <button 
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-5 rounded-2xl transition-all duration-200 text-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:shadow-none"
      >
        {product.stock === 0 ? '품절된 상품입니다' : '장바구니 담기'}
      </button>
    </div>
  );
}
