import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG, Habit } from '../../types';
import {
  generateId,
  getTodayString,
  calculateStreak,
  getCompletionRate,
  formatDateDisplay,
} from '../../utils/helpers';
import { Plus, Trash2, Check, X, Flame } from 'lucide-react';
import { addDays, format } from 'date-fns';

const HABIT_ICONS = ['🏃', '📚', '🧘', '💪', '🥗', '💧', '😴', '✍️', '🎯', '🌿', '🎵', '🧹'];

export default function Miracle21() {
  const { habits, addHabit, deleteHabit, toggleHabitCompletion } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    domain: 'health' as Domain,
    icon: '🏃',
    color: '#10b981',
  });

  const today = getTodayString();
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  function handleAdd() {
    if (!form.name.trim()) return;
    const newHabit: Habit = {
      id: generateId(),
      name: form.name.trim(),
      domain: form.domain,
      startDate: today,
      completions: [],
      color: form.color,
      icon: form.icon,
    };
    addHabit(newHabit);
    setForm({ name: '', domain: 'health', icon: '🏃', color: '#10b981' });
    setShowAddForm(false);
  }

  function get21Days(startDate: string): string[] {
    const start = new Date(startDate);
    return Array.from({ length: 21 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">⭐ Miracle 21 — 21일 습관 형성</h2>
          <p className="section-subtitle">Build habits in 21 days. Track your streak and completion rate.</p>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
          <Plus size={14} /> New Habit
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">New 21-Day Habit</h3>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Habit name..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <select
              className="select w-full"
              value={form.domain}
              onChange={(e) => {
                const d = e.target.value as Domain;
                setForm({ ...form, domain: d, color: DOMAIN_CONFIG[d].color });
              }}
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_CONFIG[d].emoji} {DOMAIN_CONFIG[d].label} ({DOMAIN_CONFIG[d].labelKo})
                </option>
              ))}
            </select>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center border-2 transition-all ${
                      form.icon === icon
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setForm({ ...form, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="btn-primary flex items-center gap-1" onClick={handleAdd}>
                <Check size={14} /> Start Habit
              </button>
              <button className="btn-secondary flex items-center gap-1" onClick={() => setShowAddForm(false)}>
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {habits.length === 0 && !showAddForm && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-slate-600 font-medium">No habits yet</p>
          <p className="text-slate-400 text-sm mt-1">Start a 21-day challenge to build lasting habits</p>
          <button className="btn-primary mt-4" onClick={() => setShowAddForm(true)}>
            Start Your First Habit
          </button>
        </div>
      )}

      {/* Habit Cards */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const streak = calculateStreak(habit.completions, habit.startDate);
          const completionRate = getCompletionRate(habit.completions, habit.startDate);
          const days21 = get21Days(habit.startDate);
          const cfg = DOMAIN_CONFIG[habit.domain];
          const todayDone = habit.completions.includes(today);

          return (
            <div
              key={habit.id}
              className="card"
              style={{ borderLeftWidth: 4, borderLeftColor: habit.color }}
            >
              {/* Habit Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${habit.color}20` }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{habit.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ background: cfg.color }}
                      >
                        {cfg.emoji} {cfg.labelKo}
                      </span>
                      <span className="text-xs text-slate-400">
                        Started {formatDateDisplay(new Date(habit.startDate + 'T12:00:00'))}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      todayDone
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    onClick={() => toggleHabitCompletion(habit.id, today)}
                  >
                    {todayDone ? <><Check size={14} /> Done!</> : <>Mark Today</>}
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-orange-50 text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                    <Flame size={16} />
                    <span className="font-bold text-xl">{streak}</span>
                  </div>
                  <div className="text-xs text-slate-500">Day Streak</div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 text-center">
                  <div className="font-bold text-xl text-indigo-600 mb-1">{completionRate}%</div>
                  <div className="text-xs text-slate-500">Completion Rate</div>
                </div>
                <div className="p-3 rounded-xl bg-green-50 text-center">
                  <div className="font-bold text-xl text-green-600 mb-1">
                    {habit.completions.length}
                  </div>
                  <div className="text-xs text-slate-500">Total Done</div>
                </div>
              </div>

              {/* 21-Day Grid */}
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  21-Day Challenge
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {days21.map((date, idx) => {
                    const done = habit.completions.includes(date);
                    const isPast = date <= today;
                    const isToday = date === today;
                    const isFuture = date > today;
                    return (
                      <button
                        key={date}
                        title={date}
                        className={`habit-day ${done ? 'completed' : ''} ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
                        style={
                          done
                            ? { background: habit.color, color: 'white', borderColor: habit.color }
                            : isFuture
                            ? { opacity: 0.4, cursor: 'default' }
                            : {}
                        }
                        onClick={() => !isFuture && toggleHabitCompletion(habit.id, date)}
                        disabled={isFuture}
                      >
                        {done ? '✓' : idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress to 21 */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Progress to 21 days</span>
                  <span className="text-xs font-medium" style={{ color: habit.color }}>
                    {habit.completions.length}/21
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((habit.completions.length / 21) * 100, 100)}%`,
                      background: habit.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
