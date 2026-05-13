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
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DOMAIN_OPTIONS = Object.keys(DOMAIN_CONFIG) as Domain[];

const PRESET_COLORS = [
  '#f472b6', '#7D3C98', '#FF7A5A', '#D4AC0D', '#52A97E',
  '#6C7A89', '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
];

function calcDDay(targetDate: string): { label: string; diff: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { label: 'D-Day', diff: 0 };
  if (diff > 0) return { label: `D-${diff}`, diff };
  return { label: `D+${Math.abs(diff)}`, diff };
}

export default function DDay() {
  const { ddayItems, addDDayItem, updateDDayItem, deleteDDayItem } = useStore();

  const emptyForm = { title: '', targetDate: new Date().toISOString().slice(0, 10), domain: '' as Domain | '', color: PRESET_COLORS[0] };
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  function handleAdd() {
    if (!form.title.trim() || !form.targetDate) return;
    addDDayItem({
      id: generateId(),
      title: form.title.trim(),
      targetDate: form.targetDate,
      domain: form.domain || undefined,
      color: form.color,
    });
    setForm(emptyForm);
    setShowAddForm(false);
  }

  function startEdit(item: typeof ddayItems[0]) {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      targetDate: item.targetDate,
      domain: item.domain ?? '',
      color: item.color,
    });
  }

  function saveEdit() {
    if (!editingId || !editForm.title.trim()) return;
    updateDDayItem(editingId, {
      title: editForm.title.trim(),
      targetDate: editForm.targetDate,
      domain: editForm.domain || undefined,
      color: editForm.color,
    });
    setEditingId(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allItems = useStore.getState().ddayItems;
    const oldIdx = allItems.findIndex((i) => i.id === active.id);
    const newIdx = allItems.findIndex((i) => i.id === over.id);
    useStore.setState({ ddayItems: arrayMove(allItems, oldIdx, newIdx) });
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button
          className="btn-primary flex items-center gap-1"
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">목표 날짜</label>
              <input
                type="date"
                className="input"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">도메인</label>
              <select
                className="select w-full"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value as Domain | '' })}
              >
                <option value="">없음</option>
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
                ))}
              </select>
            </div>
          </div>
          <input
            className="input"
            placeholder="이벤트 이름..."
            value={form.title}
            autoFocus
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          {/* Color picker */}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">색상</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: form.color === c ? '#1e293b' : 'transparent',
                  }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex items-center gap-1" onClick={handleAdd}>
              <Check size={14} /> Save
            </button>
            <button className="btn-secondary flex items-center gap-1" onClick={() => setShowAddForm(false)}>
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {ddayItems.length === 0 && !showAddForm && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-400 text-sm">중요한 날을 등록해보세요.</p>
          <button className="btn-primary mt-4" onClick={() => setShowAddForm(true)}>
            첫 D-Day 추가
          </button>
        </div>
      )}

      {/* D-Day cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ddayItems.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ddayItems.map((item) => (
              <SortableDDayCard
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                editForm={editForm}
                onStartEdit={() => startEdit(item)}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => deleteDDayItem(item.id)}
                onEditFormChange={setEditForm}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ── Sortable D-Day card ───────────────────────────────────────────────────────

function SortableDDayCard({
  item, isEditing, editForm,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete, onEditFormChange,
}: {
  item: { id: string; title: string; targetDate: string; domain?: Domain; color: string };
  isEditing: boolean;
  editForm: { title: string; targetDate: string; domain: Domain | ''; color: string };
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditFormChange: (form: { title: string; targetDate: string; domain: Domain | ''; color: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const { label, diff } = calcDDay(item.targetDate);
  const domainCfg = item.domain ? DOMAIN_CONFIG[item.domain] : null;
  const isPast = diff < 0;
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="card space-y-3 border-pink-200"
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">목표 날짜</label>
            <input
              type="date"
              className="input"
              value={editForm.targetDate}
              onChange={(e) => onEditFormChange({ ...editForm, targetDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">도메인</label>
            <select
              className="select w-full"
              value={editForm.domain}
              onChange={(e) => onEditFormChange({ ...editForm, domain: e.target.value as Domain | '' })}
            >
              <option value="">없음</option>
              {DOMAIN_OPTIONS.map((d) => (
                <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
              ))}
            </select>
          </div>
        </div>
        <input
          className="input"
          value={editForm.title}
          autoFocus
          onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
        />
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">색상</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: editForm.color === c ? '#1e293b' : 'transparent',
                }}
                onClick={() => onEditFormChange({ ...editForm, color: c })}
              />
            ))}
          </div>
        </div>
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
      style={{ ...dragStyle, borderLeftWidth: 4, borderLeftColor: item.color }}
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            className="flex-shrink-0 p-0.5 mt-0.5 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
            {...attributes} {...listeners} tabIndex={-1}
          >
            <GripVertical size={14} />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${isPast ? 'text-slate-400' : 'text-slate-800'}`}>
              {item.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{item.targetDate}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500"
              onClick={onStartEdit}
            >
              <Edit2 size={13} />
            </button>
            <button
              className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
              onClick={onDelete}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <span
            className="text-2xl font-black"
            style={{ color: isPast ? '#94a3b8' : item.color }}
          >
            {label}
          </span>
          {domainCfg && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${domainCfg.color}20`, color: domainCfg.color }}
            >
              {domainCfg.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
