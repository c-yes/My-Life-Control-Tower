import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId, getCurrentYear, getCurrentMonth, MONTH_NAMES } from '../../utils/helpers';
import { Plus, Trash2, Check, X, ExternalLink, Edit2, GripVertical } from 'lucide-react';
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

export default function MonthlyPlan() {
  const {
    monthlyGoals, addMonthlyGoal, updateMonthlyGoal, deleteMonthlyGoal, annualGoals,
    monthlyPlanItems, addMonthlyPlanItem, updateMonthlyPlanItem, deleteMonthlyPlanItem,
    monthlyFeedbacks, setMonthlyFeedback,
  } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    annualGoalId: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    domain: 'output' as Domain,
    annualGoalId: '',
  });

  // Plan items state
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDomain, setNewPlanDomain] = useState<Domain | ''>('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanTitle, setEditPlanTitle] = useState('');
  const [editPlanDomain, setEditPlanDomain] = useState<Domain | ''>('');

  const goals = monthlyGoals.filter((g) => g.year === year && g.month === month);
  const completedCount = goals.filter((g) => g.completed).length;
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];
  const yearAnnualGoals = annualGoals.filter((g) => g.year === year);
  const achievementPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const planItems = monthlyPlanItems.filter((i) => i.year === year && i.month === month);

  function handleAdd() {
    if (!form.title.trim()) return;
    addMonthlyGoal({
      id: generateId(),
      title: form.title.trim(),
      domain: form.domain,
      annualGoalId: form.annualGoalId || undefined,
      completed: false,
      year,
      month,
    });
    setForm({ title: '', domain: 'output', annualGoalId: '' });
    setShowAddForm(false);
  }

  function startEdit(goal: typeof goals[0]) {
    setEditingId(goal.id);
    setEditForm({ title: goal.title, domain: goal.domain, annualGoalId: goal.annualGoalId || '' });
  }

  function saveEdit() {
    if (!editingId) return;
    updateMonthlyGoal(editingId, {
      title: editForm.title.trim(),
      domain: editForm.domain,
      annualGoalId: editForm.annualGoalId || undefined,
    });
    setEditingId(null);
  }

  function addPlanItem() {
    if (!newPlanTitle.trim()) return;
    addMonthlyPlanItem({
      id: generateId(),
      year,
      month,
      title: newPlanTitle.trim(),
      completed: false,
      domain: newPlanDomain || undefined,
    });
    setNewPlanTitle('');
    setNewPlanDomain('');
  }

  function savePlanEdit() {
    if (!editingPlanId || !editPlanTitle.trim()) return;
    updateMonthlyPlanItem(editingPlanId, {
      title: editPlanTitle.trim(),
      domain: editPlanDomain || undefined,
    });
    setEditingPlanId(null);
  }

  const groupedGoals = domains.reduce((acc, domain) => {
    acc[domain] = goals.filter((g) => g.domain === domain);
    return acc;
  }, {} as Record<Domain, typeof goals>);

  const years = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleGoalDragEnd(event: DragEndEvent, domain: Domain) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allGoals = useStore.getState().monthlyGoals;
    const subset = allGoals.filter((g) => g.domain === domain && g.year === year && g.month === month);
    const oldIdx = subset.findIndex((g) => g.id === active.id);
    const newIdx = subset.findIndex((g) => g.id === over.id);
    const reordered = arrayMove(subset, oldIdx, newIdx);
    const iter = reordered[Symbol.iterator]();
    useStore.setState({
      monthlyGoals: allGoals.map((g) =>
        g.domain === domain && g.year === year && g.month === month ? (iter.next().value ?? g) : g
      ),
    });
  }

  function handlePlanItemDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allItems = useStore.getState().monthlyPlanItems;
    const subset = allItems.filter((i) => i.year === year && i.month === month);
    const oldIdx = subset.findIndex((i) => i.id === active.id);
    const newIdx = subset.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(subset, oldIdx, newIdx);
    const iter = reordered[Symbol.iterator]();
    useStore.setState({
      monthlyPlanItems: allItems.map((i) =>
        i.year === year && i.month === month ? (iter.next().value ?? i) : i
      ),
    });
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">

        <div className="flex items-center gap-2">
          <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
          <Plus size={14} />
        </button>
      </div>

      {/* Achievement */}
      {goals.length > 0 && (
        <div className="card py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Achievement</span>
            <span className="text-sm font-bold text-pink-500">{achievementPct}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill h-3"
              style={{ width: `${achievementPct}%`, background: '#c45c8a' }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">{completedCount} of {goals.length} goals completed</div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">New Monthly Goal</h3>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Goal title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <select
              className="select w-full"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value as Domain })}
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_CONFIG[d].label}
                </option>
              ))}
            </select>
            <select
              className="select w-full"
              value={form.annualGoalId}
              onChange={(e) => setForm({ ...form, annualGoalId: e.target.value })}
            >
              <option value="">No linked annual goal</option>
              {yearAnnualGoals.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.title}
                </option>
              ))}
            </select>
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

      {goals.length === 0 && !showAddForm && (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No goals for {MONTH_NAMES[month - 1]} {year}.</p>
          <button className="btn-primary mt-3" onClick={() => setShowAddForm(true)}>
            Add First Goal
          </button>
        </div>
      )}

      {/* Section: Goals */}
      {goals.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Goals</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      )}

      {/* Goals by Domain */}
      {domains.map((domain) => {
        const domainGoals = groupedGoals[domain];
        if (domainGoals.length === 0) return null;
        const cfg = DOMAIN_CONFIG[domain];
        return (
          <div key={domain} className="card">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-slate-800">{cfg.label}</h3>
              <span
                className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ background: cfg.color }}
              >
                {domainGoals.filter((g) => g.completed).length}/{domainGoals.length}
              </span>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleGoalDragEnd(e, domain)}>
              <SortableContext items={domainGoals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {domainGoals.map((goal) => {
                    const linkedAnnual = goal.annualGoalId
                      ? annualGoals.find((ag) => ag.id === goal.annualGoalId)
                      : null;
                    return (
                      <SortableMonthlyGoalItem
                        key={goal.id}
                        goal={goal}
                        cfg={cfg}
                        linkedAnnual={linkedAnnual ?? null}
                        isEditing={editingId === goal.id}
                        editForm={editForm}
                        domains={domains}
                        yearAnnualGoals={yearAnnualGoals}
                        onToggle={() => updateMonthlyGoal(goal.id, { completed: !goal.completed })}
                        onStartEdit={() => startEdit(goal)}
                        onSaveEdit={saveEdit}
                        onCancelEdit={() => setEditingId(null)}
                        onDelete={() => deleteMonthlyGoal(goal.id)}
                        onEditFormChange={setEditForm}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );
      })}

      {/* Section: Plan */}
      {(goals.length > 0 || planItems.length > 0) && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Plan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Plan Items */}
          <div className="card">
            <h4 className="font-semibold text-slate-800 mb-3">이달의 실행 계획</h4>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePlanItemDragEnd}>
              <SortableContext items={planItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-3">
              {planItems.map((item) => (
                <SortableMonthlyPlanItem
                  key={item.id}
                  item={item}
                  isEditing={editingPlanId === item.id}
                  editTitle={editPlanTitle}
                  editDomain={editPlanDomain}
                  domains={domains}
                  onToggle={() => updateMonthlyPlanItem(item.id, { completed: !item.completed })}
                  onStartEdit={() => { setEditingPlanId(item.id); setEditPlanTitle(item.title); setEditPlanDomain(item.domain ?? ''); }}
                  onSaveEdit={savePlanEdit}
                  onCancelEdit={() => setEditingPlanId(null)}
                  onDelete={() => deleteMonthlyPlanItem(item.id)}
                  onEditTitleChange={setEditPlanTitle}
                  onEditDomainChange={(v) => setEditPlanDomain(v as Domain | '')}
                />
              ))}
            </div>
              </SortableContext>
            </DndContext>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="실행 계획 추가..."
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlanItem()}
              />
              <select
                className="select"
                value={newPlanDomain}
                onChange={(e) => setNewPlanDomain(e.target.value as Domain | '')}
              >
                <option value="">도메인</option>
                {domains.map((d) => (
                  <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
                ))}
              </select>
              <button className="btn-primary flex items-center gap-1" onClick={addPlanItem}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

        </>
      )}

      {/* Self Feedback */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">Self Feedback</h3>
        <textarea
          className="textarea h-28"
          placeholder="이번 달은 어땠나요? 잘한 점, 아쉬운 점, 다음 달에 개선할 점은?"
          value={monthlyFeedbacks[`${year}-${month}`] ?? ''}
          onChange={(e) => setMonthlyFeedback(year, month, e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Sortable monthly goal item ────────────────────────────────────────────────

function SortableMonthlyGoalItem({
  goal, cfg, linkedAnnual, isEditing, editForm, domains, yearAnnualGoals,
  onToggle, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onEditFormChange,
}: {
  goal: { id: string; title: string; completed: boolean; domain: Domain; annualGoalId?: string };
  cfg: { color: string; label: string };
  linkedAnnual: { id: string; title: string } | null;
  isEditing: boolean;
  editForm: { title: string; domain: Domain; annualGoalId: string };
  domains: Domain[];
  yearAnnualGoals: { id: string; title: string }[];
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditFormChange: (form: { title: string; domain: Domain; annualGoalId: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`flex items-start gap-2 p-3 rounded-xl border ${
        goal.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
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
        checked={goal.completed}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
        style={{ accentColor: cfg.color }}
      />
      {isEditing ? (
        <div className="flex-1 space-y-2">
          <input
            autoFocus
            className="input w-full text-sm py-1"
            value={editForm.title}
            onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          />
          <select
            className="select w-full text-sm"
            value={editForm.domain}
            onChange={(e) => onEditFormChange({ ...editForm, domain: e.target.value as Domain })}
          >
            {domains.map((d) => <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>)}
          </select>
          <select
            className="select w-full text-sm"
            value={editForm.annualGoalId}
            onChange={(e) => onEditFormChange({ ...editForm, annualGoalId: e.target.value })}
          >
            <option value="">No linked annual goal</option>
            {yearAnnualGoals.map((ag) => <option key={ag.id} value={ag.id}>{ag.title}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn-primary text-xs px-2 py-0.5 flex items-center gap-1" onClick={onSaveEdit}>
              <Check size={12} /> Save
            </button>
            <button className="btn-secondary text-xs px-2 py-0.5 flex items-center gap-1" onClick={onCancelEdit}>
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${goal.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {goal.title}
            </span>
            {linkedAnnual && (
              <div className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5 truncate">
                <ExternalLink size={10} />
                <span className="truncate">{linkedAnnual.title}</span>
              </div>
            )}
          </div>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0" onClick={onStartEdit}>
            <Edit2 size={13} />
          </button>
          <button className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0" onClick={onDelete}>
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  );
}

// ── Sortable monthly plan item ────────────────────────────────────────────────

function SortableMonthlyPlanItem({
  item, isEditing, editTitle, editDomain, domains,
  onToggle, onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  onEditTitleChange, onEditDomainChange,
}: {
  item: { id: string; title: string; completed: boolean; domain?: Domain };
  isEditing: boolean;
  editTitle: string;
  editDomain: Domain | '';
  domains: Domain[];
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditTitleChange: (v: string) => void;
  onEditDomainChange: (v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const cfg = item.domain ? DOMAIN_CONFIG[item.domain] : null;
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(cfg ? { borderLeftWidth: 3, borderLeftColor: cfg.color } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`flex items-center gap-2 p-2.5 rounded-lg border ${
        item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button
        className="flex-shrink-0 p-0.5 rounded text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
        {...attributes} {...listeners} tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
        style={{ accentColor: cfg ? cfg.color : '#c45c8a' }}
      />
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            autoFocus
            className="input flex-1 text-sm py-0.5"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          />
          <select
            className="select text-sm py-0.5"
            value={editDomain}
            onChange={(e) => onEditDomainChange(e.target.value)}
          >
            <option value="">도메인 없음</option>
            {domains.map((d) => <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>)}
          </select>
          <button className="btn-primary text-xs px-2 py-0.5" onClick={onSaveEdit}>저장</button>
          <button className="btn-secondary text-xs px-2 py-0.5" onClick={onCancelEdit}>취소</button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
            {item.title}
          </span>
          {cfg && (
            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${cfg.color}20`, color: cfg.color }}>
              {cfg.label}
            </span>
          )}
          <button className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0" onClick={onStartEdit}>
            <Edit2 size={13} />
          </button>
          <button className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0" onClick={onDelete}>
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  );
}
