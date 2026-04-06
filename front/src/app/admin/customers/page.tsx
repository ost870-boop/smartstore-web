"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Star, Trash2 } from 'lucide-react';

export default function AdminCustomersPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [qnas, setQnas] = useState<any[]>([]);
    const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
    const [tab, setTab] = useState<'reviews' | 'qnas'>('qnas');
    const token = Cookies.get('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
        try {
            const [revRes, qnaRes] = await Promise.all([
                axios.get('/api/admin/reviews', { headers }),
                axios.get('/api/admin/qnas', { headers }),
            ]);
            setReviews(revRes.data);
            setQnas(qnaRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleReply = async (qnaId: string) => {
        const reply = replyInputs[qnaId]?.trim();
        if (!reply) return alert('답변 내용을 입력해주세요.');
        try {
            await axios.put(`/api/admin/qnas/${qnaId}/reply`, { reply }, { headers });
            setReplyInputs((prev: Record<string, string>) => ({ ...prev, [qnaId]: '' }));
            fetchData();
        } catch { alert('답변 등록 실패'); }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('이 리뷰를 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`/api/admin/reviews/${id}`, { headers });
            fetchData();
        } catch { alert('삭제 실패'); }
    };

    const handleDeleteQna = async (id: string) => {
        if (!confirm('이 문의를 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`/api/admin/qnas/${id}`, { headers });
            fetchData();
        } catch { alert('삭제 실패'); }
    };

    const unansweredCount = qnas.filter((q: any) => !q.reply).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">고객 문의 / 리뷰 관리</h1>

            {/* 탭 */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('qnas')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'qnas' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    상품 문의 ({qnas.length})
                    {unansweredCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unansweredCount}</span>}
                </button>
                <button
                    onClick={() => setTab('reviews')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'reviews' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    상품 리뷰 ({reviews.length})
                </button>
            </div>

            {/* Q&A 목록 */}
            {tab === 'qnas' && (
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl p-6">
                    {qnas.length === 0 ? (
                        <p className="text-gray-400 text-center py-12">등록된 문의가 없습니다.</p>
                    ) : (
                        <div className="space-y-4">
                            {qnas.map((q: any) => (
                                <div key={q.id} className={`border p-5 rounded-xl transition-all ${q.reply ? 'border-gray-100 bg-gray-50/50' : 'border-red-100 bg-red-50/30'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500">{q.user?.name || '익명'}</span>
                                            <span className="text-xs text-gray-300 mx-2">·</span>
                                            <span className="text-xs text-gray-400">{q.product?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.reply ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {q.reply ? '답변완료' : '미답변'}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(q.createdAt).toLocaleDateString('ko-KR')}</span>
                                            <button onClick={() => handleDeleteQna(q.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium mb-3 flex items-start gap-2">
                                        <span className="text-red-500 font-black text-base leading-none flex-shrink-0">Q</span>
                                        <span><strong>{q.title}</strong> — {q.content}</span>
                                    </p>

                                    {q.reply ? (
                                        <div className="bg-blue-50 rounded-lg p-3 text-sm">
                                            <span className="text-blue-600 font-black mr-2">A</span>
                                            <span className="text-gray-700">{q.reply}</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={replyInputs[q.id] || ''}
                                                onChange={e => setReplyInputs((prev: Record<string, string>) => ({ ...prev, [q.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && handleReply(q.id)}
                                                placeholder="답변을 입력하세요..."
                                                className="flex-1 border border-gray-300 rounded-lg text-xs px-3 py-2 outline-none focus:border-blue-500 bg-white"
                                            />
                                            <button
                                                onClick={() => handleReply(q.id)}
                                                className="bg-slate-800 text-white font-bold text-xs px-4 rounded-lg hover:bg-slate-700"
                                            >
                                                답변 등록
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 리뷰 목록 */}
            {tab === 'reviews' && (
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl p-6">
                    {reviews.length === 0 ? (
                        <p className="text-gray-400 text-center py-12">등록된 리뷰가 없습니다.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((r: any) => (
                                <div key={r.id} className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex text-amber-400 gap-0.5 mb-1">
                                                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= r.rating ? 'currentColor' : 'none'} />)}
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{r.user?.name || '익명'}</span>
                                            <span className="text-xs text-gray-300 mx-2">·</span>
                                            <span className="text-xs text-gray-400">{r.product?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('ko-KR')}</span>
                                            <button onClick={() => handleDeleteReview(r.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{r.content}</p>
                                    {r.imageUrl && <img src={r.imageUrl} alt="리뷰 이미지" className="mt-2 w-20 h-20 object-cover rounded border" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
