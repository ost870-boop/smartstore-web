"use client";

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([
        { id: '1', name: 'PVC 임시 메꾸라 15A 플러그', price: 200, category: '배관자재', stock: 1000, options: 3 },
        { id: '2', name: '철 단니플 20A 백관 단닛블', price: 340, category: '배관자재', stock: 1000, options: 0 },
        { id: '3', name: '수도미터기 15A 건식 계량기', price: 18000, category: '밸브류', stock: 100, options: 0 },
    ]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">상품 관리</h1>
                <button className="bg-blue-600 text-white px-4 py-2 flex items-center gap-1 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                    <Plus size={16}/> 새 상품 등록
                </button>
            </div>
            
            <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-200 rounded-2xl overflow-hidden">
                 <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap md:flex-nowrap gap-2 items-center justify-between">
                     <div className="flex gap-2">
                        <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium outline-none bg-white">
                            <option>전체 카테고리</option>
                            <option>배관자재</option>
                            <option>밸브류</option>
                        </select>
                     </div>
                     <div className="relative w-full md:w-auto mt-2 md:mt-0">
                         <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                         <input type="text" placeholder="상품명 또는 브랜드 검색" className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none w-full md:w-64" />
                     </div>
                 </div>

                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="bg-white border-b border-gray-200 text-gray-500 font-semibold">
                             <tr>
                                 <th className="py-4 px-6 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                                 <th className="py-4 px-4 font-bold">분류</th>
                                 <th className="py-4 px-4 font-bold">상품명</th>
                                 <th className="py-4 px-4 font-bold">판매가</th>
                                 <th className="py-4 px-4 font-bold">재고</th>
                                 <th className="py-4 px-4 font-bold text-center">옵션 여부</th>
                                 <th className="py-4 px-4 font-bold text-center">관리</th>
                             </tr>
                         </thead>
                         <tbody>
                             {products.map(p => (
                                 <tr key={p.id} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                                     <td className="py-4 px-6"><input type="checkbox" className="rounded" /></td>
                                     <td className="py-4 px-4 text-gray-500 text-xs font-semibold">{p.category}</td>
                                     <td className="py-4 px-4 font-bold text-gray-800 truncate max-w-xs">{p.name}</td>
                                     <td className="py-4 px-4 font-semibold text-blue-600">{p.price.toLocaleString()}원</td>
                                     <td className="py-4 px-4">{p.stock}</td>
                                     <td className="py-4 px-4 text-center">
                                         {p.options > 0 ? <span className="text-blue-600 font-bold border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] tracking-wider">{p.options} OPTIONS</span> : <span className="text-gray-300">-</span>}
                                     </td>
                                     <td className="py-4 px-4 text-center">
                                         <button className="text-slate-400 hover:text-blue-500 p-1 transition-colors"><Edit size={16}/></button>
                                         <button className="text-slate-400 hover:text-red-500 p-1 ml-2 transition-colors"><Trash2 size={16}/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
}
