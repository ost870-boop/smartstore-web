"use client";
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-20">
      <div className="text-center">
        <p className="text-red-500 font-bold text-lg mb-2">페이지 로드 오류</p>
        <p className="text-gray-500 text-sm mb-6">{error.message || '알 수 없는 오류가 발생했습니다.'}</p>
        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">다시 시도</button>
      </div>
    </div>
  );
}
