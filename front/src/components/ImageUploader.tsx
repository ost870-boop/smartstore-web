"use client";
import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Star } from 'lucide-react';
import Cookies from 'js-cookie';

const API = ''; // 상대경로 → Next.js rewrite → localhost:5000

interface Props {
  thumbnailUrl: string;
  detailUrls: string[];
  onThumbnailChange: (url: string) => void;
  onDetailUrlsChange: (urls: string[]) => void;
}

export default function ImageUploader({ thumbnailUrl, detailUrls, onThumbnailChange, onDetailUrlsChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${API}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        body: form,
      });
      const data = await res.json();
      return data.url || null;
    } catch { return null; }
  };

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await upload(file);
    if (url) onThumbnailChange(url);
    setUploading(false);
    e.target.value = '';
  };

  const handleDetail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await upload(file);
      if (url) urls.push(url);
    }
    onDetailUrlsChange([...detailUrls, ...urls]);
    setUploading(false);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent, type: 'thumb' | 'detail') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true);
    if (type === 'thumb') {
      const url = await upload(files[0]);
      if (url) onThumbnailChange(url);
    } else {
      const urls: string[] = [];
      for (const f of files) {
        const url = await upload(f);
        if (url) urls.push(url);
      }
      onDetailUrlsChange([...detailUrls, ...urls]);
    }
    setUploading(false);
  };

  const moveDetail = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= detailUrls.length) return;
    const arr = [...detailUrls];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onDetailUrlsChange(arr);
  };

  const removeDetail = (idx: number) => {
    onDetailUrlsChange(detailUrls.filter((_, i) => i !== idx));
  };

  const setAsThumbnail = (url: string) => {
    onThumbnailChange(url);
  };

  return (
    <div className="space-y-6">
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-600 font-bold text-center animate-pulse">
          이미지 업로드 중...
        </div>
      )}

      {/* 대표 이미지 */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2">대표 이미지 (썸네일)</label>
        <div
          onDrop={e => handleDrop(e, 'thumb')}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => thumbRef.current?.click()}
        >
          <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
          {thumbnailUrl ? (
            <div className="relative inline-block">
              <img src={thumbnailUrl} alt="thumb" className="h-32 w-32 object-cover rounded-lg border mx-auto" />
              <button type="button" onClick={e => { e.stopPropagation(); onThumbnailChange(''); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                <X size={12} />
              </button>
              <p className="text-[10px] text-gray-400 mt-2">클릭하여 교체</p>
            </div>
          ) : (
            <div className="py-6">
              <Upload size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400 font-medium">클릭 또는 드래그하여 업로드</p>
              <p className="text-[10px] text-gray-300 mt-1">JPG, PNG, WebP (최대 5MB)</p>
            </div>
          )}
        </div>
        {/* URL 직접 입력 폴백 */}
        <input
          type="text"
          value={thumbnailUrl}
          onChange={e => onThumbnailChange(e.target.value)}
          placeholder="또는 이미지 URL 직접 입력"
          className="w-full mt-2 border rounded-lg px-3 py-1.5 text-xs outline-none text-gray-500 focus:border-blue-500"
        />
      </div>

      {/* 상세 이미지 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-700">상세 이미지 ({detailUrls.length}장)</label>
          <button type="button" onClick={() => detailRef.current?.click()}
            className="text-xs bg-gray-100 hover:bg-blue-50 px-3 py-1 rounded-lg font-bold text-gray-600 hover:text-blue-600 transition-colors">
            + 이미지 추가
          </button>
        </div>
        <input ref={detailRef} type="file" accept="image/*" multiple className="hidden" onChange={handleDetail} />

        <div
          onDrop={e => handleDrop(e, 'detail')}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-3 min-h-[80px]"
        >
          {detailUrls.length === 0 ? (
            <div className="text-center py-4 cursor-pointer" onClick={() => detailRef.current?.click()}>
              <Upload size={24} className="mx-auto text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">클릭 또는 드래그하여 여러 장 업로드</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {detailUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} className="relative group">
                  <img src={url} alt={`detail-${idx}`} className="w-full aspect-square object-cover rounded-lg border" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <button type="button" onClick={() => moveDetail(idx, -1)} disabled={idx === 0}
                      className="bg-white/90 rounded p-0.5 text-[10px] disabled:opacity-30"><GripVertical size={12} /></button>
                    <button type="button" onClick={() => setAsThumbnail(url)} title="대표이미지로 설정"
                      className="bg-white/90 rounded p-0.5"><Star size={12} className="text-amber-500" /></button>
                    <button type="button" onClick={() => removeDetail(idx)}
                      className="bg-white/90 rounded p-0.5"><X size={12} className="text-red-500" /></button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">{idx + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
