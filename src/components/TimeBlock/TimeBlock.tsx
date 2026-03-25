import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, TimeBlockData } from '../../types';
import { generateId, getTodayString, formatDateDisplay } from '../../utils/helpers';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

function getTextColor(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // relative luminance (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

const START_HOUR = 5;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const SLOT_HEIGHT = 56; // px per hour

const BLOCK_COLORS: { label: string; color: string }[] = [
  { label: 'Indigo', color: '#6366f1' },
  { label: 'Green', color: '#10b981' },
  { label: 'Amber', color: '#f59e0b' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Purple', color: '#8b5cf6' },
  { label: 'Pink', color: '#ec4899' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Teal', color: '#14b8a6' },
];

type BlockForm = {
  title: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  domain: Domain | '';
  color: string;
};

const defaultForm: BlockForm = {
  title: '',
  startHour: 9,
  startMinute: 0,
  endHour: 10,
  endMinute: 0,
  domain: '',
  color: '#6366f1',
};

export default function TimeBlock() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, timeBlockMemos, setTimeBlockMemo, dailyPlans } = useStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlockForm>(defaultForm);
  const [clickedHour, setClickedHour] = useState<number | null>(null);
  const [showMemos, setShowMemos] = useState(false);

  const blocks = timeBlocks.filter((b) => b.date === selectedDate);
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];
  const dailyTasks = dailyPlans.find((p) => p.date === selectedDate)?.tasks ?? [];
  const minutes = [0, 15, 30, 45];

  function openAddForm(hour?: number) {
    const h = hour ?? 9;
    setForm({ ...defaultForm, startHour: h, endHour: Math.min(h + 1, END_HOUR) });
    setEditingId(null);
    setShowForm(true);
    setClickedHour(hour ?? null);
  }

  function openEditForm(block: TimeBlockData) {
    setForm({
      title: block.title,
      startHour: block.startHour,
      startMinute: block.startMinute,
      endHour: block.endHour,
      endMinute: block.endMinute,
      domain: block.domain ?? '',
      color: block.color,
    });
    setEditingId(block.id);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;
    const startTotal = form.startHour * 60 + form.startMinute;
    const endTotal = form.endHour * 60 + form.endMinute;
    if (endTotal <= startTotal) return;

    if (editingId) {
      updateTimeBlock(editingId, {
        title: form.title.trim(),
        startHour: form.startHour,
        startMinute: form.startMinute,
        endHour: form.endHour,
        endMinute: form.endMinute,
        domain: form.domain || undefined,
        color: form.color,
      });
      setEditingId(null);
    } else {
      addTimeBlock({
        id: generateId(),
        date: selectedDate,
        title: form.title.trim(),
        startHour: form.startHour,
        startMinute: form.startMinute,
        endHour: form.endHour,
        endMinute: form.endMinute,
        domain: form.domain || undefined,
        color: form.color,
      });
    }
    setShowForm(false);
    setForm(defaultForm);
  }

  function blockTop(block: TimeBlockData): number {
    return ((block.startHour - START_HOUR) + block.startMinute / 60) * SLOT_HEIGHT;
  }

  function blockHeight(block: TimeBlockData): number {
    const duration = (block.endHour - block.startHour) + (block.endMinute - block.startMinute) / 60;
    return Math.max(duration * SLOT_HEIGHT, 20);
  }

  function formatTime(hour: number, minute: number): string {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn-secondary text-sm" onClick={() => setSelectedDate(getTodayString())}>
            Today
          </button>
          <button
            className="btn-secondary text-sm"
            onClick={() => setShowMemos((v) => !v)}
          >
            {showMemos ? '메모 숨기기' : '메모 보기'}
          </button>
          <button className="btn-primary flex items-center gap-1" onClick={() => openAddForm()}>
            <Plus size={14} /> Add Block
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Timeline */}
        <div className="flex-1 card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">
              {formatDateDisplay(new Date(selectedDate + 'T12:00:00'))} — {blocks.length} blocks
            </h3>
          </div>
          <div
            className="relative overflow-y-auto"
            style={{ height: `${TOTAL_HOURS * SLOT_HEIGHT + 32}px` }}
          >
            {/* Hour slots */}
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start"
                  style={{ top: i * SLOT_HEIGHT }}
                >
                  <div className="w-14 flex-shrink-0 text-right pr-3 pt-0.5">
                    <span className="text-xs text-slate-400 font-mono">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                  <div
                    className="flex-1 border-t border-slate-100 cursor-pointer hover:bg-indigo-50 transition-colors"
                    style={{ height: SLOT_HEIGHT }}
                    onClick={() => openAddForm(hour)}
                  />
                  {showMemos && (
                    <div
                      className="w-44 flex-shrink-0 border-t border-l border-slate-100 flex items-center px-2"
                      style={{ height: SLOT_HEIGHT }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        className="w-full text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-300"
                        placeholder="메모..."
                        value={timeBlockMemos[`${selectedDate}__${hour}`] ?? ''}
                        onChange={(e) => setTimeBlockMemo(selectedDate, hour, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Time blocks */}
            {blocks.map((block) => {
              const cfg = block.domain ? DOMAIN_CONFIG[block.domain] : null;
              const top = blockTop(block);
              const height = blockHeight(block);
              const bgColor = cfg ? cfg.color : block.color;
              const textColor = getTextColor(bgColor);
              return (
                <div
                  key={block.id}
                  className={`absolute left-16 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${showMemos ? 'right-48' : 'right-4'}`}
                  style={{
                    top,
                    height: Math.max(height, 28),
                    background: bgColor,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditForm(block);
                  }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate" style={{ color: textColor }}>{block.title}</div>
                      {height >= 36 && (
                        <div className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
                          {formatTime(block.startHour, block.startMinute)} – {formatTime(block.endHour, block.endMinute)}
                          {cfg && ` · ${cfg.label}`}
                        </div>
                      )}
                    </div>
                    <button
                      className="opacity-60 hover:opacity-100 flex-shrink-0"
                      style={{ color: textColor }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTimeBlock(block.id);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="w-72 flex-shrink-0">
            <div className="card sticky top-0">
              <h3 className="font-bold text-slate-800 mb-4">
                {editingId ? 'Edit Block' : 'New Block'}
              </h3>
              <div className="space-y-3">
                {dailyTasks.length > 0 && (
                  <datalist id="daily-tasks-list">
                    {dailyTasks.map((t) => (
                      <option key={t.id} value={t.title} />
                    ))}
                  </datalist>
                )}
                <input
                  className="input"
                  placeholder="Block title..."
                  value={form.title}
                  list={dailyTasks.length > 0 ? 'daily-tasks-list' : undefined}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
                  <div className="flex gap-2">
                    <select
                      className="select flex-1"
                      value={form.startHour}
                      onChange={(e) => setForm({ ...form, startHour: Number(e.target.value) })}
                    >
                      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      className="select flex-1"
                      value={form.startMinute}
                      onChange={(e) => setForm({ ...form, startMinute: Number(e.target.value) })}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">End Time</label>
                  <div className="flex gap-2">
                    <select
                      className="select flex-1"
                      value={form.endHour}
                      onChange={(e) => setForm({ ...form, endHour: Number(e.target.value) })}
                    >
                      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select
                      className="select flex-1"
                      value={form.endMinute}
                      onChange={(e) => setForm({ ...form, endMinute: Number(e.target.value) })}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Domain (optional)</label>
                  <select
                    className="select w-full"
                    value={form.domain}
                    onChange={(e) => {
                      const val = e.target.value as Domain | '';
                      const color = val ? DOMAIN_CONFIG[val].color : form.color;
                      setForm({ ...form, domain: val, color });
                    }}
                  >
                    <option value="">No domain</option>
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {DOMAIN_CONFIG[d].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {BLOCK_COLORS.map(({ color }) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border-2 transition-all"
                        style={{
                          background: color,
                          borderColor: form.color === color ? '#1e293b' : 'transparent',
                          transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                        }}
                        onClick={() => setForm({ ...form, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="btn-primary flex-1 flex items-center justify-center gap-1" onClick={handleSave}>
                    <Check size={14} /> Save
                  </button>
                  <button
                    className="btn-secondary flex items-center gap-1"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {editingId && (
                  <button
                    className="btn-danger w-full flex items-center justify-center gap-1"
                    onClick={() => {
                      deleteTimeBlock(editingId);
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    <Trash2 size={14} /> Delete Block
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
