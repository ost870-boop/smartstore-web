"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import Cookies from 'js-cookie';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);
  const [price, setPrice] = useState(getTotal());
  const [paymentWidget, setPaymentWidget] = useState<any>(null);
  
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      window.location.href = '/';
      return;
    }
    
    setPrice(getTotal()); // Reset initial price on load

    const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
    loadPaymentWidget(clientKey, 'ANONYMOUS').then(widget => {
      setPaymentWidget(widget);
      widget.renderPaymentMethods('#payment-widget', { value: price });
      widget.renderAgreement('#agreement', { variantKey: 'AGREEMENT' });
    });
  }, [items]);

  // Handle re-render payment amount on price change 
  useEffect(() => {
      if (paymentWidget) {
          paymentWidget.updateAmount(price);
      }
  }, [price, paymentWidget]);

  const applyCoupon = () => {
      if (couponCode === 'OPEN2024') {
          if (!isCouponApplied) {
              setPrice(prev => Math.max(0, Math.floor(prev * 0.9)));
              setIsCouponApplied(true);
              alert('쿠폰이 적용되었습니다!');
          }
      } else {
          alert('존재하지 않는 쿠폰입니다.');
      }
  };

  const handlePayment = async () => {
    try {
      if (!address) {
          alert('배송 정보를 입력해주세요.');
          return;
      }

      const token = Cookies.get('token');
      if (!token) throw new Error('Authentication required');

      const orderRes = await axios.post('/api/orders', {
        items: items.map(i => ({ productId: i.productId, optionId: i.optionId, quantity: i.quantity })),
        shippingAddress: address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { id: orderId } = orderRes.data;

      await paymentWidget.requestPayment({
        orderId,
        orderName: `${items[0].name} 외 ${items.length - 1}건`,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });

      clearCart();
    } catch (e: any) {
      alert(e.message || '결제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 md:mt-8 pb-20 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 px-1 md:px-2">결제하기</h1>
      
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-800 border-b pb-3 md:pb-4">주문 상품 정보</h2>
        <div className="flex flex-col gap-3 md:gap-4">
          {items.map(item => (
            <div key={`${item.productId}-${item.optionId}`} className="flex justify-between items-start md:items-center text-sm md:text-lg gap-4">
              <div className="flex flex-col flex-1 leading-snug">
                  <span className="text-gray-600 font-medium">{item.name} <span className="text-xs md:text-sm text-gray-400 ml-1 whitespace-nowrap">(x{item.quantity})</span></span>
                  {item.optionName && <span className="text-xs text-blue-500 mt-1">{item.optionName}</span>}
              </div>
              <span className="font-semibold text-gray-900 whitespace-nowrap pt-1 flex-shrink-0">{(item.price * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-800 border-b pb-3 md:pb-4">배송 정보</h2>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="배송 받으실 상세주소를 입력해주세요" className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors" />
      </div>

      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-800 border-b pb-3 md:pb-4">쿠폰 / 포인트</h2>
        <div className="flex gap-2">
           <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="쿠폰 코드를 입력하세요 (예: OPEN2024)" className="flex-1 p-3 px-4 border border-gray-300 rounded-xl outline-none bg-gray-50 focus:bg-white focus:border-blue-500" disabled={isCouponApplied} />
           <button onClick={applyCoupon} disabled={isCouponApplied} className={`px-6 font-bold text-white rounded-xl whitespace-nowrap ${isCouponApplied ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}>
               {isCouponApplied ? '적용됨' : '적용'}
           </button>
        </div>
      </div>

      <div className="bg-blue-50/50 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100 mb-6 md:mb-8 flex justify-between items-end">
          <span className="text-gray-600 text-sm md:text-base font-bold">최종 결제금액</span>
          <span className="text-3xl md:text-4xl text-blue-600 font-extrabold tracking-tighter">{price.toLocaleString()}<span className="text-lg md:text-2xl ml-1 text-black font-bold">원</span></span>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-gray-900">
        <div className="p-0 md:p-4 bg-[#f9fafb]">
          <div id="payment-widget" className="w-full" />
          <div id="agreement" className="w-full mt-2" />
        </div>
        
        <div className="p-5 md:p-8 pt-4 bg-white border-t border-gray-100">
          <button 
            onClick={handlePayment} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:-translate-y-0.5"
          >
            {price.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
