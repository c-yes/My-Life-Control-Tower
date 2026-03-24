import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId, getCurrentYear, getCurrentMonth, MONTH_NAMES } from '../../utils/helpers';
import { Plus, Trash2, Check, X, ArrowRight, ExternalLink } from 'lucide-react';

export default function MonthlyPlan() {
  const navigate = useNavigate();
  const { monthlyGoals, addMonthlyGoal, updateMonthlyGoal, deleteMonthlyGoal, annualGoals } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    annualGoalId: '',
  });

  const goals = monthlyGoals.filter((g) => g.year === year && g.month === month);
  const completedCount = goals.filter((g) => g.completed).length;
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];
  const yearAnnualGoals = annualGoals.filter((g) => g.year === year);

  function handleAdd() {
    if (!form.title.trim()) return;
    addMonthlyGoal({
      id: generateId(),
      title: form.title.trim(),
      domain: form.domain,
      annualGoalId: form.annualGoalId || undefined,
      completed: false,
      year,
      month,
    });
    setForm({ title: '', domain: 'output', annualGoalId: '' });
    setShowAddForm(false);
  }

  const groupedGoals = domains.reduce((acc, domain) => {
    acc[domain] = goals.filter((g) => g.domain === domain);
    return acc;
  }, {} as Record<Domain, typeof goals>);

  const years = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="section-title">Monthly</h2>
          <p className="section-subtitle">{MONTH_NAMES[month - 1]} {year} — {completedCount}/{goals.length} goals completed</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
            <Plus size={14} /> Add Goal
          </button>
        </div>
      </div>

      {/* Progress */}
      {goals.length > 0 && (
        <div className="card py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Monthly Progress</span>
            <span className="text-sm font-bold text-indigo-600">
              {goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%
            </span>
          </div>
          <div className="progress-bar h-3 bg-slate-100">
            <div
              className="progress-fill h-3"
              style={{
                width: `${goals.length > 0 ? (completedCount / goals.length) * 100 : 0}%`,
                background: '#6366f1',
              }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">{completedCount} of {goals.length} goals achieved</div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">New Monthly Goal</h3>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Goal title..."
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
                  {DOMAIN_CONFIG[d].emoji} {DOMAIN_CONFIG[d].label} ({DOMAIN_CONFIG[d].labelKo})
                </option>
              ))}
            </select>
            <select
              className="select w-full"
              value={form.annualGoalId}
              onChange={(e) => setForm({ ...form, annualGoalId: e.target.value })}
            >
              <option value="">No linked annual goal</option>
              {yearAnnualGoals.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {DOMAIN_CONFIG[ag.domain].emoji} {ag.title}
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

      {goals.length === 0 && !showAddForm && (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No goals for {MONTH_NAMES[month - 1]} {year}.</p>
          <button className="btn-primary mt-3" onClick={() => setShowAddForm(true)}>
            Add First Goal
          </button>
        </div>
      )}

      {/* Goals by Domain */}
      {domains.map((domain) => {
        const domainGoals = groupedGoals[domain];
        if (domainGoals.length === 0) return null;
        const cfg = DOMAIN_CONFIG[domain];
        return (
          <div key={domain} className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{cfg.emoji}</span>
              <h3 className="font-semibold text-slate-800">
                {cfg.label} <span className="text-slate-400 font-normal text-sm">/ {cfg.labelKo}</span>
              </h3>
              <span
                className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ background: cfg.color }}
              >
                {domainGoals.filter((g) => g.completed).length}/{domainGoals.length}
              </span>
            </div>

            <div className="space-y-2">
              {domainGoals.map((goal) => {
                const linkedAnnual = goal.annualGoalId
                  ? annualGoals.find((ag) => ag.id === goal.annualGoalId)
                  : null;
                return (
                  <div
                    key={goal.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      goal.completed
                        ? 'bg-slate-50 border-slate-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => updateMonthlyGoal(goal.id, { completed: !goal.completed })}
                      className="mt-0.5 w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: cfg.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium ${
                          goal.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {goal.title}
                      </span>
                      {linkedAnnual && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExternalLink size={11} className="text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {linkedAnnual.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 flex-shrink-0"
                      onClick={() => deleteMonthlyGoal(goal.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Link to Weekly */}
      {goals.length > 0 && (
        <div className="card bg-indigo-50 border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-800">Ready to plan your week?</h4>
              <p className="text-sm text-indigo-600 mt-0.5">Break down monthly goals into weekly tasks.</p>
            </div>
            <button
              className="btn-primary flex items-center gap-1"
              onClick={() => navigate('/weekly-plan')}
            >
              Weekly Plan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
