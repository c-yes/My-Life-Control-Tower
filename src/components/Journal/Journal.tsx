import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, JournalType, JOURNAL_TYPE_CONFIG } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, Check, X, Edit2, ChevronDown, ChevronRight } from 'lucide-react';

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const TODAY = new Date().toISOString().slice(0, 10);
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const DOMAIN_OPTIONS = Object.keys(DOMAIN_CONFIG) as Domain[];
const TYPE_OPTIONS = Object.keys(JOURNAL_TYPE_CONFIG) as JournalType[];

function getType(t?: JournalType): JournalType {
  return t ?? 'memo';
}

const emptyForm = {
  date: TODAY,
  title: '',
  content: '',
  type: 'memo' as JournalType,
  domain: '' as Domain | '',
  status: 'open' as 'open' | 'done',
};

export default function Journal() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useStore();

  const [year, setYear] = useState(CURRENT_YEAR);
  const [activeMonth, setActiveMonth] = useState(CURRENT_MONTH);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const yearEntries = journalEntries.filter((e) => e.year === year);
  const monthsWithEntries = new Set(yearEntries.map((e) => e.month));
  const monthEntries = yearEntries
    .filter((e) => e.month === activeMonth)
    .sort((a, b) => a.date.localeCompare(b.date));

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (!form.title.trim() || !form.date) return;
    const d = new Date(form.date);
    const typeCfg = JOURNAL_TYPE_CONFIG[form.type];
    addJournalEntry({
      id: generateId(),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: form.date,
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      status: typeCfg.hasStatus ? form.status : 'open',
      domain: form.domain || undefined,
    });
    setForm(emptyForm);
    setShowAddForm(false);
  }

  function startEdit(entry: typeof journalEntries[0]) {
    setEditingId(entry.id);
    setEditForm({
      date: entry.date,
      title: entry.title,
      content: entry.content,
      type: getType(entry.type),
      domain: entry.domain ?? '',
      status: entry.status,
    });
  }

  function saveEdit() {
    if (!editingId || !editForm.title.trim()) return;
    const d = new Date(editForm.date);
    const typeCfg = JOURNAL_TYPE_CONFIG[editForm.type];
    updateJournalEntry(editingId, {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: editForm.date,
      title: editForm.title.trim(),
      content: editForm.content.trim(),
      type: editForm.type,
      status: typeCfg.hasStatus ? editForm.status : 'open',
      domain: editForm.domain || undefined,
    });
    setEditingId(null);
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

  return (
    <div className="space-y-6 fade-in">
      {/* Year + Add */}
      <div className="flex items-center justify-between">
        <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearOptions.map((y) => <option key={y} value={y}>{y}년</option>)}
        </select>
        <button className="btn-primary flex items-center gap-1" onClick={() => { setShowAddForm(true); setEditingId(null); }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Month tabs */}
      <div className="flex flex-wrap gap-1.5">
        {MONTHS.map((label, idx) => {
          const m = idx + 1;
          const hasEntries = monthsWithEntries.has(m);
          const isActive = activeMonth === m;
          return (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-pink-500 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              <span className={hasEntries && !isActive ? 'font-bold text-slate-700' : ''}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <EntryForm
          form={form}
          setForm={setForm}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Empty state */}
      {monthEntries.length === 0 && !showAddForm && (
        <div className="card text-center py-12">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-slate-400 text-sm">{year}년 {activeMonth}월 기록이 없습니다.</p>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-2">
        {monthEntries.map((entry) => {
          const type = getType(entry.type);
          const typeCfg = JOURNAL_TYPE_CONFIG[type];
          const domainCfg = entry.domain ? DOMAIN_CONFIG[entry.domain] : null;
          const isExpanded = expandedIds.has(entry.id);
          const isEditing = editingId === entry.id;

          if (isEditing) {
            return (
              <div key={entry.id} className="card border-pink-200">
                <EntryForm
                  form={editForm}
                  setForm={setEditForm}
                  onSave={saveEdit}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            );
          }

          return (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
              style={{ borderLeftWidth: 3, borderLeftColor: typeCfg.color }}
            >
              <div className="flex items-center gap-2 px-4 py-3">
                {/* Expand toggle */}
                <button className="text-slate-300 hover:text-slate-500 flex-shrink-0" onClick={() => toggleExpand(entry.id)}>
                  {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>

                {/* Type badge */}
                <span
                  className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${typeCfg.color}18`, color: typeCfg.color }}
                >
                  {typeCfg.emoji} {typeCfg.labelKo}
                </span>

                {/* Status badge (only for types that need it) */}
                {typeCfg.hasStatus && (
                  <button
                    className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      entry.status === 'done'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                    onClick={() => updateJournalEntry(entry.id, { status: entry.status === 'open' ? 'done' : 'open' })}
                  >
                    {entry.status === 'done' ? 'Done' : 'Open'}
                  </button>
                )}

                {/* Date */}
                <span className="text-xs text-slate-400 flex-shrink-0">{entry.date}</span>

                {/* Domain badge */}
                {domainCfg && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${domainCfg.color}18`, color: domainCfg.color }}
                  >
                    {domainCfg.label}
                  </span>
                )}

                {/* Title */}
                <span className={`flex-1 text-sm font-medium min-w-0 truncate ${
                  typeCfg.hasStatus && entry.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
                }`}>
                  {entry.title}
                </span>

                {/* Actions */}
                <button className="p-1.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0" onClick={() => startEdit(entry)}>
                  <Edit2 size={14} />
                </button>
                <button className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0" onClick={() => deleteJournalEntry(entry.id)}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded content */}
              {isExpanded && entry.content && (
                <div className="px-4 pb-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap pt-3">{entry.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared form component ─────────────────────────────────────────────────────

interface FormState {
  date: string;
  title: string;
  content: string;
  type: JournalType;
  domain: Domain | '';
  status: 'open' | 'done';
}

function EntryForm({
  form,
  setForm,
  onSave,
  onCancel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const typeCfg = JOURNAL_TYPE_CONFIG[form.type];

  return (
    <div className="space-y-3">
      {/* Row 1: type + date */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">유형</label>
          <select
            className="select w-full"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as JournalType })}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {JOURNAL_TYPE_CONFIG[t].emoji} {JOURNAL_TYPE_CONFIG[t].labelKo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">날짜</label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
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
        {/* Status: only show when type requires it */}
        {typeCfg.hasStatus && (
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">상태</label>
            <select
              className="select w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'open' | 'done' })}
            >
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>

      {/* Title */}
      <input
        className="input"
        placeholder="제목..."
        value={form.title}
        autoFocus
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
      />

      {/* Content */}
      <textarea
        className="textarea h-24"
        placeholder="내용 (선택)"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />

      <div className="flex gap-2">
        <button className="btn-primary flex items-center gap-1" onClick={onSave}>
          <Check size={14} /> Save
        </button>
        <button className="btn-secondary flex items-center gap-1" onClick={onCancel}>
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}
