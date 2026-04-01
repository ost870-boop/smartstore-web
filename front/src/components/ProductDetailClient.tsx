"use client";
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function ProductDetailClient({ product }: { product: any }) {
    const addItem = useCartStore(state => state.addItem);
    const [selectedOptionId, setSelectedOptionId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('info'); // info, review, qna
    const [mainImage, setMainImage] = useState(product.imageUrl || product.images?.[0]?.url || '');

    const selectedOption = product.options?.find((opt: any) => opt.id === selectedOptionId);
    const finalPrice = product.price + (selectedOption?.additionalPrice || 0);

    const handleAddToCart = () => {
        if (product.options?.length > 0 && !selectedOptionId) {
            alert('옵션을 선택해주세요.');
            return;
        }
        addItem({
            productId: product.id,
            optionId: selectedOptionId || undefined,
            name: product.name,
            optionName: selectedOption ? `${selectedOption.name}: ${selectedOption.value}` : undefined,
            price: finalPrice,
            quantity,
            imageUrl: product.imageUrl
        });
        alert('장바구니에 담겼습니다.');
    };

    return (
        <div className="max-w-[1080px] mx-auto mt-6 md:mt-10 pb-20 px-4 md:px-0">
            {/* Top Info Section */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                {/* Images */}
                <div className="w-full md:w-[500px] flex-shrink-0">
                    <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
                        {mainImage ? (
                            <img src={mainImage} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                        )}
                    </div>
                    {product.images && product.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
                            {product.images.map((img: any) => (
                                <button key={img.id} onClick={() => setMainImage(img.url)} className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 ${mainImage === img.url ? 'border-blue-500' : 'border-transparent'}`}>
                                    <img src={img.url} className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details & Cart box */}
                <div className="w-full flex-1 flex flex-col">
                    <div className="text-gray-500 text-sm mb-2">{product.category?.name || '분류 없음'}</div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-3 mb-6">
                        <span className="text-red-500 font-bold">★ {product._count?.reviews > 0 ? '5.0' : '0.0'}</span>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setActiveTab('review')} className="text-gray-500 text-sm underline">리뷰 {product.reviews?.length || 0}건</button>
                    </div>

                    <div className="border-b-2 border-black pb-4 mb-6">
                        {product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through mr-2">{product.originalPrice.toLocaleString()}원</span>
                        )}
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">{product.price.toLocaleString()}</span>
                        <span className="text-xl font-bold text-gray-900 ml-1">원</span>
                    </div>

                    {/* Options */}
                    {product.options && product.options.length > 0 && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">옵션 선택</label>
                            <select 
                                className="w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                value={selectedOptionId}
                                onChange={(e) => setSelectedOptionId(e.target.value)}
                            >
                                <option value="">[선택] 옵션을 선택해주세요</option>
                                {product.options.map((opt: any) => (
                                    <option key={opt.id} value={opt.id} disabled={opt.stock <= 0}>
                                        {opt.name}: {opt.value} {opt.additionalPrice > 0 ? `(+${opt.additionalPrice}원)` : ''} {opt.stock <= 0 ? '(품절)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quantity & Order */}
                    <div className="mt-auto">
                        <div className="flex justify-between items-center bg-gray-50 p-4 border-y border-gray-200 mb-6">
                            <span className="text-sm font-bold text-gray-700">수량</span>
                            <div className="flex items-center">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white text-gray-600 rounded-l">-</button>
                                <input type="number" value={quantity} readOnly className="w-12 h-8 text-center border-y border-gray-300 bg-white text-sm outline-none" />
                                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center border border-gray-300 bg-white text-gray-600 rounded-r">+</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-base font-bold text-gray-600">총 상품 금액</span>
                            <span className="text-3xl font-black text-blue-600 tracking-tighter">{(finalPrice * quantity).toLocaleString()}<span className="text-xl ml-1 text-black font-bold">원</span></span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAddToCart} className="flex-1 bg-white border border-blue-600 text-blue-600 font-bold py-4 rounded-lg text-lg hover:bg-blue-50 transition-colors">장바구니</button>
                            <button onClick={() => { handleAddToCart(); window.location.href = '/checkout'; }} className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg">바로구매</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-20 border-b border-gray-200 flex">
                <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 font-bold text-base border-b-[3px] transition-colors ${activeTab === 'info' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>상세정보</button>
                <button onClick={() => setActiveTab('review')} className={`flex-1 py-4 font-bold text-base border-b-[3px] transition-colors ${activeTab === 'review' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>리뷰 ({product.reviews?.length || 0})</button>
                <button onClick={() => setActiveTab('qna')} className={`flex-1 py-4 font-bold text-base border-b-[3px] transition-colors ${activeTab === 'qna' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Q&A ({product.qnas?.length || 0})</button>
            </div>

            {/* Tab Contents */}
            <div className="py-10 min-h-[400px]">
                {activeTab === 'info' && (
                    <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap max-w-3xl mx-auto">
                        {product.description}
                    </div>
                )}
                {activeTab === 'review' && (
                    <div className="max-w-3xl mx-auto">
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="space-y-6 flex flex-col">
                                {product.reviews.map((r: any) => (
                                    <div key={r.id} className="border-b pb-6">
                                        <div className="flex gap-2 items-center mb-2">
                                            <span className="text-red-500 font-bold text-sm">기존 평점: {r.rating}점</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500 text-sm font-medium">{r.user?.name || '익명'}</span>
                                            <span className="text-gray-400 text-xs ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-800">{r.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-10">등록된 리뷰가 없습니다.</div>
                        )}
                    </div>
                )}
                {activeTab === 'qna' && (
                    <div className="max-w-3xl mx-auto text-center text-gray-400 py-10">
                        등록된 Q&A가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
