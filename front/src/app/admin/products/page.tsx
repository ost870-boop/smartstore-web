"use client";
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import Cookies from 'js-cookie';
import BlockEditor, { Block, BlockRenderer } from '@/components/BlockEditor';
import ImageUploader from '@/components/ImageUploader';

type Tab = 'basic' | 'images' | 'detail' | 'preview';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [descBlocks, setDescBlocks] = useState<Block[]>([]);
    const [tab, setTab] = useState<Tab>('basic');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [detailUrls, setDetailUrls] = useState<string[]>([]);

    const defaultForm = { name: '', price: 0, originalPrice: 0, stock: 100, categoryId: '', description: '-', brand: '', material: '', usage: '', isBoxRate: false, boxQuantity: 0, bulkPrice: 0 };
    const [formData, setFormData] = useState(defaultForm);

    const token = Cookies.get('token');
    const hdrs: Record<string, string> = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchProducts = () => {
        fetch('/api/products').then(r => r.json()).then(setProducts).catch(console.error);
    };
    useEffect(() => {
        fetchProducts();
        fetch('/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE', headers: hdrs });
            setProducts(products.filter(p => p.id !== id));
        } catch { alert('삭제 실패'); }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { alert('상품명을 입력해주세요.'); setTab('basic'); return; }
        try {
            const imagesText = detailUrls.join(',');
            const payload = {
                ...formData,
                imageUrl: thumbnailUrl,
                imagesText,
                categoryId: formData.categoryId || categories[0]?.id,
                descriptionBlocks: descBlocks.length > 0 ? descBlocks : undefined,
                originalPrice: formData.originalPrice || undefined,
                isBoxRate: formData.isBoxRate || undefined,
                boxQuantity: formData.boxQuantity || undefined,
                bulkPrice: formData.bulkPrice || undefined,
            };
            const url = editItem ? `/api/products/${editItem.id}` : '/api/products';
            await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: hdrs, body: JSON.stringify(payload) });
            setIsModalOpen(false);
            fetchProducts();
        } catch { alert('저장 실패'); }
    };

    const openModal = (item?: any) => {
        setTab('basic');
        if (item) {
            setEditItem(item);
            setFormData({
                name: item.name, price: item.price, originalPrice: item.originalPrice || 0,
                stock: item.stock, categoryId: item.categoryId || '',
                description: item.description || '-', brand: item.brand || '', material: item.material || '', usage: item.usage || '',
                isBoxRate: item.isBoxRate || false, boxQuantity: item.boxQuantity || 0, bulkPrice: item.bulkPrice || 0,
            });
            setThumbnailUrl(item.imageUrl || '');
            setDetailUrls(item.images?.map((img: any) => img.url) || []);
            setDescBlocks(item.descriptionBlocks || []);
        } else {
            setEditItem(null);
            setFormData({ ...defaultForm, categoryId: categories[0]?.id || '' });
            setThumbnailUrl('');
            setDetailUrls([]);
            setDescBlocks([]);
        }
        setIsModalOpen(true);
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: 'basic', label: '기본정보' },
        { key: 'images', label: '이미지' },
        { key: 'detail', label: '상세설명' },
        { key: 'preview', label: '미리보기' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">상품 관리</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 flex items-center gap-1 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700">
                    <Plus size={16}/> 새 상품 등록
                </button>
            </div>

            {/* 상품 테이블 */}
            <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                            <tr>
                                <th className="py-3 px-4">이미지</th>
                                <th className="py-3 px-4">분류</th>
                                <th className="py-3 px-4">상품명</th>
                                <th className="py-3 px-4">판매가</th>
                                <th className="py-3 px-4">재고</th>
                                <th className="py-3 px-4 text-center">상세</th>
                                <th className="py-3 px-4 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">
                                        {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover rounded border" />
                                            : <div className="w-10 h-10 bg-gray-100 rounded text-gray-300 text-[10px] flex items-center justify-center">N/A</div>}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-xs font-semibold">{p.category?.name}</td>
                                    <td className="py-3 px-4 font-bold text-gray-800 truncate max-w-[200px]">{p.name}</td>
                                    <td className="py-3 px-4 font-semibold text-blue-600">{p.price?.toLocaleString()}원</td>
                                    <td className="py-3 px-4">{p.stock}</td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {p.images?.length > 0 && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{p.images.length}img</span>}
                                            {p.descriptionBlocks?.length > 0 && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{p.descriptionBlocks.length}blk</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => openModal(p)} className="text-slate-400 hover:text-blue-500 p-1"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-1 ml-1"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 상품 등록/수정 모달 (4탭) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl max-h-[95vh] flex flex-col">
                        {/* 헤더 */}
                        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-800">{editItem ? '상품 수정' : '새 상품 등록'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        {/* 탭 */}
                        <div className="flex border-b flex-shrink-0">
                            {TABS.map(t => (
                                <button key={t.key} onClick={() => setTab(t.key)}
                                    className={`flex-1 py-3 text-sm font-bold transition-colors relative ${tab === t.key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {t.label}
                                    {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                                </button>
                            ))}
                        </div>

                        {/* 탭 내용 */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* 기본정보 */}
                            {tab === 'basic' && (
                                <div className="flex flex-col gap-4 max-w-2xl">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">분류 *</label>
                                            <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm bg-white">
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">상품명 *</label>
                                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" placeholder="예: 무소음 PVC 배관 25A" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">판매가 (원) *</label>
                                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">정가 (원)</label>
                                            <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" placeholder="할인 전 가격" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">재고 *</label>
                                            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">브랜드</label>
                                            <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" placeholder="KS배관" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">재질</label>
                                            <input type="text" value={formData.material} onChange={e => setFormData({ ...formData, material: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" placeholder="스텐(STS)" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-700 mb-1">용도</label>
                                            <input type="text" value={formData.usage} onChange={e => setFormData({ ...formData, usage: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" placeholder="수도용" />
                                        </div>
                                    </div>
                                    <div className="border rounded-xl p-4 bg-gray-50">
                                        <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                            <input type="checkbox" checked={formData.isBoxRate} onChange={e => setFormData({ ...formData, isBoxRate: e.target.checked })} className="rounded" />
                                            <span className="text-xs font-bold text-gray-700">박스 단위 할인 적용</span>
                                        </label>
                                        {formData.isBoxRate && (
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1">박스 수량 (개)</label>
                                                    <input type="number" value={formData.boxQuantity} onChange={e => setFormData({ ...formData, boxQuantity: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 mb-1">박스 합계 (원)</label>
                                                    <input type="number" value={formData.bulkPrice} onChange={e => setFormData({ ...formData, bulkPrice: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 outline-none text-sm" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 이미지 관리 */}
                            {tab === 'images' && (
                                <ImageUploader
                                    thumbnailUrl={thumbnailUrl}
                                    detailUrls={detailUrls}
                                    onThumbnailChange={setThumbnailUrl}
                                    onDetailUrlsChange={setDetailUrls}
                                />
                            )}

                            {/* 상세설명 블록 에디터 */}
                            {tab === 'detail' && (
                                <BlockEditor blocks={descBlocks} onChange={setDescBlocks} />
                            )}

                            {/* 미리보기 */}
                            {tab === 'preview' && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                                        <Eye size={16} className="text-blue-500" />
                                        <span className="text-sm text-blue-700 font-medium">사용자에게 보이는 상세페이지 미리보기입니다.</span>
                                    </div>

                                    {/* 대표이미지 */}
                                    {thumbnailUrl && (
                                        <div className="aspect-square max-w-xs bg-gray-50 rounded-xl border overflow-hidden mb-4">
                                            <img src={thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* 상품명 + 가격 */}
                                    <h1 className="text-xl font-extrabold text-gray-900 mb-2">{formData.name || '상품명 미입력'}</h1>
                                    <div className="flex items-baseline gap-2 mb-6">
                                        {formData.originalPrice > 0 && formData.originalPrice > formData.price && (
                                            <span className="text-sm text-gray-400 line-through">{formData.originalPrice.toLocaleString()}원</span>
                                        )}
                                        <span className="text-2xl font-black text-gray-900">{formData.price.toLocaleString()}원</span>
                                        {formData.originalPrice > 0 && formData.originalPrice > formData.price && (
                                            <span className="text-sm font-bold text-red-500">{Math.round((1 - formData.price / formData.originalPrice) * 100)}%</span>
                                        )}
                                    </div>

                                    {/* 상세 이미지 */}
                                    {detailUrls.length > 0 && (
                                        <div className="flex flex-col gap-3 mb-8">
                                            {detailUrls.map((url, i) => (
                                                <img key={i} src={url} alt={`detail-${i}`} className="w-full max-w-xl rounded-lg border" />
                                            ))}
                                        </div>
                                    )}

                                    {/* 블록 에디터 내용 */}
                                    {descBlocks.length > 0 ? (
                                        <div className="border-t pt-6">
                                            <BlockRenderer blocks={descBlocks} />
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-300 border-t">
                                            <p className="text-sm">상세설명이 없습니다.</p>
                                            <p className="text-xs mt-1">'상세설명' 탭에서 블록을 추가하세요.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 하단 저장 버튼 */}
                        <div className="p-4 border-t flex-shrink-0 flex gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)}
                                className="flex-1 border border-gray-300 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="button" onClick={handleSave}
                                className="flex-[2] bg-blue-600 font-bold text-white py-3 rounded-lg hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
                                저장 및 반영하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
