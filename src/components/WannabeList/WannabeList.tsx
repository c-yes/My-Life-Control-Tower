import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';

export default function WannabeList() {
  const { wannabeItems, addWannabeItem, updateWannabeItem, deleteWannabeItem, wannabeNotes, setWannabeNotes } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '' as Domain | '' });
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' as Domain | '' });
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  function handleAdd() {
    if (!form.title.trim()) return;
    addWannabeItem({
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setForm({ title: '', description: '', category: '' });
    setShowAddForm(false);
  }

  function normalizeCategoryToKey(cat: string): Domain | '' {
    if (!cat) return '';
    const lower = cat.toLowerCase();
    if ((Object.keys(DOMAIN_CONFIG) as Domain[]).includes(lower as Domain)) return lower as Domain;
    // legacy: match by label
    const byLabel = (Object.keys(DOMAIN_CONFIG) as Domain[]).find(
      (d) => DOMAIN_CONFIG[d].label.toLowerCase() === lower
    );
    return byLabel ?? '';
  }

  function startEdit(item: typeof wannabeItems[0]) {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      category: normalizeCategoryToKey(item.category ?? ''),
    });
  }

  function saveEdit() {
    if (!editingId || !editForm.title.trim()) return;
    updateWannabeItem(editingId, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
    });
    setEditingId(null);
  }

  // Normalize category: try to match to a domain key (case-insensitive)
  function getItemDomain(item: typeof wannabeItems[0]): Domain | null {
    if (!item.category) return null;
    const cat = item.category.toLowerCase();
    if (domains.includes(cat as Domain)) return cat as Domain;
    // backward compat: match by label
    const byLabel = domains.find((d) => DOMAIN_CONFIG[d].label.toLowerCase() === cat);
    return byLabel ?? null;
  }

  // Group by normalized domain key (handles legacy "Care" → "care" etc.)
  const categoryKeys = Array.from(
    new Set(wannabeItems.map((i) => normalizeCategoryToKey(i.category ?? '') || '기타'))
  ).sort();
  const grouped = categoryKeys.reduce((acc, cat) => {
    acc[cat] = wannabeItems.filter((i) => (normalizeCategoryToKey(i.category ?? '') || '기타') === cat);
    return acc;
  }, {} as Record<string, typeof wannabeItems>);

  const total = wannabeItems.length;
  const done = wannabeItems.filter((i) => i.completed).length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
{total > 0 && (
            <p className="text-sm text-slate-400 mt-0.5">{done}/{total} 달성</p>
          )}
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <div className="space-y-3">
            <input
              className="input"
              placeholder="하고 싶은 것..."
              value={form.title}
              autoFocus
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select
              className="select w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Domain | '' })}
            >
              <option value="">카테고리 없음</option>
              {domains.map((d) => (
                <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
              ))}
            </select>
            <textarea
              className="textarea h-20"
              placeholder="설명 (선택)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2">
              <button className="btn-primary flex items-center gap-1" onClick={handleAdd}>
                <Check size={14} /> Save
              </button>
              <button className="btn-secondary flex items-center gap-1" onClick={() => setShowAddForm(false)}>
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {wannabeItems.length === 0 && !showAddForm && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-slate-400 text-sm">언젠가 하고 싶은 것들을 적어보세요.</p>
          <button className="btn-primary mt-4" onClick={() => setShowAddForm(true)}>
            첫 번째 Wannabe 추가
          </button>
        </div>
      )}

      {/* Items by category */}
      {categoryKeys.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        // Check if cat is a domain key (new format) or legacy string
        const domainKey = domains.includes(cat as Domain) ? cat as Domain : null;
        const cfg = domainKey ? DOMAIN_CONFIG[domainKey] : null;
        const headerLabel = cfg ? cfg.label : cat;
        const headerColor = cfg ? cfg.color : '#ec4899';
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: headerColor }}
              >
                {headerLabel}
              </span>
              <div className="flex-1 h-px" style={{ background: `${headerColor}40` }} />
              <span className="text-xs text-slate-400">
                {items.filter((i) => i.completed).length}/{items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const itemDomain = getItemDomain(item);
                const itemCfg = itemDomain ? DOMAIN_CONFIG[itemDomain] : null;
                if (editingId === item.id) {
                  return (
                    <div key={item.id} className="card border-pink-200 bg-pink-50 space-y-2">
                      <input
                        className="input"
                        value={editForm.title}
                        autoFocus
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <select
                        className="select w-full"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Domain | '' })}
                      >
                        <option value="">카테고리 없음</option>
                        {domains.map((d) => (
                          <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
                        ))}
                      </select>
                      <textarea
                        className="textarea h-16"
                        placeholder="설명"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingId(null)}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      item.completed
                        ? 'bg-slate-50 border-slate-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    style={itemCfg ? { borderLeftWidth: 3, borderLeftColor: itemCfg.color } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => updateWannabeItem(item.id, { completed: !item.completed })}
                      className="mt-0.5 w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: itemCfg ? itemCfg.color : '#ec4899' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      )}
                    </div>
                    <button
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0"
                      onClick={() => startEdit(item)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
                      onClick={() => deleteWannabeItem(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Notes / Issues */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">Notes</h3>
        <textarea
          className="textarea h-28"
          placeholder="이슈, 메모, 하고 싶은 이유 등을 자유롭게 적어보세요."
          value={wannabeNotes}
          onChange={(e) => setWannabeNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
