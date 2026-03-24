import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import {
  generateId,
  getCurrentYear,
  getCurrentWeek,
  getWeekDays,
  DAYS_OF_WEEK,
  formatDateDisplay,
} from '../../utils/helpers';
import { Plus, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function WeeklyPlan() {
  const navigate = useNavigate();
  const { weeklyTasks, addWeeklyTask, updateWeeklyTask, deleteWeeklyTask, monthlyGoals } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [week, setWeek] = useState(getCurrentWeek());
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    dayOfWeek: 0,
    monthlyGoalId: '',
  });

  const tasks = weeklyTasks.filter((t) => t.year === year && t.week === week);
  const completedCount = tasks.filter((t) => t.completed).length;
  const achievementPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const weekDays = getWeekDays(year, week);
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  function handleAdd() {
    if (!form.title.trim()) return;
    addWeeklyTask({
      id: generateId(),
      title: form.title.trim(),
      domain: form.domain,
      dayOfWeek: form.dayOfWeek,
      completed: false,
      year,
      week,
      monthlyGoalId: form.monthlyGoalId || undefined,
    });
    setForm({ title: '', domain: 'output', dayOfWeek: 0, monthlyGoalId: '' });
    setShowAddForm(false);
  }

  const relevantMonthlyGoals = monthlyGoals.filter((g) => g.year === year);

  const weekRange =
    weekDays.length > 0
      ? `${formatDateDisplay(weekDays[0])} – ${formatDateDisplay(weekDays[6])}`
      : '';

  const totalWeeks = 52;

  return (
    <div className="space-y-6 fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select className="select" value={week} onChange={(e) => setWeek(Number(e.target.value))}>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400">{weekRange}</span>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Achievement */}
      {tasks.length > 0 && (
        <div className="card py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Achievement</span>
            <span className="text-sm font-bold text-pink-500">{achievementPct}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill h-3"
              style={{ width: `${achievementPct}%`, background: '#ec4899' }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">{completedCount} of {tasks.length} tasks completed</div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">New Weekly Task</h3>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Task title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="grid grid-cols-2 gap-3">
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
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
              >
                {DAYS_OF_WEEK.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <select
              className="select w-full"
              value={form.monthlyGoalId}
              onChange={(e) => setForm({ ...form, monthlyGoalId: e.target.value })}
            >
              <option value="">No linked monthly goal</option>
              {relevantMonthlyGoals.map((mg) => (
                <option key={mg.id} value={mg.id}>
                  {mg.title}
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

      {/* Section: Goals */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Goals</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {tasks.length === 0 && !showAddForm ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No tasks for week {week}.</p>
          <button className="btn-primary mt-3" onClick={() => setShowAddForm(true)}>
            Add First Task
          </button>
        </div>
      ) : (
        <>
          {/* Section: Plan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Plan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* 7-column grid */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, dayIdx) => {
              const dayTasks = tasks.filter((t) => t.dayOfWeek === dayIdx);
              const dayDate = weekDays[dayIdx];
              const isToday =
                dayDate && format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={dayIdx}
                  className={`rounded-xl border p-3 min-h-32 ${
                    isToday
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-2">
                    <div
                      className={`text-xs font-bold ${isToday ? 'text-pink-700' : 'text-slate-600'}`}
                    >
                      {day.slice(0, 3)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {dayDate ? format(dayDate, 'M/d') : ''}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {dayTasks.map((task) => {
                      const cfg = DOMAIN_CONFIG[task.domain];
                      return (
                        <div
                          key={task.id}
                          className="group flex items-start gap-1.5 p-1.5 rounded-lg hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => updateWeeklyTask(task.id, { completed: !task.completed })}
                            className="mt-0.5 w-3 h-3 rounded cursor-pointer flex-shrink-0"
                            style={{ accentColor: cfg.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-xs leading-tight ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-700'
                              }`}
                            >
                              {task.title}
                            </div>
                            <span
                              className="inline-block mt-0.5 text-xs px-1 rounded"
                              style={{ background: `${cfg.color}20`, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
                            onClick={() => deleteWeeklyTask(task.id)}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="mt-2 w-full text-xs text-slate-400 hover:text-pink-500 flex items-center justify-center gap-1 py-1 rounded hover:bg-pink-50"
                    onClick={() => {
                      setForm({ ...form, dayOfWeek: dayIdx });
                      setShowAddForm(true);
                    }}
                  >
                    <Plus size={11} /> Add
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Link to Daily */}
      {tasks.length > 0 && (
        <div className="card bg-pink-50 border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-pink-800">Plan your day</h4>
              <p className="text-sm text-pink-600 mt-0.5">Break down today's tasks in the daily plan.</p>
            </div>
            <button
              className="btn-primary flex items-center gap-1"
              onClick={() => navigate('/daily-plan')}
            >
              Daily Plan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
