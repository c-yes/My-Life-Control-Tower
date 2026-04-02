import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { DOMAIN_CONFIG, TRACKER_DOMAINS } from '../../types';
import {
  getTodayString,
  getCurrentYear,
  getCurrentMonth,
  getCurrentWeek,
  formatDateDisplay,
  calculateStreak,
} from '../../utils/helpers';
import { startOfWeek, addDays, format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    dailyPlans,
    habits,
    annualGoals,
    monthlyGoals,
    weeklyTasks,
    domainEntries,
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

  // Domain activity: count days this week each domain has an entry
  const weekMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekMonday, i), 'yyyy-MM-dd')
  );
  const domainActivity = TRACKER_DOMAINS.map((domain) => ({
    domain,
    count: thisWeekDates.filter((d) =>
      domainEntries.some((e) => e.date === d && e.domain === domain && e.note.trim())
    ).length,
  }));
  const avgDomainActivity = domainActivity.length > 0
    ? Math.round(domainActivity.reduce((s, d) => s + d.count, 0) / domainActivity.length * 10) / 10
    : 0;

  const bestHabitStreak = habits.reduce((max, h) => {
    const streak = calculateStreak(h.completions, h.startDate);
    return streak > max ? streak : max;
  }, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Date & Affirmation */}
      <div className="card">
        <div className="w-full">
          <p className="text-slate-500">{formatDateDisplay(new Date())}</p>
          {todayPlan?.affirmation && (
            <blockquote className="mt-3 pl-3 border-l-4 border-pink-400 text-sm text-slate-700">
              {todayPlan.affirmation}
            </blockquote>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Today's Tasks"
          value={`${completedToday}/${todayTasks.length}`}
          sub={`${taskCompletionPct}% done`}
          color="#ec4899"
          onClick={() => navigate('/daily-plan')}
        />
        <StatCard
          label="This Week"
          value={`${completedWeekTasks}/${thisWeekTasks.length}`}
          sub="tasks completed"
          color="#3b82f6"
          onClick={() => navigate('/weekly-plan')}
        />
        <StatCard
          label="Monthly Goals"
          value={`${completedMonthGoals}/${thisMonthGoals.length}`}
          sub="goals achieved"
          color="#10b981"
          onClick={() => navigate('/monthly-plan')}
        />
        <StatCard
          label="Best Streak"
          value={`${bestHabitStreak}`}
          sub="days in a row"
          color="#f97316"
          onClick={() => navigate('/miracle21')}
        />
      </div>

      {/* Domain Activity (this week) */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">
          이번 주 Domain 활동 (평균 {avgDomainActivity}/7일)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {domainActivity.map(({ domain, count }) => {
            const cfg = DOMAIN_CONFIG[domain];
            return (
              <div
                key={domain}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                style={{ background: `${cfg.color}10` }}
                onClick={() => navigate('/domain-tracker')}
              >
                <span className="text-xs font-medium text-slate-600 text-center">{cfg.label}</span>
                <span className="text-2xl font-bold mt-1" style={{ color: cfg.color }}>{count}</span>
                <span className="text-xs text-slate-400">/ 7일</span>
                <div className="w-full mt-2 progress-bar" style={{ background: `${cfg.color}20` }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${(count / 7) * 100}%`, background: cfg.color }}
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
            <h3 className="font-bold text-slate-900">Annual {year}</h3>
            <button className="btn-secondary text-xs" onClick={() => navigate('/annual-goals')}>
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {thisYearGoals.slice(0, 4).map((goal) => {
              const cfg = DOMAIN_CONFIG[goal.domain];
              return (
                <div key={goal.id} className="flex items-center gap-3">
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
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
          {value}
        </span>
      </div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
