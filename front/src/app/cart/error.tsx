"use client";
export default function CartError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-center">
      <p className="text-red-500 font-bold text-lg mb-2">장바구니를 불러올 수 없습니다</p>
      <p className="text-gray-500 text-sm mb-6">{error.message}</p>
      <button onClick={reset} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">다시 시도</button>
    </div>
  );
}
