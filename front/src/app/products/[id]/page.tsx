import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

const API_URL = process.env.INTERNAL_API_URL || 'https://smartstore-api-w2s7.onrender.com';

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  try {
    const res = await fetch(`${API_URL}/api/products?categoryId=${categoryId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const all = await res.json();
    return all.filter((p: any) => p.id !== excludeId).slice(0, 4);
  } catch { return []; }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}
