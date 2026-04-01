import ProductDetailClient from '@/components/ProductDetailClient';
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch(e) { return null; }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);
  if (!product) return notFound();

  return (
    <ProductDetailClient product={product} />
  );
}
