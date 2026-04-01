import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import {
  generateId,
  getCurrentYear,
  getCurrentWeek,
  getCurrentMonth,
  getWeekDays,
  DAYS_OF_WEEK,
  formatDateDisplay,
} from '../../utils/helpers';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WeeklyPlan() {
  const {
    weeklyTasks, addWeeklyTask, updateWeeklyTask, deleteWeeklyTask,
    monthlyGoals, monthlyPlanItems,
    weeklyPlanItems, addWeeklyPlanItem, updateWeeklyPlanItem, deleteWeeklyPlanItem,
    weeklyFeedbacks, setWeeklyFeedback,
  } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [week, setWeek] = useState(getCurrentWeek());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    daysOfWeek: [] as number[],
    monthlyGoalId: '',
    monthlyPlanItemId: '',
  });
  const [editForm, setEditForm] = useState({ title: '' });

  // Weekly plan items (goals) state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');

  const tasks = weeklyTasks.filter((t) => t.year === year && t.week === week);
  const weekDays = getWeekDays(year, week);
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  const relevantMonthlyGoals = monthlyGoals.filter((g) => g.year === year);
  const currentMonth = getCurrentMonth();
  const relevantMonthlyPlanItems = monthlyPlanItems.filter(
    (i) => i.year === year && i.month === currentMonth
  );

  const thisWeekGoals = weeklyPlanItems.filter((i) => i.year === year && i.week === week);

  const weekRange =
    weekDays.length > 0
      ? `${formatDateDisplay(weekDays[0])} – ${formatDateDisplay(weekDays[6])}`
      : '';

  const totalWeeks = 52;

  function toggleDay(dayIdx: number) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIdx)
        ? prev.daysOfWeek.filter((d) => d !== dayIdx)
        : [...prev.daysOfWeek, dayIdx],
    }));
  }

  function handleAdd() {
    if (!form.title.trim()) return;
    const days = form.daysOfWeek.length > 0 ? form.daysOfWeek : [0];
    addWeeklyTask({
      id: generateId(),
      title: form.title.trim(),
      domain: form.domain,
      dayOfWeek: days[0],
      daysOfWeek: days,
      completed: false,
      year,
      week,
      monthlyGoalId: form.monthlyGoalId || undefined,
    });
    setForm({ title: '', domain: 'output', daysOfWeek: [], monthlyGoalId: '', monthlyPlanItemId: '' });
    setShowAddForm(false);
  }

  function startEdit(task: typeof tasks[0]) {
    setEditingId(task.id);
    setEditForm({ title: task.title });
  }

  function saveEdit() {
    if (!editingId || !editForm.title.trim()) return;
    updateWeeklyTask(editingId, { title: editForm.title.trim() });
    setEditingId(null);
  }

  function addWeekGoal() {
    if (!newGoalTitle.trim()) return;
    addWeeklyPlanItem({
      id: generateId(),
      year,
      week,
      title: newGoalTitle.trim(),
      completed: false,
    });
    setNewGoalTitle('');
  }

  function saveGoalEdit() {
    if (!editingGoalId || !editGoalTitle.trim()) return;
    updateWeeklyPlanItem(editingGoalId, { title: editGoalTitle.trim() });
    setEditingGoalId(null);
  }

  // Task appears in a day column if daysOfWeek includes it, else fall back to dayOfWeek
  function getTasksForDay(dayIdx: number) {
    return tasks.filter((t) => {
      if (t.daysOfWeek && t.daysOfWeek.length > 0) {
        return t.daysOfWeek.includes(dayIdx);
      }
      return t.dayOfWeek === dayIdx;
    });
  }

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

      {/* Achievement — Goals only */}
      {thisWeekGoals.length > 0 && (() => {
        const completedGoals = thisWeekGoals.filter((i) => i.completed).length;
        const goalsPct = Math.round((completedGoals / thisWeekGoals.length) * 100);
        return (
          <div className="card py-4">
            <div className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-3">Achievement</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Goals</span>
              <span className="text-sm font-bold text-purple-500">{goalsPct}%</span>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill h-2" style={{ width: `${goalsPct}%`, background: '#7c3aed' }} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{completedGoals} of {thisWeekGoals.length} goals completed</div>
          </div>
        );
      })()}

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

            {/* Multi-day selector */}
            <div>
              <p className="text-xs text-slate-500 mb-1.5">요일 선택 (복수 선택 가능)</p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      form.daysOfWeek.includes(i)
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    onClick={() => toggleDay(i)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <select
              className="select w-full"
              value={form.monthlyGoalId}
              onChange={(e) => setForm({ ...form, monthlyGoalId: e.target.value })}
            >
              <option value="">월간 목표 연결 (선택)</option>
              {relevantMonthlyGoals.map((mg) => (
                <option key={mg.id} value={mg.id}>
                  {mg.title}
                </option>
              ))}
            </select>

            {/* Monthly plan items reference */}
            {relevantMonthlyPlanItems.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500 mb-2">이달의 실행 계획 참고</p>
                <div className="space-y-1">
                  {relevantMonthlyPlanItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                        {item.title}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-pink-400 hover:text-pink-600 flex-shrink-0"
                        onClick={() => setForm({ ...form, title: item.title })}
                      >
                        ↑ 복사
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      {/* Weekly Goals (plan items) */}
      <div className="card">
        <h4 className="font-semibold text-slate-800 mb-3">이번 주 목표</h4>
        <div className="space-y-2 mb-3">
          {thisWeekGoals.length === 0 && (
            <p className="text-xs text-slate-400">이번 주 목표를 작성해보세요.</p>
          )}
          {thisWeekGoals.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => updateWeeklyPlanItem(item.id, { completed: !item.completed })}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#c45c8a' }}
              />
              {editingGoalId === item.id ? (
                <input
                  autoFocus
                  className="input flex-1 text-sm py-0.5"
                  value={editGoalTitle}
                  onChange={(e) => setEditGoalTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveGoalEdit();
                    if (e.key === 'Escape') setEditingGoalId(null);
                  }}
                  onBlur={saveGoalEdit}
                />
              ) : (
                <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.title}
                </span>
              )}
              {editingGoalId !== item.id && (
                <button
                  className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500"
                  onClick={() => { setEditingGoalId(item.id); setEditGoalTitle(item.title); }}
                >
                  <Edit2 size={13} />
                </button>
              )}
              <button
                className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
                onClick={() => deleteWeeklyPlanItem(item.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="이번 주 목표 추가..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWeekGoal()}
          />
          <button className="btn-primary flex items-center gap-1" onClick={addWeekGoal}>
            <Plus size={14} /> Add
          </button>
        </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, dayIdx) => {
              const dayTasks = getTasksForDay(dayIdx);
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
                          className="group flex items-start gap-1.5 p-1.5 rounded-lg hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => updateWeeklyTask(task.id, { completed: !task.completed })}
                            className="mt-0.5 w-3 h-3 rounded cursor-pointer flex-shrink-0"
                            style={{ accentColor: cfg.color }}
                          />
                          <div className="flex-1 min-w-0">
                            {editingId === task.id ? (
                              <div className="space-y-1">
                                <input
                                  autoFocus
                                  className="w-full text-xs border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-pink-400"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ title: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  onBlur={saveEdit}
                                />
                              </div>
                            ) : (
                              <>
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
                                {task.daysOfWeek && task.daysOfWeek.length > 1 && (
                                  <span className="inline-block mt-0.5 ml-1 text-xs text-slate-400">
                                    {task.daysOfWeek.map(d => DAYS_OF_WEEK[d].slice(0, 1)).join('·')}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          {editingId !== task.id && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0"
                              onMouseDown={(e) => { e.preventDefault(); startEdit(task); }}
                            >
                              <Edit2 size={9} />
                            </button>
                          )}
                          {editingId !== task.id && (
                            <button
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
                              onClick={() => deleteWeeklyTask(task.id)}
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="mt-2 w-full text-xs text-slate-400 hover:text-pink-500 flex items-center justify-center gap-1 py-1 rounded hover:bg-pink-50"
                    onClick={() => {
                      setForm({ ...form, daysOfWeek: [dayIdx] });
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

      {/* Self Feedback */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">Self Feedback</h3>
        <textarea
          className="textarea h-28"
          placeholder="이번 주는 어땠나요? 잘한 점, 아쉬운 점, 다음 주에 개선할 점은?"
          value={weeklyFeedbacks[`${year}-${week}`] ?? ''}
          onChange={(e) => setWeeklyFeedback(year, week, e.target.value)}
        />
      </div>
    </div>
  );
}
