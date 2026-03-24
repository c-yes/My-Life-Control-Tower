import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import { generateId, getCurrentYear } from '../../utils/helpers';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, ArrowRight, Target } from 'lucide-react';

export default function AnnualGoals() {
  const navigate = useNavigate();
  const { annualGoals, addAnnualGoal, updateAnnualGoal, deleteAnnualGoal } = useStore();
  const [year, setYear] = useState(getCurrentYear());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    domain: 'output' as Domain,
    description: '',
    progress: 0,
  });

  const [editForm, setEditForm] = useState({
    title: '',
    domain: 'output' as Domain,
    description: '',
    progress: 0,
  });

  const goals = annualGoals.filter((g) => g.year === year);
  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;

  function handleAdd() {
    if (!form.title.trim()) return;
    addAnnualGoal({
      id: generateId(),
      title: form.title.trim(),
      domain: form.domain,
      description: form.description.trim(),
      progress: form.progress,
      year,
      milestones: [],
    });
    setForm({ title: '', domain: 'output', description: '', progress: 0 });
    setShowAddForm(false);
  }

  function startEdit(id: string) {
    const g = annualGoals.find((x) => x.id === id);
    if (!g) return;
    setEditingId(id);
    setEditForm({ title: g.title, domain: g.domain, description: g.description, progress: g.progress });
  }

  function saveEdit() {
    if (!editingId) return;
    updateAnnualGoal(editingId, editForm);
    setEditingId(null);
  }

  function handleAddMilestone(goalId: string, title: string) {
    if (!title.trim()) return;
    const goal = annualGoals.find((g) => g.id === goalId);
    if (!goal) return;
    updateAnnualGoal(goalId, {
      milestones: [
        ...goal.milestones,
        { id: generateId(), title: title.trim(), completed: false },
      ],
    });
  }

  function toggleMilestone(goalId: string, milestoneId: string) {
    const goal = annualGoals.find((g) => g.id === goalId);
    if (!goal) return;
    updateAnnualGoal(goalId, {
      milestones: goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    });
  }

  function deleteMilestone(goalId: string, milestoneId: string) {
    const goal = annualGoals.find((g) => g.id === goalId);
    if (!goal) return;
    updateAnnualGoal(goalId, {
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    });
  }

  const groupedGoals = domains.reduce((acc, domain) => {
    acc[domain] = goals.filter((g) => g.domain === domain);
    return acc;
  }, {} as Record<Domain, typeof goals>);

  return (
    <div className="space-y-6 fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            className="select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
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
            <span className="text-sm font-bold text-pink-500">{avgProgress}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill h-3"
              style={{ width: `${avgProgress}%`, background: '#c45c8a' }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">{goals.length} goals · avg progress</div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">New Annual Goal</h3>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Goal title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <textarea
              className="textarea h-20"
              placeholder="Description (optional)..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Progress: {form.progress}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                className="w-full"
              />
            </div>
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
          <p className="text-slate-400 text-sm">No goals for {year}. Click "Add Goal" to start!</p>
        </div>
      )}

      {/* Section: Plan */}
      {goals.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Plan</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="card bg-pink-50 border-pink-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 className="font-semibold text-pink-800">Ready to plan your month?</h4>
                <p className="text-sm text-pink-600 mt-0.5">Break down annual goals into monthly plans.</p>
              </div>
              <button
                className="btn-primary flex items-center gap-1"
                onClick={() => navigate('/monthly-plan')}
              >
                Monthly Plan <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
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
              <h3 className="font-bold text-slate-900">{cfg.label}</h3>
              <span
                className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ background: cfg.color }}
              >
                {domainGoals.length} goals
              </span>
            </div>

            <div className="space-y-4">
              {domainGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="border border-slate-100 rounded-xl p-4"
                  style={{ borderLeftWidth: 4, borderLeftColor: cfg.color }}
                >
                  {editingId === goal.id ? (
                    <div className="space-y-3">
                      <input
                        className="input"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                      <select
                        className="select w-full"
                        value={editForm.domain}
                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value as Domain })}
                      >
                        {domains.map((d) => (
                          <option key={d} value={d}>
                            {DOMAIN_CONFIG[d].label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        className="textarea h-16"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Progress: {editForm.progress}%</label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={editForm.progress}
                          onChange={(e) => setEditForm({ ...editForm, progress: Number(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingId(null)}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
                            onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                            title="Milestones"
                          >
                            {expandedId === goal.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-400"
                            onClick={() => startEdit(goal.id)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                            onClick={() => deleteAnnualGoal(goal.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Progress</span>
                          <span className="text-xs font-medium" style={{ color: cfg.color }}>
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${goal.progress}%`, background: cfg.color }}
                          />
                        </div>
                      </div>

                      {/* Milestones */}
                      {expandedId === goal.id && (
                        <MilestoneSection
                          goal={goal}
                          onAdd={(t) => handleAddMilestone(goal.id, t)}
                          onToggle={(mid) => toggleMilestone(goal.id, mid)}
                          onDelete={(mid) => deleteMilestone(goal.id, mid)}
                        />
                      )}

                      {/* Link to Monthly */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <button
                          className="text-xs flex items-center gap-1 text-pink-500 hover:text-pink-600"
                          onClick={() => navigate('/monthly-plan')}
                        >
                          <ArrowRight size={12} />
                          Create monthly goal from this
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MilestoneSection({
  goal,
  onAdd,
  onToggle,
  onDelete,
}: {
  goal: { milestones: { id: string; title: string; completed: boolean }[] };
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [newMilestone, setNewMilestone] = useState('');

  function submit() {
    if (!newMilestone.trim()) return;
    onAdd(newMilestone);
    setNewMilestone('');
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
        Milestones ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})
      </h5>
      <div className="space-y-1.5 mb-2">
        {goal.milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={m.completed}
              onChange={() => onToggle(m.id)}
              className="w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span className={`text-sm flex-1 ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {m.title}
            </span>
            <button
              className="p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-400"
              onClick={() => onDelete(m.id)}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input text-xs flex-1"
          placeholder="Add milestone..."
          value={newMilestone}
          onChange={(e) => setNewMilestone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn-secondary text-xs px-3" onClick={submit}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
