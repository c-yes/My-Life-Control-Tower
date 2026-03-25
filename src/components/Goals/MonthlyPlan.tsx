import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId, getCurrentYear, getCurrentMonth, MONTH_NAMES } from '../../utils/helpers';
import { Plus, Trash2, Check, X, ArrowRight, ExternalLink, Edit2 } from 'lucide-react';

export default function MonthlyPlan() {
  const navigate = useNavigate();
  const {
    monthlyGoals, addMonthlyGoal, updateMonthlyGoal, deleteMonthlyGoal, annualGoals,
    monthlyPlanItems, addMonthlyPlanItem, updateMonthlyPlanItem, deleteMonthlyPlanItem,
  } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [month, setMonth] = useState(getCurrentMonth());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    annualGoalId: '',
  });
  const [editForm, setEditForm] = useState({
    title: '',
    domain: 'output' as Domain,
    annualGoalId: '',
  });

  // Plan items state
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanTitle, setEditPlanTitle] = useState('');

  const goals = monthlyGoals.filter((g) => g.year === year && g.month === month);
  const completedCount = goals.filter((g) => g.completed).length;
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];
  const yearAnnualGoals = annualGoals.filter((g) => g.year === year);
  const achievementPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const planItems = monthlyPlanItems.filter((i) => i.year === year && i.month === month);

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

  function startEdit(goal: typeof goals[0]) {
    setEditingId(goal.id);
    setEditForm({ title: goal.title, domain: goal.domain, annualGoalId: goal.annualGoalId || '' });
  }

  function saveEdit() {
    if (!editingId) return;
    updateMonthlyGoal(editingId, {
      title: editForm.title.trim(),
      domain: editForm.domain,
      annualGoalId: editForm.annualGoalId || undefined,
    });
    setEditingId(null);
  }

  function addPlanItem() {
    if (!newPlanTitle.trim()) return;
    addMonthlyPlanItem({
      id: generateId(),
      year,
      month,
      title: newPlanTitle.trim(),
      completed: false,
    });
    setNewPlanTitle('');
  }

  function savePlanEdit() {
    if (!editingPlanId || !editPlanTitle.trim()) return;
    updateMonthlyPlanItem(editingPlanId, { title: editPlanTitle.trim() });
    setEditingPlanId(null);
  }

  const groupedGoals = domains.reduce((acc, domain) => {
    acc[domain] = goals.filter((g) => g.domain === domain);
    return acc;
  }, {} as Record<Domain, typeof goals>);

  const years = [getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1];

  return (
    <div className="space-y-6 fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddForm(true)}>
          <Plus size={14} /> Add Goal
        </button>
      </div>

      {/* Achievement */}
      {goals.length > 0 && (
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
          <div className="text-xs text-slate-400 mt-1">{completedCount} of {goals.length} goals completed</div>
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
                  {DOMAIN_CONFIG[d].label}
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
                  {ag.title}
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

      {/* Section: Goals */}
      {goals.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Goals</span>
          <div className="flex-1 h-px bg-slate-200" />
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
              <h3 className="font-semibold text-slate-800">{cfg.label}</h3>
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

                if (editingId === goal.id) {
                  return (
                    <div key={goal.id} className="p-3 rounded-lg border border-pink-200 bg-pink-50 space-y-2">
                      <input
                        className="input"
                        value={editForm.title}
                        autoFocus
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <select
                        className="select w-full"
                        value={editForm.domain}
                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value as Domain })}
                      >
                        {domains.map((d) => (
                          <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
                        ))}
                      </select>
                      <select
                        className="select w-full"
                        value={editForm.annualGoalId}
                        onChange={(e) => setEditForm({ ...editForm, annualGoalId: e.target.value })}
                      >
                        <option value="">No linked annual goal</option>
                        {yearAnnualGoals.map((ag) => (
                          <option key={ag.id} value={ag.id}>{ag.title}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingId(null)}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

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
                          <span className="text-xs text-slate-400">{linkedAnnual.title}</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 flex-shrink-0"
                      onClick={() => startEdit(goal)}
                    >
                      <Edit2 size={14} />
                    </button>
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

      {/* Section: Plan */}
      {(goals.length > 0 || planItems.length > 0) && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Plan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Plan Items */}
          <div className="card">
            <h4 className="font-semibold text-slate-800 mb-3">이달의 실행 계획</h4>
            <div className="space-y-2 mb-3">
              {planItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                    item.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => updateMonthlyPlanItem(item.id, { completed: !item.completed })}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: '#c45c8a' }}
                  />
                  {editingPlanId === item.id ? (
                    <input
                      autoFocus
                      className="input flex-1 text-sm py-0.5"
                      value={editPlanTitle}
                      onChange={(e) => setEditPlanTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePlanEdit();
                        if (e.key === 'Escape') setEditingPlanId(null);
                      }}
                      onBlur={savePlanEdit}
                    />
                  ) : (
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                  )}
                  {editingPlanId !== item.id && (
                    <button
                      className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500"
                      onClick={() => { setEditingPlanId(item.id); setEditPlanTitle(item.title); }}
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  <button
                    className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
                    onClick={() => deleteMonthlyPlanItem(item.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="실행 계획 추가..."
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlanItem()}
              />
              <button className="btn-primary flex items-center gap-1" onClick={addPlanItem}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div className="card bg-pink-50 border-pink-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 className="font-semibold text-pink-800">Ready to plan your week?</h4>
                <p className="text-sm text-pink-600 mt-0.5">Break down monthly goals into weekly tasks.</p>
              </div>
              <button
                className="btn-primary flex items-center gap-1"
                onClick={() => navigate('/weekly-plan')}
              >
                Weekly Plan <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
