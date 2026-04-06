"use client";
import { useState } from 'react';
import { Plus, Trash2, GripVertical, Image, Type, Table, Truck, ArrowUp, ArrowDown, Eye } from 'lucide-react';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'table' | 'shipping' | 'heading';
  content: string;
  // table-specific
  rows?: string[][];
  // heading-specific
  level?: 'h2' | 'h3';
}

function genId() { return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const BLOCK_TYPES = [
  { type: 'heading', label: '제목', icon: Type, desc: '섹션 제목 추가' },
  { type: 'text', label: '텍스트', icon: Type, desc: '설명 텍스트 추가' },
  { type: 'image', label: '이미지', icon: Image, desc: '이미지 URL 추가' },
  { type: 'table', label: '규격표', icon: Table, desc: '표 추가' },
  { type: 'shipping', label: '배송/교환안내', icon: Truck, desc: '배송/반품 안내 추가' },
] as const;

const DEFAULT_SHIPPING = `배송비: 3,000원 (50,000원 이상 무료배송)
출고: 평일 오후 2시 이전 결제 시 당일 출고
대량주문: 박스 단위 주문 시 화물 배송 가능 (추가 운임)
교환/반품: 수령 후 7일 이내, 미개봉 상태 (왕복 택배비 6,000원)
교환/반품 불가: 체결 부속, 개봉 제품, 맞춤 제작 상품`;

export default function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
  const [preview, setPreview] = useState(false);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: genId(),
      type,
      content: type === 'shipping' ? DEFAULT_SHIPPING : '',
      ...(type === 'table' ? { rows: [['항목', '규격', '비고'], ['', '', '']] } : {}),
      ...(type === 'heading' ? { level: 'h2' as const } : {}),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    onChange(newBlocks);
  };

  // Table helpers
  const addRow = (block: Block) => {
    const cols = block.rows?.[0]?.length || 3;
    updateBlock(block.id, { rows: [...(block.rows || []), Array(cols).fill('')] });
  };
  const addCol = (block: Block) => {
    updateBlock(block.id, { rows: (block.rows || []).map(r => [...r, '']) });
  };
  const updateCell = (block: Block, ri: number, ci: number, val: string) => {
    const newRows = (block.rows || []).map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    updateBlock(block.id, { rows: newRows });
  };
  const removeRow = (block: Block, ri: number) => {
    if ((block.rows?.length || 0) <= 1) return;
    updateBlock(block.id, { rows: (block.rows || []).filter((_, i) => i !== ri) });
  };

  if (preview) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">상세설명 미리보기</h3>
          <button onClick={() => setPreview(false)} className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded-lg font-bold">편집으로 돌아가기</button>
        </div>
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <BlockRenderer blocks={blocks} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700">상세설명 블록 에디터</h3>
        <button onClick={() => setPreview(true)} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
          <Eye size={14} /> 미리보기
        </button>
      </div>

      {/* Existing blocks */}
      <div className="space-y-3 mb-4">
        {blocks.map((block, idx) => (
          <div key={block.id} className="border border-gray-200 rounded-xl p-4 bg-white group hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <GripVertical size={14} className="text-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                {block.type === 'heading' ? '제목' : block.type === 'text' ? '텍스트' : block.type === 'image' ? '이미지' : block.type === 'table' ? '규격표' : '배송안내'}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp size={14} /></button>
                <button onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown size={14} /></button>
                <button onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>

            {block.type === 'heading' && (
              <div className="flex gap-2">
                <select value={block.level || 'h2'} onChange={e => updateBlock(block.id, { level: e.target.value as 'h2' | 'h3' })}
                  className="border rounded-lg px-2 py-1.5 text-sm outline-none">
                  <option value="h2">큰 제목</option>
                  <option value="h3">작은 제목</option>
                </select>
                <input type="text" value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })}
                  placeholder="섹션 제목 입력..." className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
              </div>
            )}

            {block.type === 'text' && (
              <textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })}
                rows={4} placeholder="상세 설명을 입력하세요..."
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y" />
            )}

            {block.type === 'image' && (
              <div>
                <input type="text" value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })}
                  placeholder="이미지 URL을 입력하세요..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                {block.content && (
                  <img src={block.content} alt="preview" className="mt-2 max-h-40 rounded border object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                )}
              </div>
            )}

            {block.type === 'table' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {(block.rows || []).map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border border-gray-200 p-0">
                              <input type="text" value={cell} onChange={e => updateCell(block, ri, ci, e.target.value)}
                                className={`w-full px-2 py-1.5 outline-none text-xs ${ri === 0 ? 'bg-gray-50 font-bold' : ''}`}
                                placeholder={ri === 0 ? '헤더' : '값'} />
                            </td>
                          ))}
                          <td className="w-8 border border-gray-200">
                            <button onClick={() => removeRow(block, ri)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => addRow(block)} className="text-xs bg-gray-100 px-3 py-1 rounded font-medium hover:bg-gray-200">+ 행 추가</button>
                  <button onClick={() => addCol(block)} className="text-xs bg-gray-100 px-3 py-1 rounded font-medium hover:bg-gray-200">+ 열 추가</button>
                </div>
              </div>
            )}

            {block.type === 'shipping' && (
              <textarea value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })}
                rows={6} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y" />
            )}
          </div>
        ))}
      </div>

      {/* Add block buttons */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
        <p className="text-xs font-bold text-gray-400 mb-3 text-center">블록 추가</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {BLOCK_TYPES.map(bt => (
            <button key={bt.type} onClick={() => addBlock(bt.type as Block['type'])}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 transition-colors">
              <bt.icon size={14} /> {bt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 블록 렌더러 (상세페이지용) ───────────────────────────────────
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading':
            return block.level === 'h3'
              ? <h3 key={block.id} className="text-lg font-bold text-gray-900 border-b pb-2">{block.content}</h3>
              : <h2 key={block.id} className="text-xl font-black text-gray-900 border-b-2 border-gray-900 pb-3">{block.content}</h2>;

          case 'text':
            return <p key={block.id} className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{block.content}</p>;

          case 'image':
            return block.content ? (
              <img key={block.id} src={block.content} alt="상세" className="w-full max-w-xl mx-auto rounded-lg border border-gray-100 object-contain" loading="lazy" />
            ) : null;

          case 'table':
            return (
              <div key={block.id} className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                  <tbody>
                    {(block.rows || []).map((row, ri) => (
                      <tr key={ri} className={ri === 0 ? 'bg-gray-100' : ri % 2 === 0 ? 'bg-gray-50/50' : ''}>
                        {row.map((cell, ci) => (
                          ri === 0
                            ? <th key={ci} className="border border-gray-200 px-3 py-2 font-bold text-gray-700 text-left">{cell}</th>
                            : <td key={ci} className="border border-gray-200 px-3 py-2 text-gray-600">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'shipping':
            return (
              <div key={block.id} className="bg-gray-50 p-6 rounded-xl text-sm text-gray-600 space-y-2 border border-gray-100">
                {block.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
