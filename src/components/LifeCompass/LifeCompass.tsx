import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/helpers';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function LifeCompass() {
  const { lifeCompass, updateLifeCompass } = useStore();
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [newValueName, setNewValueName] = useState('');
  const [newValueDesc, setNewValueDesc] = useState('');
  const [showAddValue, setShowAddValue] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState('');
  const [editingPrincipleIdx, setEditingPrincipleIdx] = useState<number | null>(null);
  const [editingPrincipleText, setEditingPrincipleText] = useState('');
  const [editValueName, setEditValueName] = useState('');
  const [editValueDesc, setEditValueDesc] = useState('');

  function handleAddValue() {
    if (!newValueName.trim()) return;
    const updated = [
      ...lifeCompass.coreValues,
      { id: generateId(), name: newValueName.trim(), description: newValueDesc.trim() },
    ];
    updateLifeCompass({ coreValues: updated });
    setNewValueName('');
    setNewValueDesc('');
    setShowAddValue(false);
  }

  function handleDeleteValue(id: string) {
    updateLifeCompass({ coreValues: lifeCompass.coreValues.filter((v) => v.id !== id) });
  }

  function startEditValue(id: string) {
    const v = lifeCompass.coreValues.find((x) => x.id === id);
    if (!v) return;
    setEditingValueId(id);
    setEditValueName(v.name);
    setEditValueDesc(v.description);
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

  function handleAddPrinciple() {
    if (!newPrinciple.trim()) return;
    updateLifeCompass({ principles: [...lifeCompass.principles, newPrinciple.trim()] });
    setNewPrinciple('');
  }

  function handleDeletePrinciple(idx: number) {
    const updated = lifeCompass.principles.filter((_, i) => i !== idx);
    updateLifeCompass({ principles: updated });
  }

  function startEditPrinciple(idx: number) {
    setEditingPrincipleIdx(idx);
    setEditingPrincipleText(lifeCompass.principles[idx]);
  }

  function saveEditPrinciple() {
    if (editingPrincipleIdx === null) return;
    const updated = lifeCompass.principles.map((p, i) =>
      i === editingPrincipleIdx ? editingPrincipleText.trim() : p
    );
    updateLifeCompass({ principles: updated });
    setEditingPrincipleIdx(null);
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Mission */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Mission Statement</h3>
        <p className="text-xs text-slate-500 mb-2">
          Why do you exist? What is your purpose?
        </p>
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
        <p className="text-xs text-slate-500 mb-2">
          What does your ideal future look like?
        </p>
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
          <button
            className="btn-primary flex items-center gap-1"
            onClick={() => setShowAddValue(true)}
          >
            <Plus size={14} />
          </button>
        </div>

        {showAddValue && (
          <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <input
                className="input"
                placeholder="Value name (e.g., Integrity)"
                value={newValueName}
                onChange={(e) => setNewValueName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
              />
              <textarea
                className="textarea h-16"
                placeholder="Description..."
                value={newValueDesc}
                onChange={(e) => setNewValueDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="btn-primary flex items-center gap-1" onClick={handleAddValue}>
                  <Check size={14} /> Save
                </button>
                <button
                  className="btn-secondary flex items-center gap-1"
                  onClick={() => { setShowAddValue(false); setNewValueName(''); setNewValueDesc(''); }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {lifeCompass.coreValues.length === 0 && !showAddValue && (
          <p className="text-sm text-slate-400 text-center py-6">
            No core values yet. Click "Add Value" to get started.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lifeCompass.coreValues.map((value, idx) => (
            <div
              key={value.id}
              className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-pink-50 to-white"
            >
              {editingValueId === value.id ? (
                <div className="space-y-2">
                  <input
                    className="input"
                    value={editValueName}
                    onChange={(e) => setEditValueName(e.target.value)}
                  />
                  <textarea
                    className="textarea h-16"
                    value={editValueDesc}
                    onChange={(e) => setEditValueDesc(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="btn-primary flex items-center gap-1 text-xs" onClick={saveEditValue}>
                      <Check size={12} /> Save
                    </button>
                    <button className="btn-secondary flex items-center gap-1 text-xs" onClick={() => setEditingValueId(null)}>
                      <X size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-800">{value.name}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        onClick={() => startEditValue(value.id)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteValue(value.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {value.description && (
                    <p className="text-sm text-slate-600 mt-2 ml-8">{value.description}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Life Principles */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Life Principles</h3>
        <p className="text-xs text-slate-500 mb-3">
          Rules you live by. Guiding principles for decision-making.
        </p>

        <div className="space-y-2 mb-4">
          {lifeCompass.principles.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              {editingPrincipleIdx === idx ? (
                <>
                  <input
                    className="input flex-1"
                    value={editingPrincipleText}
                    onChange={(e) => setEditingPrincipleText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditPrinciple()}
                    autoFocus
                  />
                  <button className="p-1 rounded hover:bg-green-50 text-green-600" onClick={saveEditPrinciple}>
                    <Check size={16} />
                  </button>
                  <button className="p-1 rounded hover:bg-slate-100 text-slate-500" onClick={() => setEditingPrincipleIdx(null)}>
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700">{p}</span>
                  <button
                    className="p-1 rounded hover:bg-slate-100 text-slate-400"
                    onClick={() => startEditPrinciple(idx)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"
                    onClick={() => handleDeletePrinciple(idx)}
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a new principle..."
            value={newPrinciple}
            onChange={(e) => setNewPrinciple(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPrinciple()}
          />
          <button className="btn-primary flex items-center gap-1" onClick={handleAddPrinciple}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
