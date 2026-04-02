import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Miracle21Habit, Miracle21Step } from '../../types';
import { generateId } from '../../utils/helpers';
import { format, addDays } from 'date-fns';
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function makeEmptyDays() {
  return Array.from({ length: 21 }, () => ({ completed: false, note: '' }));
}

function makeStep(stepNumber: number, startDate: string): Miracle21Step {
  return {
    id: generateId(),
    goal: '',
    startDate,
    days: makeEmptyDays(),
    feedback: '',
  };
}

function getDayDate(startDate: string, dayIndex: number): string {
  return format(addDays(new Date(startDate + 'T12:00:00'), dayIndex), 'yyyy-MM-dd');
}

function getStepProgress(step: Miracle21Step): { done: number; pct: number } {
  const done = step.days.filter((d) => d.completed).length;
  return { done, pct: Math.round((done / 21) * 100) };
}

export default function Miracle21() {
  const { miracle21Habits, addMiracle21Habit, updateMiracle21Habit, deleteMiracle21Habit } =
    useStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    miracle21Habits[0]?.id ?? null
  );
  const [creatingName, setCreatingName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  function handleCreate() {
    if (!creatingName.trim()) return;
    const habit: Miracle21Habit = {
      id: generateId(),
      name: creatingName.trim(),
      finalGoal: '',
      steps: [makeStep(1, today)],
    };
    addMiracle21Habit(habit);
    setCreatingName('');
    setShowCreate(false);
    setSelectedId(habit.id);
  }

  const selected = selectedId ? miracle21Habits.find((h) => h.id === selectedId) : null;

  function activeStepIdx(h: Miracle21Habit) {
    return h.steps.length - 1;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 fade-in" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* ── Sidebar ── */}
      <div className="md:w-56 md:flex-shrink-0 bg-white border border-slate-200 rounded-xl p-3 flex md:flex-col flex-row gap-2 overflow-x-auto">
        <button
          className="flex-shrink-0 md:w-full text-center py-2 px-3 rounded-lg text-xs border border-dashed border-slate-300 text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
          onClick={() => setShowCreate(true)}
        >
          +
        </button>

        {miracle21Habits.map((h) => {
          const stepIdx = activeStepIdx(h);
          const isSelected = selectedId === h.id;
          return (
            <button
              key={h.id}
              className="flex-shrink-0 md:w-full text-left px-3 py-2.5 rounded-lg transition-all"
              style={{
                background: isSelected ? '#fff7ed' : 'transparent',
                borderLeft: isSelected ? '3px solid #f97316' : '3px solid transparent',
              }}
              onClick={() => setSelectedId(h.id)}
            >
              <div className="text-sm font-semibold truncate" style={{ color: isSelected ? '#ea580c' : '#334155' }}>
                {h.name}
              </div>
              <div className="text-xs mt-0.5 text-slate-400">
                Step {stepIdx + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0">
        {showCreate && (
          <div className="card mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">새 습관 만들기</h3>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="습관 이름 (예: 매일 독서)"
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <button className="btn-primary" onClick={handleCreate}>시작</button>
              <button className="btn-secondary" onClick={() => setShowCreate(false)}>취소</button>
            </div>
          </div>
        )}

        {!selected && !showCreate && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-slate-600 font-medium">습관을 선택하거나 새로 만드세요</p>
            <p className="text-slate-400 text-sm mt-1">21일 단위 Step으로 최종 목표를 향해 나아가세요</p>
            <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
              첫 습관 만들기
            </button>
          </div>
        )}

        {selected && (
          <HabitDetail
            habit={selected}
            today={today}
            onUpdate={(updates) => updateMiracle21Habit(selected.id, updates)}
            onDelete={() => {
              deleteMiracle21Habit(selected.id);
              setSelectedId(miracle21Habits.find((h) => h.id !== selected.id)?.id ?? null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HabitDetail
// ──────────────────────────────────────────────────────────────────────────────

function HabitDetail({
  habit,
  today,
  onUpdate,
  onDelete,
}: {
  habit: Miracle21Habit;
  today: string;
  onUpdate: (updates: Partial<Miracle21Habit>) => void;
  onDelete: () => void;
}) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(habit.finalGoal);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(habit.name);

  function saveGoal() {
    onUpdate({ finalGoal: goalDraft });
    setEditingGoal(false);
  }

  function saveName() {
    if (nameDraft.trim()) onUpdate({ name: nameDraft.trim() });
    setEditingName(false);
  }

  function updateStep(stepIdx: number, updates: Partial<Miracle21Step>) {
    const steps = habit.steps.map((s, i) => (i === stepIdx ? { ...s, ...updates } : s));
    onUpdate({ steps });
  }

  function addNextStep() {
    const lastStep = habit.steps[habit.steps.length - 1];
    const nextStart = getDayDate(lastStep.startDate, 21);
    const newStep = makeStep(habit.steps.length + 1, nextStart);
    onUpdate({ steps: [...habit.steps, newStep] });
  }

  return (
    <div className="space-y-4">
      {/* Habit name header */}
      <div className="flex items-center justify-between">
        {editingName ? (
          <input
            className="input text-lg font-bold flex-1 mr-4"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            autoFocus
          />
        ) : (
          <h2
            className="text-xl font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => { setNameDraft(habit.name); setEditingName(true); }}
          >
            {habit.name}
          </h2>
        )}
        <button
          className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors"
          onClick={onDelete}
        >
          삭제
        </button>
      </div>

      {/* Final Goal */}
      <div className="card">
        <div className="text-xs font-semibold mb-2 text-orange-500">
          최종 목표 (Final Goal)
        </div>
        {editingGoal ? (
          <textarea
            autoFocus
            className="w-full bg-transparent text-sm resize-none outline-none border-b border-slate-300 pb-1 text-slate-800"
            value={goalDraft}
            onChange={(e) => setGoalDraft(e.target.value)}
            onBlur={saveGoal}
            rows={2}
            placeholder="최종적으로 이루고 싶은 목표를 입력하세요..."
          />
        ) : (
          <p
            className="text-sm cursor-text"
            style={{ color: habit.finalGoal ? '#1e293b' : '#94a3b8' }}
            onClick={() => { setGoalDraft(habit.finalGoal); setEditingGoal(true); }}
          >
            {habit.finalGoal || '최종적으로 이루고 싶은 목표를 입력하세요...'}
          </p>
        )}
      </div>

      {/* Steps */}
      {habit.steps.map((step, stepIdx) => (
        <StepCard
          key={step.id}
          step={step}
          stepNumber={stepIdx + 1}
          today={today}
          isLast={stepIdx === habit.steps.length - 1}
          onChange={(updates) => updateStep(stepIdx, updates)}
        />
      ))}

      {/* Add next step button */}
      {(() => {
        const lastStep = habit.steps[habit.steps.length - 1];
        const { done } = getStepProgress(lastStep);
        const lastDayDate = getDayDate(lastStep.startDate, 20);
        const canAdd = done >= 21 || lastDayDate < today;
        if (!canAdd) return null;
        return (
          <button
            className="w-full py-3 text-sm font-medium rounded-xl border border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 transition-all"
            onClick={addNextStep}
          >
            + Step {habit.steps.length + 1} 추가
          </button>
        );
      })()}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// StepCard
// ──────────────────────────────────────────────────────────────────────────────

function StepCard({
  step,
  stepNumber,
  today,
  isLast,
  onChange,
}: {
  step: Miracle21Step;
  stepNumber: number;
  today: string;
  isLast: boolean;
  onChange: (updates: Partial<Miracle21Step>) => void;
}) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(step.goal);
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(step.startDate);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [dayNoteDraft, setDayNoteDraft] = useState('');
  const [collapsed, setCollapsed] = useState(!isLast);

  const { done, pct } = getStepProgress(step);

  function saveGoal() {
    onChange({ goal: goalDraft });
    setEditingGoal(false);
  }

  function toggleDay(dayIdx: number) {
    const days = step.days.map((d, i) =>
      i === dayIdx ? { ...d, completed: !d.completed } : d
    );
    onChange({ days });
  }

  function openDayNote(dayIdx: number) {
    setDayNoteDraft(step.days[dayIdx].note);
    setEditingDay(dayIdx);
  }

  function saveDayNote() {
    if (editingDay === null) return;
    const days = step.days.map((d, i) =>
      i === editingDay ? { ...d, note: dayNoteDraft } : d
    );
    onChange({ days });
    setEditingDay(null);
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-slate-50 border-b border-slate-200"
        onClick={() => setCollapsed(!collapsed)}
      >
        {/* S badge */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-orange-500 text-white">
          S{stepNumber}
        </div>

        {/* Goal title */}
        <div className="flex-1 min-w-0">
          {editingGoal && !collapsed ? (
            <input
              autoFocus
              className="bg-transparent outline-none text-sm font-medium w-full border-b border-orange-400 text-slate-800"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              onBlur={saveGoal}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') saveGoal();
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="이 단계의 목표 (예: 하루 1문장)"
            />
          ) : (
            <span
              className="text-sm font-medium truncate block"
              style={{ color: step.goal ? '#1e293b' : '#94a3b8' }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setGoalDraft(step.goal);
                setEditingGoal(true);
                if (collapsed) setCollapsed(false);
              }}
            >
              {step.goal || `Step ${stepNumber} 목표 (더블클릭해서 입력)`}
            </span>
          )}
          <div className="h-0.5 mt-0.5 rounded-full w-2/5 bg-orange-400" />
        </div>

        {/* Start date */}
        {editingDate ? (
          <input
            type="date"
            autoFocus
            className="text-xs rounded px-1 py-0.5 outline-none border border-orange-400 text-orange-600 bg-orange-50 flex-shrink-0"
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
            onBlur={() => {
              if (dateDraft) onChange({ startDate: dateDraft });
              setEditingDate(false);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                if (dateDraft) onChange({ startDate: dateDraft });
                setEditingDate(false);
              }
              if (e.key === 'Escape') setEditingDate(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-xs flex-shrink-0 cursor-pointer hover:underline text-slate-400"
            title="클릭하여 시작일 수정"
            onClick={(e) => {
              e.stopPropagation();
              setDateDraft(step.startDate);
              setEditingDate(true);
              if (collapsed) setCollapsed(false);
            }}
          >
            {step.startDate}
          </span>
        )}

        {/* Progress */}
        <span className="text-xs flex-shrink-0 text-orange-500 font-medium">
          {done}/21 ({pct}%)
        </span>
        {collapsed ? (
          <ChevronDown size={16} className="text-slate-400" />
        ) : (
          <ChevronUp size={16} className="text-slate-400" />
        )}
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* 21-day grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {step.days.map((dayEntry, dayIdx) => {
              const dateStr = getDayDate(step.startDate, dayIdx);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              const isEditing = editingDay === dayIdx;

              return (
                <div
                  key={dayIdx}
                  className="rounded-xl overflow-hidden flex flex-col"
                  style={{
                    border: isToday
                      ? '2px solid #f97316'
                      : dayEntry.completed
                      ? '1px solid #86efac'
                      : '1px solid #e2e8f0',
                    background: dayEntry.completed
                      ? '#f0fdf4'
                      : isToday
                      ? '#fff7ed'
                      : '#f8fafc',
                    opacity: isFuture ? 0.5 : 1,
                    minHeight: 100,
                  }}
                >
                  {/* Day header */}
                  <div className="flex items-center gap-1.5 px-2 pt-2 pb-1">
                    <div
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => !isFuture && toggleDay(dayIdx)}
                    >
                      {dayEntry.completed ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded border border-slate-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-none text-slate-600">
                        D{dayIdx + 1}
                      </div>
                      <div className="leading-none mt-0.5 text-slate-400" style={{ fontSize: 9 }}>
                        {format(new Date(dateStr + 'T12:00:00'), 'MM-dd')}
                      </div>
                    </div>
                  </div>

                  {/* Note area */}
                  {isEditing ? (
                    <textarea
                      autoFocus
                      className="flex-1 w-full bg-transparent resize-none outline-none px-2 pb-2 text-slate-600"
                      style={{ fontSize: 11, minHeight: 60 }}
                      value={dayNoteDraft}
                      onChange={(e) => setDayNoteDraft(e.target.value)}
                      onBlur={saveDayNote}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && saveDayNote()}
                      placeholder="Note..."
                    />
                  ) : (
                    <div
                      className="flex-1 px-2 pb-2 cursor-text overflow-hidden"
                      style={{
                        fontSize: 11,
                        color: dayEntry.note ? '#475569' : '#cbd5e1',
                        minHeight: 60,
                        whiteSpace: 'pre-wrap',
                      }}
                      onClick={() => !isFuture && openDayNote(dayIdx)}
                    >
                      {dayEntry.note || ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Self feedback */}
          <div>
            <div className="text-xs font-semibold mb-1.5 text-orange-500">
              셀프 피드백
            </div>
            <textarea
              className="w-full rounded-xl border border-slate-200 text-sm resize-none p-3 bg-slate-50 text-slate-800"
              style={{ minHeight: 80 }}
              value={step.feedback}
              onChange={(e) => onChange({ feedback: e.target.value })}
              placeholder="21일을 돌이보며 — 무엇이 달라졌는가? 다음 스텝 목표는?"
            />
          </div>
        </div>
      )}
    </div>
  );
}
