import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, DailyPlanData, DailyTask } from '../../types';
import { generateId, getTodayString, formatDateDisplay, MOOD_EMOJIS } from '../../utils/helpers';
import { Plus, Trash2, Check, X, ArrowRight } from 'lucide-react';

const emptyPlan = (date: string): DailyPlanData => ({
  date,
  topPriorities: ['', '', ''],
  tasks: [],
  gratitude: '',
  reflection: '',
  mood: 3,
});

export default function DailyPlan() {
  const navigate = useNavigate();
  const { dailyPlans, upsertDailyPlan } = useStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDomain, setNewTaskDomain] = useState<Domain>('health');

  const existing = dailyPlans.find((p) => p.date === selectedDate);
  const [plan, setPlan] = useState<DailyPlanData>(existing ?? emptyPlan(selectedDate));

  useEffect(() => {
    const found = dailyPlans.find((p) => p.date === selectedDate);
    setPlan(found ?? emptyPlan(selectedDate));
  }, [selectedDate, dailyPlans]);

  function save(updated: DailyPlanData) {
    setPlan(updated);
    upsertDailyPlan(updated);
  }

  function updatePriority(idx: number, value: string) {
    const priorities = [...plan.topPriorities];
    priorities[idx] = value;
    save({ ...plan, topPriorities: priorities });
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

  function toggleTask(id: string) {
    save({
      ...plan,
      tasks: plan.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  }

  function deleteTask(id: string) {
    save({ ...plan, tasks: plan.tasks.filter((t) => t.id !== id) });
  }

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">✅ Daily Plan — 일간 계획</h2>
          <p className="section-subtitle">{formatDateDisplay(new Date(selectedDate + 'T12:00:00'))}</p>
        </div>
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

      {/* Mood */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-3">Mood — 오늘의 기분</h3>
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
          <span className="text-sm text-slate-500 ml-2">
            {['Bad', 'Not great', 'Okay', 'Good', 'Great!'][plan.mood - 1]}
          </span>
        </div>
      </div>

      {/* Top 3 Priorities */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-3">
          Top 3 Priorities — 오늘의 3가지 우선순위
        </h3>
        <div className="space-y-2">
          {plan.topPriorities.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: ['#6366f1', '#f59e0b', '#10b981'][i] }}
              >
                {i + 1}
              </div>
              <input
                className="input"
                placeholder={`Priority ${i + 1}...`}
                value={p}
                onChange={(e) => updatePriority(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">
            Tasks — 할 일 ({completedCount}/{plan.tasks.length})
          </h3>
          {plan.tasks.length > 0 && (
            <div className="progress-bar w-24">
              <div
                className="progress-fill"
                style={{
                  width: `${plan.tasks.length > 0 ? (completedCount / plan.tasks.length) * 100 : 0}%`,
                  background: '#6366f1',
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {plan.tasks.map((task) => {
            const cfg = task.domain ? DOMAIN_CONFIG[task.domain] : null;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  task.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={cfg ? { accentColor: cfg.color } : {}}
                />
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.title}
                </span>
                {cfg && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                  >
                    {cfg.emoji} {cfg.labelKo}
                  </span>
                )}
                <button
                  className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 size={14} />
                </button>
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
                {DOMAIN_CONFIG[d].emoji} {DOMAIN_CONFIG[d].labelKo}
              </option>
            ))}
          </select>
          <button className="btn-primary flex items-center gap-1" onClick={addTask}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Gratitude */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">
          Gratitude — 감사한 것들 🙏
        </h3>
        <textarea
          className="textarea h-20"
          placeholder="What am I grateful for today? (오늘 감사한 것들을 적어보세요)"
          value={plan.gratitude}
          onChange={(e) => save({ ...plan, gratitude: e.target.value })}
        />
      </div>

      {/* Evening Reflection */}
      <div className="card">
        <h3 className="font-bold text-slate-800 mb-2">
          Evening Reflection — 저녁 회고 🌙
        </h3>
        <textarea
          className="textarea h-28"
          placeholder="How was today? What did I learn? What would I do differently? (오늘 하루를 돌아보며...)"
          value={plan.reflection}
          onChange={(e) => save({ ...plan, reflection: e.target.value })}
        />
      </div>

      {/* Link to Time Block */}
      <div className="card bg-purple-50 border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-800">Visualize your day</h4>
            <p className="text-sm text-purple-600 mt-0.5">Plan your time blocks for today.</p>
          </div>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
            onClick={() => navigate('/time-block')}
          >
            Time Block <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
