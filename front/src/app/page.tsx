import HomePageContent from './HomePageContent';

async function getProducts(queryStr: string) {
  try {
    const API_URL = process.env.INTERNAL_API_URL || 'https://smartstore-api-w2s7.onrender.com';
    const res = await fetch(`${API_URL}/api/products?${queryStr}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getCategories() {
  try {
    const API_URL = process.env.INTERNAL_API_URL || 'https://smartstore-api-w2s7.onrender.com';
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; search?: string; material?: string; usage?: string; brand?: string }> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.category) query.append('categoryId', params.category);
  if (params.sort) query.append('sort', params.sort);
  if (params.search) query.append('search', params.search);
  if (params.material) query.append('material', params.material);
  if (params.usage) query.append('usage', params.usage);
  if (params.brand) query.append('brand', params.brand);

  const [products, categories] = await Promise.all([
    getProducts(query.toString()),
    getCategories()
  ]);

  return <HomePageContent initialProducts={products} initialCategories={categories} params={params} />;
}
