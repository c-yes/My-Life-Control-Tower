import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { DOMAIN_CONFIG } from '../../types';
import { getCurrentYear, getCurrentMonth } from '../../utils/helpers';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Achievements() {
  const [viewYear, setViewYear] = useState(getCurrentYear());
  const [viewMonth, setViewMonth] = useState(getCurrentMonth());

  const { dailyPlans, monthlyGoals, annualGoals } = useStore();

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getDailyScore(dateStr: string): number | null {
    const plan = dailyPlans.find((p) => p.date === dateStr);
    if (!plan) return null;
    const tasks = plan.tasks;
    if (tasks.length === 0) return null;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  }

  function getMonthlyScore(year: number, month: number): number | null {
    const goals = monthlyGoals.filter((g) => g.year === year && g.month === month);
    if (goals.length === 0) return null;
    return Math.round((goals.filter((g) => g.completed).length / goals.length) * 100);
  }

  function scoreColor(score: number): string {
    if (score >= 80) return '#c45c8a';
    if (score >= 50) return '#f9a8d4';
    if (score >= 20) return '#fce7f3';
    return '#fdf2f8';
  }

  function scoreTextColor(score: number): string {
    return score >= 50 ? '#831843' : '#94a3b8';
  }

  // ── Calendar data ─────────────────────────────────────────────────────────

  const monthStart = startOfMonth(new Date(viewYear, viewMonth - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Start on Monday (0=Mon … 6=Sun)
  const startDayOfWeek = (monthStart.getDay() + 6) % 7;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const thisYear = getCurrentYear();
  const thisMonth = getCurrentMonth();

  const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ── Navigation ────────────────────────────────────────────────────────────

  function prevMonth() {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else setViewMonth((m) => m + 1);
  }

  const thisYearGoals = annualGoals.filter((g) => g.year === viewYear);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-slate-900">Achievements</h2>

      {/* Month Navigation */}
      <div className="flex items-center gap-3">
        <button className="btn-secondary p-1.5" onClick={prevMonth}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-[6rem] text-center">
          {viewYear}년 {viewMonth}월
        </span>
        <button className="btn-secondary p-1.5" onClick={nextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Daily Heatmap Calendar ─────────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Daily Achievements</h3>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_HEADER.map((d) => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const score = getDailyScore(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className={`relative rounded-lg flex flex-col items-center justify-center py-1.5 ${
                  isToday ? 'ring-2 ring-pink-400 ring-offset-1' : ''
                }`}
                style={{
                  background: score !== null ? scoreColor(score) : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  minHeight: '2.75rem',
                }}
                title={score !== null ? `${dateStr}: ${score}% complete` : dateStr}
              >
                <span
                  className="text-xs font-medium leading-none"
                  style={{ color: score !== null ? scoreTextColor(score) : '#94a3b8' }}
                >
                  {format(day, 'd')}
                </span>
                {score !== null && (
                  <span
                    className="text-[10px] font-bold leading-none mt-0.5"
                    style={{ color: scoreTextColor(score) }}
                  >
                    {score}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="text-xs text-slate-400">Legend:</span>
          {[
            { label: 'No data', bg: '#f8fafc' },
            { label: '1–19%', bg: '#fdf2f8' },
            { label: '20–49%', bg: '#fce7f3' },
            { label: '50–79%', bg: '#f9a8d4' },
            { label: '80%+', bg: '#c45c8a' },
          ].map(({ label, bg }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: bg, border: '1px solid #e2e8f0' }} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Monthly Overview (whole year) ──────────────────────────────────── */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-4">Monthly Goals ({viewYear})</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const score = getMonthlyScore(viewYear, m);
            const isCurrentMonth = viewYear === thisYear && m === thisMonth;
            const isSelected = viewMonth === m;

            return (
              <div
                key={m}
                className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-pink-400' : ''
                } ${isCurrentMonth && !isSelected ? 'border-2 border-pink-200' : 'border border-slate-200'}`}
                style={{ background: score !== null ? scoreColor(score) : '#f8fafc' }}
                onClick={() => setViewMonth(m)}
                title={score !== null ? `${m}월: ${score}% 달성` : `${m}월: 데이터 없음`}
              >
                <div
                  className="text-xs font-semibold"
                  style={{ color: score !== null ? scoreTextColor(score) : '#94a3b8' }}
                >
                  {m}월
                </div>
                <div
                  className="text-sm font-bold mt-0.5"
                  style={{ color: score !== null ? scoreTextColor(score) : '#cbd5e1' }}
                >
                  {score !== null ? `${score}%` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Annual Goals ───────────────────────────────────────────────────── */}
      {thisYearGoals.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Annual Goals ({viewYear})</h3>
          <div className="space-y-4">
            {thisYearGoals.map((goal) => {
              const cfg = DOMAIN_CONFIG[goal.domain];
              const completedMilestones = goal.milestones.filter((m) => m.completed).length;
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: `${cfg.color}20`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-sm text-slate-700 truncate">{goal.title}</span>
                    </div>
                    <span className="text-sm font-bold ml-2 flex-shrink-0" style={{ color: cfg.color }}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div
                      className="progress-fill h-3"
                      style={{ width: `${goal.progress}%`, background: cfg.color }}
                    />
                  </div>
                  {goal.milestones.length > 0 && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {completedMilestones}/{goal.milestones.length} milestones
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {thisYearGoals.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-slate-400 text-sm">{viewYear}년 연간 목표가 없어요.</p>
        </div>
      )}
    </div>
  );
}
