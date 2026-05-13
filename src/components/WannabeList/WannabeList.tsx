import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, Check, X, Edit2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function WannabeList() {
  const { wannabeItems, addWannabeItem, updateWannabeItem, deleteWannabeItem, wannabeNotes, setWannabeNotes } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', category: '' as Domain | '' });
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' as Domain | '' });
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleCategoryDragEnd(event: DragEndEvent, categoryKey: string) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allItems = useStore.getState().wannabeItems;
    const subset = allItems.filter((i) => (normalizeCategoryToKey(i.category ?? '') || '기타') === categoryKey);
    const oldIdx = subset.findIndex((i) => i.id === active.id);
    const newIdx = subset.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(subset, oldIdx, newIdx);
    const iter = reordered[Symbol.iterator]();
    useStore.setState({
      wannabeItems: allItems.map((i) =>
        (normalizeCategoryToKey(i.category ?? '') || '기타') === categoryKey ? (iter.next().value ?? i) : i
      ),
    });
  }

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleCategoryDragEnd(e, cat)}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableWannabeItem
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      editForm={editForm}
                      domains={domains}
                      onToggle={() => updateWannabeItem(item.id, { completed: !item.completed })}
                      onStartEdit={() => startEdit(item)}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onDelete={() => deleteWannabeItem(item.id)}
                      onEditFormChange={setEditForm}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

// ── Sortable wannabe item ─────────────────────────────────────────────────────

function SortableWannabeItem({
  item, isEditing, editForm, domains,
  onToggle, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onEditFormChange,
}: {
  item: { id: string; title: string; description: string; completed: boolean; category?: string };
  isEditing: boolean;
  editForm: { title: string; description: string; category: Domain | '' };
  domains: Domain[];
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditFormChange: (form: { title: string; description: string; category: Domain | '' }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const domainKey = item.category
    ? (Object.keys(DOMAIN_CONFIG) as Domain[]).find(
        (d) => d === item.category || DOMAIN_CONFIG[d].label.toLowerCase() === item.category?.toLowerCase()
      ) ?? null
    : null;
  const cfg = domainKey ? DOMAIN_CONFIG[domainKey] : null;
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(cfg ? { borderLeftWidth: 3, borderLeftColor: cfg.color } : {}),
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="card border-pink-200 bg-pink-50 space-y-2"
      >
        <input
          className="input"
          value={editForm.title}
          autoFocus
          onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
        />
        <select
          className="select w-full"
          value={editForm.category}
          onChange={(e) => onEditFormChange({ ...editForm, category: e.target.value as Domain | '' })}
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
          onChange={(e) => onEditFormChange({ ...editForm, description: e.target.value })}
        />
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-1 text-xs" onClick={onSaveEdit}>
            <Check size={12} /> Save
          </button>
          <button className="btn-secondary flex items-center gap-1 text-xs" onClick={onCancelEdit}>
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
        item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-slate-300'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button
        className="flex-shrink-0 p-0.5 mt-0.5 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes} {...listeners} tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 rounded cursor-pointer"
        style={{ accentColor: cfg ? cfg.color : '#ec4899' }}
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
        onClick={onStartEdit}
      >
        <Edit2 size={14} />
      </button>
      <button
        className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
        onClick={onDelete}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
