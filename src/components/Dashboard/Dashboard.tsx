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
    miracle21Habits,
    annualGoals,
    monthlyGoals,
    weeklyTasks,
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

  // Domain activity: this week's completed/total tasks per domain from Daily Plans
  const weekMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekMonday, i), 'yyyy-MM-dd')
  );
  const thisWeekPlans = dailyPlans.filter((p) => thisWeekDates.includes(p.date));
  const domainActivity = TRACKER_DOMAINS.map((domain) => {
    const tasks = thisWeekPlans.flatMap((p) => p.tasks.filter((t) => t.domain === domain));
    return { domain, total: tasks.length, completed: tasks.filter((t) => t.completed).length };
  });

  const bestHabitStreak = habits.reduce((max, h) => {
    const streak = calculateStreak(h.completions, h.startDate);
    return streak > max ? streak : max;
  }, 0);

  // Miracle21 streak: longest consecutive completed days (today backwards) across all habits/steps
  const bestMiracle21Streak = miracle21Habits.reduce((max, habit) => {
    // Build a set of all completed dates across all steps
    const completedDates = new Set<string>();
    habit.steps.forEach((step) => {
      step.days.forEach((day, idx) => {
        if (day.completed) {
          const d = new Date(step.startDate + 'T12:00:00');
          d.setDate(d.getDate() + idx);
          completedDates.add(format(d, 'yyyy-MM-dd'));
        }
      });
    });
    // Count consecutive days from today backwards
    let streak = 0;
    const cur = new Date(today + 'T12:00:00');
    while (completedDates.has(format(cur, 'yyyy-MM-dd'))) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak > max ? streak : max;
  }, 0);

  const bestStreak = Math.max(bestHabitStreak, bestMiracle21Streak);

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
          value={`${bestStreak}`}
          sub="days in a row"
          color="#f97316"
          onClick={() => navigate('/miracle21')}
        />
      </div>

      {/* Domain Activity (this week from Daily tasks) */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">This Week's Domain Tasks</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainActivity.map(({ domain, total, completed }) => {
            const cfg = DOMAIN_CONFIG[domain];
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div
                key={domain}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                style={{ background: `${cfg.color}10` }}
                onClick={() => navigate('/domain-tracker')}
              >
                <span className="text-xs font-medium text-slate-600 text-center">{cfg.label}</span>
                <span className="text-2xl font-bold mt-1" style={{ color: cfg.color }}>
                  {total > 0 ? `${completed}/${total}` : '—'}
                </span>
                <span className="text-xs text-slate-400">{total > 0 ? `${pct}%` : '기록 없음'}</span>
                <div className="w-full mt-2 progress-bar" style={{ background: `${cfg.color}20` }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: cfg.color }} />
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
