"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HomePageContent from './HomePageContent';
import { Suspense } from 'react';

function HomeInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const params = {
    category: searchParams.get('category') || undefined,
    sort: searchParams.get('sort') || undefined,
    search: searchParams.get('search') || undefined,
    material: searchParams.get('material') || undefined,
    usage: searchParams.get('usage') || undefined,
    brand: searchParams.get('brand') || undefined,
  };

  useEffect(() => {
    const query = new URLSearchParams();
    if (params.category) query.append('categoryId', params.category);
    if (params.sort) query.append('sort', params.sort);
    if (params.search) query.append('search', params.search);
    if (params.material) query.append('material', params.material);
    if (params.usage) query.append('usage', params.usage);
    if (params.brand) query.append('brand', params.brand);

    Promise.all([
      fetch(`/api/products?${query.toString()}`).then(r => r.ok ? r.json() : []),
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
    ])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-[220px] md:h-[380px] bg-gray-200 rounded-2xl" />
          <div className="flex gap-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />)}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl" />)}</div>
        </div>
        <p className="text-center text-gray-400 mt-8 text-sm">상품을 불러오는 중... (첫 접속 시 30초 정도 걸릴 수 있습니다)</p>
      </div>
    );
  }

  return <HomePageContent initialProducts={products} initialCategories={categories} params={params} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">로딩중...</div>}>
      <HomeInner />
    </Suspense>
  );
}
