import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { LifeRole } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function LifeCompass() {
  const { lifeCompass, updateLifeCompass } = useStore();

  // Core Values state
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [newValueName, setNewValueName] = useState('');
  const [newValueDesc, setNewValueDesc] = useState('');
  const [showAddValue, setShowAddValue] = useState(false);
  const [editValueName, setEditValueName] = useState('');
  const [editValueDesc, setEditValueDesc] = useState('');

  // Principles state
  const [newPrinciple, setNewPrinciple] = useState('');
  const [editingPrincipleIdx, setEditingPrincipleIdx] = useState<number | null>(null);
  const [editingPrincipleText, setEditingPrincipleText] = useState('');

  // Roles state
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  const roles: LifeRole[] = lifeCompass.roles ?? [];

  // ── Core Values ────────────────────────────────────────────────────────────

  function handleAddValue() {
    if (!newValueName.trim()) return;
    updateLifeCompass({
      coreValues: [
        ...lifeCompass.coreValues,
        { id: generateId(), name: newValueName.trim(), description: newValueDesc.trim() },
      ],
    });
    setNewValueName(''); setNewValueDesc(''); setShowAddValue(false);
  }

  function handleDeleteValue(id: string) {
    updateLifeCompass({ coreValues: lifeCompass.coreValues.filter((v) => v.id !== id) });
  }

  function startEditValue(id: string) {
    const v = lifeCompass.coreValues.find((x) => x.id === id);
    if (!v) return;
    setEditingValueId(id); setEditValueName(v.name); setEditValueDesc(v.description);
  }

  function saveEditValue() {
    if (!editingValueId) return;
    updateLifeCompass({
      coreValues: lifeCompass.coreValues.map((v) =>
        v.id === editingValueId
          ? { ...v, name: editValueName.trim(), description: editValueDesc.trim() }
          : v
      ),
    });
    setEditingValueId(null);
  }

  // ── Principles ─────────────────────────────────────────────────────────────

  function handleAddPrinciple() {
    if (!newPrinciple.trim()) return;
    updateLifeCompass({ principles: [...lifeCompass.principles, newPrinciple.trim()] });
    setNewPrinciple('');
  }

  function handleDeletePrinciple(idx: number) {
    updateLifeCompass({ principles: lifeCompass.principles.filter((_, i) => i !== idx) });
  }

  function startEditPrinciple(idx: number) {
    setEditingPrincipleIdx(idx); setEditingPrincipleText(lifeCompass.principles[idx]);
  }

  function saveEditPrinciple() {
    if (editingPrincipleIdx === null) return;
    updateLifeCompass({
      principles: lifeCompass.principles.map((p, i) =>
        i === editingPrincipleIdx ? editingPrincipleText.trim() : p
      ),
    });
    setEditingPrincipleIdx(null);
  }

  // ── Roles ──────────────────────────────────────────────────────────────────

  function handleAddRole() {
    if (!newRoleName.trim()) return;
    updateLifeCompass({
      roles: [...roles, { id: generateId(), name: newRoleName.trim(), description: newRoleDesc.trim() }],
    });
    setNewRoleName(''); setNewRoleDesc(''); setShowAddRole(false);
  }

  function handleDeleteRole(id: string) {
    updateLifeCompass({ roles: roles.filter((r) => r.id !== id) });
  }

  function startEditRole(id: string) {
    const r = roles.find((x) => x.id === id);
    if (!r) return;
    setEditingRoleId(id); setEditRoleName(r.name); setEditRoleDesc(r.description);
  }

  function saveEditRole() {
    if (!editingRoleId) return;
    updateLifeCompass({
      roles: roles.map((r) =>
        r.id === editingRoleId
          ? { ...r, name: editRoleName.trim(), description: editRoleDesc.trim() }
          : r
      ),
    });
    setEditingRoleId(null);
  }

  function moveRole(idx: number, dir: -1 | 1) {
    const next = [...roles];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    updateLifeCompass({ roles: next });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 fade-in">
      {/* Mission */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Mission Statement</h3>
        <p className="text-xs text-slate-500 mb-2">Why do you exist? What is your purpose?</p>
        <textarea
          className="textarea h-28"
          placeholder="My mission is to..."
          value={lifeCompass.mission}
          onChange={(e) => updateLifeCompass({ mission: e.target.value })}
        />
      </div>

      {/* Vision */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Vision Statement</h3>
        <p className="text-xs text-slate-500 mb-2">What does your ideal future look like?</p>
        <textarea
          className="textarea h-28"
          placeholder="I envision a future where..."
          value={lifeCompass.vision}
          onChange={(e) => updateLifeCompass({ vision: e.target.value })}
        />
      </div>

      {/* Core Values */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Core Values</h3>
          <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddValue(true)}>
            <Plus size={14} />
          </button>
        </div>

        {showAddValue && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <input className="input" placeholder="Value name (e.g., Integrity)" value={newValueName}
                onChange={(e) => setNewValueName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddValue()} />
              <textarea className="textarea h-16" placeholder="Description..." value={newValueDesc}
                onChange={(e) => setNewValueDesc(e.target.value)} />
              <div className="flex gap-2">
                <button className="btn-primary flex items-center gap-1" onClick={handleAddValue}><Check size={14} /> Save</button>
                <button className="btn-secondary flex items-center gap-1"
                  onClick={() => { setShowAddValue(false); setNewValueName(''); setNewValueDesc(''); }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {lifeCompass.coreValues.length === 0 && !showAddValue && (
          <p className="text-sm text-slate-400 text-center py-6">No core values yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lifeCompass.coreValues.map((value, idx) => (
            <div key={value.id} className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-pink-50 to-white">
              {editingValueId === value.id ? (
                <div className="space-y-2">
                  <input className="input" value={editValueName} onChange={(e) => setEditValueName(e.target.value)} />
                  <textarea className="textarea h-16" value={editValueDesc} onChange={(e) => setEditValueDesc(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEditValue}><Check size={12} /> Save</button>
                    <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingValueId(null)}><X size={12} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                      <h4 className="font-bold text-slate-800">{value.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" onClick={() => startEditValue(value.id)}><Edit2 size={14} /></button>
                      <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => handleDeleteValue(value.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {value.description && <p className="text-sm text-slate-600 mt-2 ml-8">{value.description}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Life Principles */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Life Principles</h3>
        <p className="text-xs text-slate-500 mb-3">Rules you live by. Guiding principles for decision-making.</p>

        <div className="space-y-2 mb-4">
          {lifeCompass.principles.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              {editingPrincipleIdx === idx ? (
                <>
                  <input className="input flex-1" value={editingPrincipleText}
                    onChange={(e) => setEditingPrincipleText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditPrinciple()} autoFocus />
                  <button className="p-1 rounded hover:bg-green-50 text-green-600" onClick={saveEditPrinciple}><Check size={16} /></button>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500" onClick={() => setEditingPrincipleIdx(null)}><X size={16} /></button>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{idx + 1}</span>
                  <span className="flex-1 text-sm text-slate-700">{p}</span>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-400" onClick={() => startEditPrinciple(idx)}><Edit2 size={13} /></button>
                  <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => handleDeletePrinciple(idx)}><Trash2 size={13} /></button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Add a new principle..." value={newPrinciple}
            onChange={(e) => setNewPrinciple(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddPrinciple()} />
          <button className="btn-primary flex items-center gap-1" onClick={handleAddPrinciple}><Plus size={14} /></button>
        </div>
      </div>

      {/* Roles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Roles</h3>
            <p className="text-xs text-slate-500 mt-0.5">The key roles you play in life (e.g., Parent, Leader, Creator).</p>
          </div>
          <button className="btn-primary flex items-center gap-1" onClick={() => setShowAddRole(true)}>
            <Plus size={14} />
          </button>
        </div>

        {showAddRole && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <input className="input" placeholder="Role name (e.g., Creator, Parent)" value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddRole()} autoFocus />
              <textarea className="textarea h-16" placeholder="What does this role mean to you?" value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)} />
              <div className="flex gap-2">
                <button className="btn-primary flex items-center gap-1" onClick={handleAddRole}><Check size={14} /> Save</button>
                <button className="btn-secondary flex items-center gap-1"
                  onClick={() => { setShowAddRole(false); setNewRoleName(''); setNewRoleDesc(''); }}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {roles.length === 0 && !showAddRole && (
          <p className="text-sm text-slate-400 text-center py-6">No roles yet. Add the key roles you play in life.</p>
        )}

        <div className="space-y-2">
          {roles.map((role, idx) => (
            <div key={role.id} className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
                <button
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                  disabled={idx === 0}
                  onClick={() => moveRole(idx, -1)}
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                  disabled={idx === roles.length - 1}
                  onClick={() => moveRole(idx, 1)}
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Number badge */}
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>

              {editingRoleId === role.id ? (
                <div className="flex-1 space-y-2">
                  <input className="input" value={editRoleName} onChange={(e) => setEditRoleName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditRole()} autoFocus />
                  <textarea className="textarea h-16" value={editRoleDesc} onChange={(e) => setEditRoleDesc(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEditRole}><Check size={12} /> Save</button>
                    <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingRoleId(null)}><X size={12} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-800">{role.name}</h4>
                    <div className="flex gap-1 flex-shrink-0">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" onClick={() => startEditRole(role.id)}><Edit2 size={13} /></button>
                      <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" onClick={() => handleDeleteRole(role.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {role.description && <p className="text-sm text-slate-600 mt-1">{role.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
