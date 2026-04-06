"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import Cookies from 'js-cookie';
import { CreditCard, Smartphone, Building2, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

type PaymentMethod = 'card' | 'easy' | 'bank';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const _hasHydrated = useCartStore((state) => state._hasHydrated);
  const [price, setPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [address, setAddress] = useState('');
  const [ordererName, setOrdererName] = useState('');
  const [ordererPhone, setOrdererPhone] = useState('');
  const [ordererEmail, setOrdererEmail] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ couponCode: string; discountAmount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const token = typeof window !== 'undefined' ? Cookies.get('token') : null;
  const isGuest = !token;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (items.length === 0) {
      window.location.href = '/';
      return;
    }
    setPrice(getTotal());
  }, [_hasHydrated, items, getTotal]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const total = getTotal();
      const res = await axios.get(`${API}/api/coupons/validate/${couponCode.trim().toUpperCase()}`, {
        params: { amount: total }
      });
      const data = res.data;
      if (data.valid) {
        setCouponApplied({ couponCode: data.couponCode, discountAmount: data.discountAmount });
        setPrice(total - data.discountAmount);
      } else {
        alert(data.message || '유효하지 않은 쿠폰입니다.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '쿠폰 적용에 실패했습니다.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setPrice(getTotal());
  };

  const handlePayment = async () => {
    if (!address) { alert('배송 주소를 입력해주세요.'); return; }
    if (isGuest && !ordererName) { alert('주문자 성함을 입력해주세요.'); return; }
    if (isGuest && !ordererPhone) { alert('연락처를 입력해주세요.'); return; }

    setIsProcessing(true);
    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // 1. 주문 생성
      const orderRes = await axios.post(`${API}/api/orders`, {
        items: items.map(i => ({ productId: i.productId, optionId: i.optionId, quantity: i.quantity })),
        shippingAddress: address,
        couponCode: couponApplied?.couponCode,
        paymentMethod,
        guestName: isGuest ? ordererName : undefined,
        guestPhone: isGuest ? ordererPhone : undefined,
        guestEmail: isGuest ? (ordererEmail || undefined) : undefined,
      }, { headers });

      const { id: orderId } = orderRes.data;

      // 2. 결제 처리
      if (paymentMethod === 'bank') {
        // 무통장입금: PENDING 상태 유지
        clearCart();
        window.location.href = `/order-complete?orderId=${orderId}&amount=${price}&method=bank`;
      } else {
        // 카드/간편결제: 토스페이먼츠 SDK
        const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
        const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
        const widget = await loadPaymentWidget(clientKey, 'ANONYMOUS');

        // 위젯에 결제 금액 설정
        await widget.renderPaymentMethods('#toss-payment-widget', { value: price });

        // 토스 결제 요청 → 성공 시 /success?paymentKey=...&orderId=...&amount=... 로 리다이렉트
        clearCart();
        await widget.requestPayment({
          orderId,
          orderName: items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name,
          customerName: ordererName || '고객',
          customerEmail: ordererEmail || undefined,
          successUrl: `${window.location.origin}/success`,
          failUrl: `${window.location.origin}/fail`,
        });
      }
    } catch (e: any) {
      setIsProcessing(false);
      const msg = e.response?.data?.error || e.message || '결제에 실패했습니다.';
      window.location.href = `/fail?message=${encodeURIComponent(msg)}&code=PAYMENT_ERROR`;
    }
  };

  if (!_hasHydrated) return <div className="p-20 text-center text-gray-500">결제 정보 로딩중...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-4 md:mt-8 pb-20 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 px-1 md:px-2">결제하기</h1>

      {/* 주문 상품 */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 border-b pb-3">주문 상품 정보</h2>
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={`${item.productId}-${item.optionId}`} className="flex justify-between items-start text-sm md:text-lg gap-4">
              <div className="flex flex-col flex-1 leading-snug">
                <span className="text-gray-600 font-medium">{item.name} <span className="text-xs text-gray-400 ml-1">(x{item.quantity})</span></span>
                {item.optionName && <span className="text-xs text-blue-500 mt-1">{item.optionName}</span>}
              </div>
              <span className="font-semibold text-gray-900 whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
        </div>
      </div>

      {/* 주문자 및 배송 정보 */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 border-b pb-3">주문자 및 배송 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={ordererName}
            onChange={e => setOrdererName(e.target.value)}
            placeholder={`주문자 성함 (또는 기업명)${isGuest ? ' *' : ''}`}
            className="w-full p-3 md:p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
          />
          <input
            type="tel"
            value={ordererPhone}
            onChange={e => setOrdererPhone(e.target.value)}
            placeholder={`연락처 (010-0000-0000)${isGuest ? ' *' : ''}`}
            className="w-full p-3 md:p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        {isGuest && (
          <input
            type="email"
            value={ordererEmail}
            onChange={e => setOrdererEmail(e.target.value)}
            placeholder="이메일 (주문 확인용, 선택)"
            className="w-full p-3 md:p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors mb-4"
          />
        )}
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="배송 받으실 상세주소 *"
          className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
        />
      </div>

      {/* 쿠폰 */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 border-b pb-3">쿠폰</h2>
        {couponApplied ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
            <div>
              <span className="font-bold text-green-700">{couponApplied.couponCode}</span>
              <span className="text-green-600 ml-2 text-sm">-{couponApplied.discountAmount.toLocaleString()}원 할인</span>
            </div>
            <button onClick={removeCoupon} className="text-sm text-gray-400 hover:text-red-500 underline">취소</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyCoupon()}
              placeholder="쿠폰 코드 입력"
              className="flex-1 p-3 px-4 border border-gray-300 rounded-xl outline-none bg-gray-50 focus:bg-white focus:border-blue-500"
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading}
              className="px-6 font-bold text-white rounded-xl whitespace-nowrap bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400"
            >
              {couponLoading ? '확인중...' : '적용'}
            </button>
          </div>
        )}
      </div>

      {/* 최종 금액 */}
      <div className="bg-blue-50/50 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100 mb-6 flex justify-between items-end">
        <div>
          <span className="text-gray-600 text-sm md:text-base font-bold block">최종 결제금액</span>
          {couponApplied && (
            <span className="text-xs text-green-600">쿠폰 -{couponApplied.discountAmount.toLocaleString()}원 적용됨</span>
          )}
        </div>
        <span className="text-3xl md:text-4xl text-blue-600 font-extrabold tracking-tighter">
          {price.toLocaleString()}<span className="text-lg md:text-2xl ml-1 text-black font-bold">원</span>
        </span>
      </div>

      {/* 결제수단 선택 */}
      <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 border-b pb-3">결제수단</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'card' as const, label: '카드결제', icon: CreditCard, desc: '신용/체크카드' },
            { key: 'easy' as const, label: '간편결제', icon: Smartphone, desc: '카카오/네이버페이' },
            { key: 'bank' as const, label: '무통장입금', icon: Building2, desc: '가상계좌 발급' },
          ]).map(m => (
            <button key={m.key} onClick={() => setPaymentMethod(m.key)}
              className={`border-2 rounded-xl p-4 text-center transition-all ${paymentMethod === m.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <m.icon size={24} className={`mx-auto mb-2 ${paymentMethod === m.key ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-bold block ${paymentMethod === m.key ? 'text-blue-600' : 'text-gray-700'}`}>{m.label}</span>
              <span className="text-[10px] text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>
        {paymentMethod === 'bank' && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            무통장입금 선택 시 주문 후 가상계좌가 발급됩니다. 입금 확인 후 배송이 시작됩니다.
          </div>
        )}
      </div>

      {/* 토스 결제 위젯 마운트 영역 (카드/간편결제 시 사용) */}
      <div id="toss-payment-widget" className="hidden" />

      {/* 결제 버튼 */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 md:py-5 rounded-xl md:rounded-2xl text-lg md:text-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <><Loader2 size={20} className="animate-spin" /> 결제 처리중...</>
        ) : (
          <>{price.toLocaleString()}원 {paymentMethod === 'bank' ? '주문하기' : '결제하기'}</>
        )}
      </button>
    </div>
  );
}
