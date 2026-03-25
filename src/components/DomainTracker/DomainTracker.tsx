import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DOMAINS = Object.keys(DOMAIN_CONFIG) as Domain[];
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekDates(base: Date): Date[] {
  const monday = startOfWeek(base, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export default function DomainTracker() {
  const { domainEntries, upsertDomainEntry } = useStore();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [visibleDomains, setVisibleDomains] = useState<Set<Domain>>(new Set(DOMAINS));
  const [editingCell, setEditingCell] = useState<{ date: string; domain: Domain } | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekDates = getWeekDates(baseDate);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  function getEntry(date: string, domain: Domain) {
    return domainEntries.find((e) => e.date === date && e.domain === domain);
  }

  function openEdit(date: string, domain: Domain) {
    const entry = getEntry(date, domain);
    setDraftNote(entry?.note ?? '');
    setEditingCell({ date, domain });
  }

  function commitEdit() {
    if (!editingCell) return;
    upsertDomainEntry(editingCell.date, editingCell.domain, draftNote);
    setEditingCell(null);
    setDraftNote('');
  }

  function toggleDomain(domain: Domain) {
    setVisibleDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        if (next.size > 1) next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }

  const shownDomains = DOMAINS.filter((d) => visibleDomains.has(d));

  // Weekly completion per domain = number of days that have a non-empty entry
  function weeklyCount(domain: Domain) {
    return weekDates.filter((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const entry = getEntry(dateStr, domain);
      return entry && entry.note.trim();
    }).length;
  }

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    return `${format(start, 'M.d')} — ${format(end, 'M.d')}`;
  })();

  return (
    <div className="space-y-6 fade-in">
      {/* Domain filter chips */}
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((domain) => {
          const cfg = DOMAIN_CONFIG[domain];
          const active = visibleDomains.has(domain);
          return (
            <button
              key={domain}
              onClick={() => toggleDomain(domain)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: active ? `${cfg.color}18` : 'transparent',
                borderColor: active ? cfg.color : '#e2e8f0',
                color: active ? cfg.color : '#94a3b8',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: active ? cfg.color : '#cbd5e1' }}
              />
              <span className="font-bold text-sm">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3">
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setWeekOffset((w) => w - 1)}
        >
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-24 text-center">
          {weekLabel}
        </span>
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight
            size={18}
            className={weekOffset >= 0 ? 'text-slate-200' : 'text-slate-500'}
          />
        </button>
        {weekOffset !== 0 && (
          <button
            className="text-xs text-indigo-500 hover:underline"
            onClick={() => setWeekOffset(0)}
          >
            This Week
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#0f0f1a' }}>
              <th className="w-14 py-3 px-3 text-left text-slate-400 text-xs font-medium">Date</th>
              {shownDomains.map((domain) => {
                const cfg = DOMAIN_CONFIG[domain];
                return (
                  <th key={domain} className="py-3 px-3 text-center min-w-36">
                    <div
                      className="font-bold text-sm tracking-wide"
                      style={{ color: cfg.color, fontFamily: 'monospace' }}
                    >
                      {cfg.label}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {weekDates.map((date, dayIdx) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isToday = dateStr === today;
              const dayLabel = DAY_LABELS[dayIdx];
              const dateLabel = format(date, 'M.d', { locale: ko });

              return (
                <tr
                  key={dateStr}
                  style={{
                    background: isToday ? '#fffbf5' : dayIdx % 2 === 0 ? '#fafafa' : '#fff',
                  }}
                >
                  {/* Day column */}
                  <td className="py-3 px-3 border-r border-slate-100">
                    <div
                      className="font-bold text-sm"
                      style={{ color: isToday ? '#f97316' : '#475569' }}
                    >
                      {dayLabel}
                    </div>
                    <div className="text-xs text-slate-400">{dateLabel}</div>
                  </td>

                  {shownDomains.map((domain) => {
                    const cfg = DOMAIN_CONFIG[domain];
                    const entry = getEntry(dateStr, domain);
                    const isEditing =
                      editingCell?.date === dateStr && editingCell?.domain === domain;
                    const isFuture = dateStr > today;

                    return (
                      <td
                        key={domain}
                        className="py-2 px-3 border-r border-slate-100 align-top"
                        style={{ borderLeft: `2px solid ${cfg.color}30` }}
                      >
                        {isEditing ? (
                          <textarea
                            ref={inputRef}
                            className="w-full text-xs resize-none rounded border border-slate-200 p-1.5 focus:outline-none focus:ring-1"
                            style={{ minHeight: 64, '--tw-ring-color': cfg.color } as React.CSSProperties}
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                setEditingCell(null);
                                setDraftNote('');
                              }
                            }}
                            placeholder="내용 입력..."
                          />
                        ) : (
                          <div
                            className="text-xs min-h-10 rounded px-1 py-0.5 cursor-text"
                            style={{
                              color: entry?.note ? '#334155' : '#cbd5e1',
                              cursor: isFuture ? 'not-allowed' : 'text',
                            }}
                            onClick={() => !isFuture && openEdit(dateStr, domain)}
                          >
                            {entry?.note || '—'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly completion summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shownDomains.map((domain) => {
            const cfg = DOMAIN_CONFIG[domain];
            const count = weeklyCount(domain);
            return (
              <div
                key={domain}
                className="rounded-xl p-4 border"
                style={{
                  background: '#0f0f1a',
                  borderColor: `${cfg.color}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="text-lg font-bold"
                    style={{ color: cfg.color, fontFamily: 'monospace' }}
                  >
                    {cfg.label}
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: cfg.color, fontFamily: 'monospace' }}
                  >
                    {count}
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${(count / 7) * 100}%`, background: cfg.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
