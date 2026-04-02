import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, TRACKER_DOMAINS } from '../../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DOMAINS = TRACKER_DOMAINS;
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekDates(base: Date): Date[] {
  const monday = startOfWeek(base, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export default function DomainTracker() {
  const { dailyPlans } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [visibleDomains, setVisibleDomains] = useState<Set<Domain>>(new Set(DOMAINS));

  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekDates = getWeekDates(baseDate);
  const today = format(new Date(), 'yyyy-MM-dd');

  function getTasksForCell(dateStr: string, domain: Domain) {
    const plan = dailyPlans.find((p) => p.date === dateStr);
    return (plan?.tasks ?? []).filter((t) => t.domain === domain);
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

  // Weekly summary: completed tasks per domain
  function weeklyStats(domain: Domain) {
    let total = 0, completed = 0;
    weekDates.forEach((d) => {
      const tasks = getTasksForCell(format(d, 'yyyy-MM-dd'), domain);
      total += tasks.length;
      completed += tasks.filter((t) => t.completed).length;
    });
    return { total, completed };
  }

  const shownDomains = DOMAINS.filter((d) => visibleDomains.has(d));

  const weekLabel = (() => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    return `${format(weekDates[0], 'M.d')} — ${format(weekDates[6], 'M.d')}`;
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
              <span className="w-2 h-2 rounded-full" style={{ background: active ? cfg.color : '#cbd5e1' }} />
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
        <span className="text-sm font-semibold text-slate-700 min-w-24 text-center">{weekLabel}</span>
        <button
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={18} className={weekOffset >= 0 ? 'text-slate-200' : 'text-slate-500'} />
        </button>
        {weekOffset !== 0 && (
          <button className="text-xs text-indigo-500 hover:underline" onClick={() => setWeekOffset(0)}>
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
                    <div className="font-bold text-sm tracking-wide" style={{ color: cfg.color, fontFamily: 'monospace' }}>
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
                  style={{ background: isToday ? '#fffbf5' : dayIdx % 2 === 0 ? '#fafafa' : '#fff' }}
                >
                  <td className="py-3 px-3 border-r border-slate-100">
                    <div className="font-bold text-sm" style={{ color: isToday ? '#f97316' : '#475569' }}>
                      {dayLabel}
                    </div>
                    <div className="text-xs text-slate-400">{dateLabel}</div>
                  </td>

                  {shownDomains.map((domain) => {
                    const cfg = DOMAIN_CONFIG[domain];
                    const tasks = getTasksForCell(dateStr, domain);
                    const completedCount = tasks.filter((t) => t.completed).length;

                    return (
                      <td
                        key={domain}
                        className="py-2 px-3 border-r border-slate-100 align-top"
                        style={{ borderLeft: `2px solid ${cfg.color}30` }}
                      >
                        {tasks.length === 0 ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-xs font-medium" style={{ color: cfg.color }}>
                              {completedCount}/{tasks.length}
                            </div>
                            {tasks.map((t) => (
                              <div
                                key={t.id}
                                className={`text-xs leading-snug ${
                                  t.completed ? 'line-through text-slate-400' : 'text-slate-600'
                                }`}
                              >
                                {t.title}
                              </div>
                            ))}
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

      {/* Weekly summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shownDomains.map((domain) => {
            const cfg = DOMAIN_CONFIG[domain];
            const { total, completed } = weeklyStats(domain);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div
                key={domain}
                className="rounded-xl p-4 border"
                style={{ background: '#0f0f1a', borderColor: `${cfg.color}30` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm" style={{ color: cfg.color, fontFamily: 'monospace' }}>
                    {cfg.label}
                  </div>
                  <div className="text-xs text-slate-400">{completed}/{total}</div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: cfg.color }}
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
