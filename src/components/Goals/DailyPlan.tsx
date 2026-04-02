import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, DailyPlanData, DailyTask } from '../../types';
import { generateId, getTodayString, formatDateDisplay, MOOD_EMOJIS, getCurrentYear, getCurrentWeek } from '../../utils/helpers';
import { Plus, Trash2, Check, X, ArrowRight, Star, Edit2, ChevronUp, ChevronDown } from 'lucide-react';

const emptyPlan = (date: string): DailyPlanData => ({
  date,
  topPriorities: ['', '', ''],
  topPriorityDone: [false, false, false],
  tasks: [],
  gratitude: '',
  affirmation: '',
  reflection: '',
  mood: 3,
});

export default function DailyPlan() {
  const navigate = useNavigate();
  const { dailyPlans, upsertDailyPlan, weeklyPlanItems } = useStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDomain, setNewTaskDomain] = useState<Domain>('output');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  const existing = dailyPlans.find((p) => p.date === selectedDate);
  const [plan, setPlan] = useState<DailyPlanData>(existing ?? emptyPlan(selectedDate));

  useEffect(() => {
    const found = dailyPlans.find((p) => p.date === selectedDate);
    setPlan(found ?? emptyPlan(selectedDate));
  }, [selectedDate, dailyPlans]);

  // Get current week's plan items for reference
  const year = getCurrentYear();
  const week = getCurrentWeek();
  const thisWeekPlanItems = weeklyPlanItems.filter((i) => i.year === year && i.week === week);

  function save(updated: DailyPlanData) {
    setPlan(updated);
    upsertDailyPlan(updated);
  }

  function updatePriority(idx: number, value: string) {
    const priorities = [...plan.topPriorities];
    priorities[idx] = value;
    save({ ...plan, topPriorities: priorities });
  }

  function togglePriorityDone(idx: number) {
    const done = [...(plan.topPriorityDone ?? [false, false, false])];
    done[idx] = !done[idx];
    save({ ...plan, topPriorityDone: done });
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    const newTask: DailyTask = {
      id: generateId(),
      title: newTaskTitle.trim(),
      completed: false,
      domain: newTaskDomain,
    };
    save({ ...plan, tasks: [...plan.tasks, newTask] });
    setNewTaskTitle('');
  }

  function addTaskFromPlanItem(title: string) {
    const newTask: DailyTask = {
      id: generateId(),
      title,
      completed: false,
      domain: 'output',
    };
    save({ ...plan, tasks: [...plan.tasks, newTask] });
  }

  function toggleTask(id: string) {
    save({
      ...plan,
      tasks: plan.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  }

  function deleteTask(id: string) {
    save({ ...plan, tasks: plan.tasks.filter((t) => t.id !== id) });
  }

  function moveTask(id: string, direction: 'up' | 'down') {
    const idx = plan.tasks.findIndex((t) => t.id === id);
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= plan.tasks.length) return;
    const tasks = [...plan.tasks];
    [tasks[idx], tasks[newIdx]] = [tasks[newIdx], tasks[idx]];
    save({ ...plan, tasks });
  }

  function startEditTask(task: DailyTask) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  }

  function saveEditTask() {
    if (!editingTaskId || !editTaskTitle.trim()) return;
    save({
      ...plan,
      tasks: plan.tasks.map((t) =>
        t.id === editingTaskId ? { ...t, title: editTaskTitle.trim() } : t
      ),
    });
    setEditingTaskId(null);
  }

  function pinToTop3(title: string) {
    const priorities = [...plan.topPriorities];
    const existingIdx = priorities.indexOf(title);
    if (existingIdx !== -1) {
      priorities[existingIdx] = '';
      save({ ...plan, topPriorities: priorities });
      return;
    }
    const emptyIdx = priorities.findIndex((p) => !p.trim());
    if (emptyIdx !== -1) {
      priorities[emptyIdx] = title;
    } else {
      priorities[2] = title;
    }
    save({ ...plan, topPriorities: priorities });
  }

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const achievementPct = plan.tasks.length > 0 ? Math.round((completedCount / plan.tasks.length) * 100) : 0;
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{formatDateDisplay(new Date(selectedDate + 'T12:00:00'))}</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="btn-secondary text-xs"
            onClick={() => setSelectedDate(getTodayString())}
          >
            Today
          </button>
        </div>
      </div>

      {/* Achievement */}
      {plan.tasks.length > 0 && (
        <div className="card py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Achievement</span>
            <span className="text-sm font-bold text-pink-500">{achievementPct}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill h-3"
              style={{ width: `${achievementPct}%`, background: '#c45c8a' }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">{completedCount} of {plan.tasks.length} tasks completed</div>
        </div>
      )}

      {/* Daily Affirmation */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">오늘의 다짐 / 명언</h3>
        <input
          className="input w-full"
          placeholder="오늘의 다짐이나 명언을 적어보세요..."
          value={plan.affirmation ?? ''}
          onChange={(e) => save({ ...plan, affirmation: e.target.value })}
        />
      </div>

      {/* Mood + Memo */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-3">Mood</h3>
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {MOOD_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    plan.mood === i + 1 ? 'scale-125 drop-shadow-md' : 'opacity-60'
                  }`}
                  onClick={() => save({ ...plan, mood: i + 1 })}
                  title={`Mood ${i + 1}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {['Bad', 'Not great', 'Okay', 'Good', 'Great!'][plan.mood - 1]}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              className="textarea h-20 text-sm"
              placeholder="메모..."
              value={plan.moodMemo ?? ''}
              onChange={(e) => save({ ...plan, moodMemo: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Section: Goals */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Goals</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Top 3 Priorities */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-3">Top 3 Priorities</h3>
        <p className="text-xs text-slate-400 mb-3">Click the star on a task to auto-fill here.</p>
        <div className="space-y-2">
          {plan.topPriorities.map((p, i) => {
            const done = (plan.topPriorityDone ?? [false, false, false])[i] ?? false;
            return (
              <div key={i} className="flex items-center gap-3">
                <button
                  onClick={() => togglePriorityDone(i)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 transition-all ${done ? 'opacity-60' : ''}`}
                  style={{ background: ['#c45c8a', '#f59e0b', '#10b981'][i] }}
                  title={done ? '완료 취소' : '완료'}
                >
                  {done ? <Check size={14} /> : i + 1}
                </button>
                <input
                  className={`input ${done ? 'line-through text-slate-400' : ''}`}
                  placeholder={`Priority ${i + 1}...`}
                  value={p}
                  onChange={(e) => updatePriority(i, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Plan */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Plan</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* This week's plan items as reference */}
      {thisWeekPlanItems.length > 0 && (
        <div className="card bg-slate-50 border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">이번 주 목표 참고</h4>
          <div className="space-y-1">
            {thisWeekPlanItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 py-1">
                <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                <button
                  className="text-xs text-pink-400 hover:text-pink-600 flex items-center gap-1 flex-shrink-0"
                  onClick={() => addTaskFromPlanItem(item.title)}
                  title="Task로 추가"
                >
                  <Plus size={11} /> 추가
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">
            Tasks ({completedCount}/{plan.tasks.length})
          </h3>
          {plan.tasks.length > 0 && (
            <div className="progress-bar w-24">
              <div
                className="progress-fill"
                style={{
                  width: `${achievementPct}%`,
                  background: '#c45c8a',
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {plan.tasks.map((task, idx) => {
            const cfg = task.domain ? DOMAIN_CONFIG[task.domain] : null;
            const isPinned = plan.topPriorities.includes(task.title);
            return (
              <div
                key={task.id}
                className={`group p-3 rounded-lg border ${
                  task.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                }`}
              >
                {/* Row 1: reorder + checkbox + title */}
                <div className="flex items-start gap-2">
                  <div className="hidden md:flex flex-col flex-shrink-0 mt-0.5">
                    <button
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 disabled:opacity-20"
                      disabled={idx === 0}
                      onClick={() => moveTask(task.id, 'up')}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 disabled:opacity-20"
                      disabled={idx === plan.tasks.length - 1}
                      onClick={() => moveTask(task.id, 'down')}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                    style={cfg ? { accentColor: cfg.color } : {}}
                  />
                  {editingTaskId === task.id ? (
                    <input
                      autoFocus
                      className="input flex-1 text-sm py-0.5"
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditTask();
                        if (e.key === 'Escape') setEditingTaskId(null);
                      }}
                      onBlur={saveEditTask}
                    />
                  ) : (
                    <span className={`flex-1 text-sm leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.title}
                    </span>
                  )}
                </div>
                {/* Row 2: domain badge + actions (below title) */}
                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 mt-1.5 pl-6 md:pl-10">
                    {cfg && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${cfg.color}20`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    )}
                    <div className="flex-1" />
                    <button
                      className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500"
                      onClick={() => startEditTask(task)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className={`p-1 rounded transition-colors ${
                        isPinned ? 'text-pink-500 hover:text-pink-600' : 'text-slate-300 hover:text-pink-400'
                      }`}
                      onClick={() => pinToTop3(task.title)}
                      title={isPinned ? 'Remove from Top 3' : 'Add to Top 3'}
                    >
                      <Star size={13} fill={isPinned ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            className="select"
            value={newTaskDomain}
            onChange={(e) => setNewTaskDomain(e.target.value as Domain)}
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_CONFIG[d].label}
              </option>
            ))}
          </select>
          <button className="btn-primary flex items-center gap-1" onClick={addTask}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Self Feedback */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">Self Feedback</h3>
        <textarea
          className="textarea h-28"
          placeholder="How was today? What did I learn? What would I do differently?"
          value={plan.reflection}
          onChange={(e) => save({ ...plan, reflection: e.target.value })}
        />
      </div>

    </div>
  );
}
