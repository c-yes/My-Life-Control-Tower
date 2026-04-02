import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MindMapData } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const EMPTY_CELLS = Array(9).fill('');
const CELL_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function Mandalart() {
  const { mindMaps, addMindMap, deleteMindMap } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function handleCreate() {
    if (!newTitle.trim()) return;
    const map: MindMapData = {
      id: generateId(),
      title: newTitle.trim(),
      cells: [...EMPTY_CELLS],
    };
    addMindMap(map);
    setNewTitle('');
    setCreating(false);
    setActiveId(map.id);
  }

  const active = activeId ? mindMaps.find((m) => m.id === activeId) : null;

  if (active) {
    return <MandalartEditor map={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div />
        <button className="btn-primary flex items-center gap-1" onClick={() => setCreating(true)}>
          <Plus size={14} />
        </button>
      </div>

      {creating && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">새 만다라트 만들기</h3>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="만다라트 제목..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button className="btn-primary" onClick={handleCreate}>만들기</button>
            <button className="btn-secondary" onClick={() => setCreating(false)}>취소</button>
          </div>
        </div>
      )}

      {mindMaps.length === 0 && !creating && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-slate-600 font-medium">아직 만다라트가 없습니다</p>
          <p className="text-slate-400 text-sm mt-1">핵심 주제를 중심으로 8가지 아이디어를 펼쳐보세요</p>
          <button className="btn-primary mt-4" onClick={() => setCreating(true)}>
            첫 만다라트 만들기
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mindMaps.map((map) => (
          <div
            key={map.id}
            className="card hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setActiveId(map.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {map.title}
              </h3>
              <button
                className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); deleteMindMap(map.id); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {/* Mini 3x3 preview */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {CELL_POSITIONS.map((i) => (
                <div
                  key={i}
                  className="rounded text-xs p-1 truncate text-center aspect-square flex items-center justify-center"
                  style={{
                    background: i === 4 ? '#fff7ed' : '#f8fafc',
                    color: i === 4 ? '#ea580c' : '#475569',
                    border: i === 4 ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                  }}
                >
                  {map.cells[i] || (i === 4 ? map.title : '')}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
              {map.cells.filter((c) => c.trim()).length}/9 칸 작성
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MandalartEditor({ map, onBack }: { map: MindMapData; onBack: () => void }) {
  const { updateMindMap } = useStore();
  const [cells, setCells] = useState<string[]>(
    map.cells.length === 9 ? map.cells : [...EMPTY_CELLS]
  );
  const [title, setTitle] = useState(map.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCell, setEditingCell] = useState<number | null>(null);

  function saveCell(idx: number, value: string) {
    const next = cells.map((c, i) => (i === idx ? value : c));
    setCells(next);
    updateMindMap(map.id, { cells: next });
  }

  function saveTitle() {
    if (title.trim()) updateMindMap(map.id, { title: title.trim() });
    setEditingTitle(false);
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn-secondary flex items-center gap-1" onClick={onBack}>
          <ArrowLeft size={14} /> 목록으로
        </button>
        <div className="flex-1">
          {editingTitle ? (
            <input
              className="input text-lg font-bold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              autoFocus
            />
          ) : (
            <h2
              className="text-xl font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {title}
              <span className="ml-2 text-sm font-normal text-slate-400">클릭해서 수정</span>
            </h2>
          )}
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="card">
        <div
          className="text-base font-bold mb-5 pb-3 border-b-2 border-orange-400 inline-block pr-8"
          style={{ color: '#1e293b' }}
        >
          {title}
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {CELL_POSITIONS.map((idx) => {
            const isCenter = idx === 4;
            const isEditing = editingCell === idx;

            return (
              <div
                key={idx}
                className="relative rounded-xl cursor-text flex flex-col"
                style={{
                  background: isCenter ? '#fff7ed' : '#f8fafc',
                  border: isCenter ? '2px solid #f97316' : '1px solid #e2e8f0',
                  aspectRatio: '1 / 1',
                  padding: '12px',
                  transition: 'border-color 0.15s',
                }}
                onClick={() => !isEditing && setEditingCell(idx)}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    className="flex-1 w-full resize-none bg-transparent outline-none text-sm"
                    style={{ color: isCenter ? '#ea580c' : '#1e293b' }}
                    value={cells[idx]}
                    placeholder={isCenter ? 'Core topic...' : 'Idea...'}
                    onChange={(e) => saveCell(idx, e.target.value)}
                    onBlur={() => setEditingCell(null)}
                  />
                ) : (
                  <div
                    className="flex-1 text-sm whitespace-pre-wrap overflow-hidden"
                    style={{
                      color: cells[idx]
                        ? isCenter ? '#ea580c' : '#1e293b'
                        : '#cbd5e1',
                    }}
                  >
                    {cells[idx] || (isCenter ? 'Core topic...' : 'Idea...')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-4">
          각 칸을 클릭하여 내용을 입력하세요 · 자동 저장됩니다
        </p>
      </div>
    </div>
  );
}
