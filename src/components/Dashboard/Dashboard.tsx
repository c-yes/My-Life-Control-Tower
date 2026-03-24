import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { DOMAIN_CONFIG } from '../../types';
import {
  getTodayString,
  getCurrentYear,
  getCurrentMonth,
  getCurrentWeek,
  formatDateDisplay,
  calculateStreak,
} from '../../utils/helpers';

const sections = [
  { path: '/life-compass', emoji: '🧭', title: 'Life Compass', subtitle: '삶의 나침반', color: '#6366f1', bg: '#eef2ff' },
  { path: '/annual-goals', emoji: '🎯', title: 'Annual Goals', subtitle: '연간 목표', color: '#10b981', bg: '#ecfdf5' },
  { path: '/monthly-plan', emoji: '📅', title: 'Monthly Plan', subtitle: '월간 계획', color: '#f59e0b', bg: '#fffbeb' },
  { path: '/weekly-plan', emoji: '📋', title: 'Weekly Plan', subtitle: '주간 계획', color: '#3b82f6', bg: '#eff6ff' },
  { path: '/daily-plan', emoji: '✅', title: 'Daily Plan', subtitle: '일간 계획', color: '#8b5cf6', bg: '#f5f3ff' },
  { path: '/time-block', emoji: '⏰', title: 'Time Block', subtitle: '타임블록', color: '#ec4899', bg: '#fdf2f8' },
  { path: '/miracle21', emoji: '⭐', title: 'Miracle 21', subtitle: 'Miracle21', color: '#f97316', bg: '#fff7ed' },
  { path: '/mind-map', emoji: '🧠', title: 'Mind Map', subtitle: '마인드맵', color: '#14b8a6', bg: '#f0fdfa' },
  { path: '/domain-tracker', emoji: '📊', title: 'Domain Tracker', subtitle: '도메인 트래커', color: '#6366f1', bg: '#eef2ff' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dailyPlans,
    habits,
    annualGoals,
    monthlyGoals,
    weeklyTasks,
    domainScores,
    lifeCompass,
  } = useStore();

  const today = getTodayString();
  const year = getCurrentYear();
  const month = getCurrentMonth();
  const week = getCurrentWeek();

  const todayPlan = dailyPlans.find((p) => p.date === today);
  const todayTasks = todayPlan?.tasks ?? [];
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const taskCompletionPct = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const thisMonthGoals = monthlyGoals.filter((g) => g.year === year && g.month === month);
  const completedMonthGoals = thisMonthGoals.filter((g) => g.completed).length;

  const thisWeekTasks = weeklyTasks.filter((t) => t.year === year && t.week === week);
  const completedWeekTasks = thisWeekTasks.filter((t) => t.completed).length;

  const thisYearGoals = annualGoals.filter((g) => g.year === year);

  const avgDomainScore =
    domainScores.length > 0
      ? Math.round(domainScores.reduce((acc, ds) => acc + ds.score, 0) / domainScores.length * 10) / 10
      : 0;

  const bestHabitStreak = habits.reduce((max, h) => {
    const streak = calculateStreak(h.completions, h.startDate);
    return streak > max ? streak : max;
  }, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome to Your Control Tower 🗼
            </h2>
            <p className="text-slate-500 mt-1">{formatDateDisplay(new Date())} — Manage your life intentionally.</p>
            {lifeCompass.mission && (
              <blockquote className="mt-3 pl-3 border-l-4 border-indigo-400 text-sm text-slate-600 italic">
                {lifeCompass.mission}
              </blockquote>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Tasks"
          value={`${completedToday}/${todayTasks.length}`}
          sub={`${taskCompletionPct}% done`}
          color="#6366f1"
          emoji="✅"
          onClick={() => navigate('/daily-plan')}
        />
        <StatCard
          label="This Week"
          value={`${completedWeekTasks}/${thisWeekTasks.length}`}
          sub="tasks completed"
          color="#3b82f6"
          emoji="📋"
          onClick={() => navigate('/weekly-plan')}
        />
        <StatCard
          label="Monthly Goals"
          value={`${completedMonthGoals}/${thisMonthGoals.length}`}
          sub="goals achieved"
          color="#10b981"
          emoji="📅"
          onClick={() => navigate('/monthly-plan')}
        />
        <StatCard
          label="Best Streak"
          value={`${bestHabitStreak}`}
          sub="days in a row"
          color="#f97316"
          emoji="⭐"
          onClick={() => navigate('/miracle21')}
        />
      </div>

      {/* Domain Scores */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Life Domains — 삶의 영역 (avg: {avgDomainScore}/10)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainScores.map((ds) => {
            const cfg = DOMAIN_CONFIG[ds.domain];
            return (
              <div
                key={ds.domain}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                style={{ background: `${cfg.color}10` }}
                onClick={() => navigate('/domain-tracker')}
              >
                <span className="text-2xl mb-1">{cfg.emoji}</span>
                <span className="text-xs font-medium text-slate-600">{cfg.labelKo}</span>
                <span className="text-lg font-bold mt-1" style={{ color: cfg.color }}>
                  {ds.score}
                </span>
                <div className="w-full mt-2 progress-bar" style={{ background: `${cfg.color}20` }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${ds.score * 10}%`, background: cfg.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Annual Goals Summary */}
      {thisYearGoals.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Annual Goals {year} — 연간 목표</h3>
            <button className="btn-secondary text-xs" onClick={() => navigate('/annual-goals')}>
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {thisYearGoals.slice(0, 4).map((goal) => {
              const cfg = DOMAIN_CONFIG[goal.domain];
              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-lg">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">{goal.title}</span>
                      <span className="text-xs text-slate-500 ml-2">{goal.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${goal.progress}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4">Quick Access — 빠른 이동</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sections.map((s) => (
            <button
              key={s.path}
              className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
              onClick={() => navigate(s.path)}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
                style={{ background: s.bg }}
              >
                {s.emoji}
              </div>
              <div className="font-semibold text-slate-800 text-sm">{s.title}</div>
              <div className="text-xs text-slate-500">{s.subtitle}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  emoji,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
          {value}
        </span>
      </div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
