import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MindMapDocument, MindMapBranch } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

export default function MindMap() {
  const { mindMapDocs, addMindMapDoc, deleteMindMapDoc } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  function handleCreate() {
    if (!newTitle.trim()) return;
    const doc: MindMapDocument = {
      id: generateId(),
      title: newTitle.trim(),
      branches: [],
    };
    addMindMapDoc(doc);
    setNewTitle('');
    setCreating(false);
    setActiveId(doc.id);
  }

  const active = activeId ? mindMapDocs.find((d) => d.id === activeId) : null;

  if (active) {
    return <MindMapEditor doc={active} onBack={() => setActiveId(null)} />;
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
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="중심 주제..."
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

      {mindMapDocs.length === 0 && !creating && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-slate-600 font-medium">아직 마인드맵이 없습니다</p>
          <p className="text-slate-400 text-sm mt-1">중심 주제에서 가지를 뻗어 아이디어를 연결하세요</p>
          <button className="btn-primary mt-4" onClick={() => setCreating(true)}>
            첫 마인드맵 만들기
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mindMapDocs.map((doc) => (
          <div
            key={doc.id}
            className="card hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setActiveId(doc.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {doc.title}
              </h3>
              <button
                className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); deleteMindMapDoc(doc.id); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {doc.branches.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-slate-600 truncate">{b.text}</span>
                </div>
              ))}
              {doc.branches.length > 4 && (
                <p className="text-xs text-slate-400 pl-4">+{doc.branches.length - 4}개 더</p>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
              {doc.branches.length}개 가지
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MindMapEditor({ doc, onBack }: { doc: MindMapDocument; onBack: () => void }) {
  const { updateMindMapDoc } = useStore();
  const [branches, setBranches] = useState<MindMapBranch[]>(doc.branches);
  const [title, setTitle] = useState(doc.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newBranchText, setNewBranchText] = useState('');
  const [addingBranch, setAddingBranch] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function save(updates: Partial<MindMapDocument>) {
    updateMindMapDoc(doc.id, updates);
  }

  function saveTitle() {
    if (title.trim()) save({ title: title.trim() });
    setEditingTitle(false);
  }

  function addBranch() {
    if (!newBranchText.trim()) return;
    const branch: MindMapBranch = { id: generateId(), text: newBranchText.trim(), items: [] };
    const next = [...branches, branch];
    setBranches(next);
    save({ branches: next });
    setNewBranchText('');
    setAddingBranch(false);
  }

  function updateBranch(id: string, updates: Partial<MindMapBranch>) {
    const next = branches.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBranches(next);
    save({ branches: next });
  }

  function deleteBranch(id: string) {
    const next = branches.filter((b) => b.id !== id);
    setBranches(next);
    save({ branches: next });
  }

  function addItem(branchId: string, text: string) {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch || !text.trim()) return;
    updateBranch(branchId, { items: [...branch.items, text.trim()] });
  }

  function deleteItem(branchId: string, itemIdx: number) {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    updateBranch(branchId, { items: branch.items.filter((_, i) => i !== itemIdx) });
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
        <button
          className="btn-primary flex items-center gap-1"
          onClick={() => setAddingBranch(true)}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Central topic */}
      <div className="flex justify-center">
        <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md">
          {title}
        </div>
      </div>

      {addingBranch && (
        <div className="card">
          <p className="text-sm font-medium text-slate-700 mb-2">새 가지 추가</p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="가지 이름..."
              value={newBranchText}
              onChange={(e) => setNewBranchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBranch()}
              autoFocus
            />
            <button className="btn-primary" onClick={addBranch}>추가</button>
            <button className="btn-secondary" onClick={() => setAddingBranch(false)}>취소</button>
          </div>
        </div>
      )}

      {branches.length === 0 && !addingBranch && (
        <div className="card text-center py-10">
          <p className="text-slate-400 text-sm">가지를 추가해서 아이디어를 펼쳐보세요</p>
        </div>
      )}

      <div className="space-y-3">
        {branches.map((branch) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            collapsed={!!collapsed[branch.id]}
            onToggle={() => setCollapsed((c) => ({ ...c, [branch.id]: !c[branch.id] }))}
            onUpdateText={(text) => updateBranch(branch.id, { text })}
            onDelete={() => deleteBranch(branch.id)}
            onAddItem={(text) => addItem(branch.id, text)}
            onDeleteItem={(idx) => deleteItem(branch.id, idx)}
          />
        ))}
      </div>
    </div>
  );
}

function BranchCard({
  branch,
  collapsed,
  onToggle,
  onUpdateText,
  onDelete,
  onAddItem,
  onDeleteItem,
}: {
  branch: MindMapBranch;
  collapsed: boolean;
  onToggle: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
  onAddItem: (text: string) => void;
  onDeleteItem: (idx: number) => void;
}) {
  const [editingText, setEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState(branch.text);
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  function saveText() {
    if (textDraft.trim()) onUpdateText(textDraft.trim());
    setEditingText(false);
  }

  function submitItem() {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
      setAddingItem(false);
    }
  }

  return (
    <div className="card">
      {/* Branch header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
        {editingText ? (
          <input
            className="input flex-1 text-sm font-semibold"
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onBlur={saveText}
            onKeyDown={(e) => e.key === 'Enter' && saveText()}
            autoFocus
          />
        ) : (
          <span
            className="flex-1 font-semibold text-slate-800 cursor-pointer hover:text-indigo-600"
            onDoubleClick={() => { setTextDraft(branch.text); setEditingText(true); }}
          >
            {branch.text}
          </span>
        )}
        <span className="text-xs text-slate-400">{branch.items.length}개</span>
        <button
          className="p-1 rounded hover:bg-slate-100 text-slate-400"
          onClick={() => setAddingItem(true)}
          title="항목 추가"
        >
          <Plus size={13} />
        </button>
        <button className="p-1 rounded hover:bg-slate-100 text-slate-400" onClick={onToggle}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"
          onClick={onDelete}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {!collapsed && (
        <div className="mt-3 space-y-1 pl-5">
          {branch.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 group">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5 flex-shrink-0" />
              <span className="flex-1 text-sm text-slate-700">{item}</span>
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-opacity"
                onClick={() => onDeleteItem(idx)}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {addingItem && (
            <div className="flex gap-2 mt-2">
              <input
                className="input flex-1 text-sm"
                placeholder="항목 입력..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitItem();
                  if (e.key === 'Escape') setAddingItem(false);
                }}
                autoFocus
              />
              <button className="btn-primary text-xs py-1" onClick={submitItem}>추가</button>
              <button className="btn-secondary text-xs py-1" onClick={() => setAddingItem(false)}>취소</button>
            </div>
          )}

          {branch.items.length === 0 && !addingItem && (
            <p
              className="text-xs text-slate-400 cursor-pointer hover:text-indigo-500"
              onClick={() => setAddingItem(true)}
            >
              + 항목 추가
            </p>
          )}
        </div>
      )}
    </div>
  );
}
