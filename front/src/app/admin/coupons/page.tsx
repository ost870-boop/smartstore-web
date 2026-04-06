"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string;
  createdAt: string;
}

const emptyForm = { code: '', name: '', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 0, expiresAt: '' };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${Cookies.get('token')}` };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/coupons`, { headers });
      setCoupons(res.data);
    } catch { alert('쿠폰 목록 불러오기 실패'); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API}/api/admin/coupons/${editId}`, form, { headers });
        alert('쿠폰이 수정되었습니다.');
      } else {
        await axios.post(`${API}/api/admin/coupons`, form, { headers });
        alert('쿠폰이 생성되었습니다.');
      }
      setForm({ ...emptyForm });
      setEditId(null);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.error || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      name: c.name,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount,
      expiresAt: c.expiresAt.slice(0, 10),
    });
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`쿠폰 "${code}"을 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`${API}/api/admin/coupons/${id}`, { headers });
      fetchCoupons();
    } catch { alert('삭제 실패'); }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">쿠폰 관리</h1>

      {/* 쿠폰 생성/수정 폼 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-800">{editId ? '쿠폰 수정' : '새 쿠폰 생성'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드 *</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="예: SUMMER2025"
              disabled={!!editId}
              required
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰명 *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="예: 여름 시즌 할인"
              required
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">할인 유형 *</label>
            <select
              value={form.discountType}
              onChange={e => setForm(f => ({ ...f, discountType: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="PERCENT">정률 할인 (%)</option>
              <option value="FIXED_AMOUNT">정액 할인 (원)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              할인 값 * {form.discountType === 'PERCENT' ? '(%)' : '(원)'}
            </label>
            <input
              type="number"
              value={form.discountValue}
              onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
              min={1}
              required
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최소 주문금액 (원)</label>
            <input
              type="number"
              value={form.minOrderAmount}
              onChange={e => setForm(f => ({ ...f, minOrderAmount: Number(e.target.value) }))}
              min={0}
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">만료일 *</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:bg-gray-400"
            >
              {loading ? '저장중...' : (editId ? '수정 완료' : '쿠폰 생성')}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm({ ...emptyForm }); }}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl"
              >
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 쿠폰 목록 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['코드', '쿠폰명', '할인', '최소주문', '만료일', '상태', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">쿠폰이 없습니다.</td></tr>
            )}
            {coupons.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.code}</td>
                <td className="px-4 py-3 text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-gray-700">
                  {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()}원`}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.minOrderAmount > 0 ? `${c.minOrderAmount.toLocaleString()}원↑` : '없음'}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(c.expiresAt).toLocaleDateString('ko-KR')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${isExpired(c.expiresAt) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isExpired(c.expiresAt) ? '만료됨' : '사용가능'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-500 hover:underline text-xs">수정</button>
                  <button onClick={() => handleDelete(c.id, c.code)} className="text-red-400 hover:underline text-xs">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
