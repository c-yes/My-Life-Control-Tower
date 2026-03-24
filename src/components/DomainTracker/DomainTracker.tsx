import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Domain, DOMAIN_CONFIG } from '../../types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function DomainTracker() {
  const { domainScores, updateDomainScore } = useStore();
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editScore, setEditScore] = useState(5);
  const [editNotes, setEditNotes] = useState('');

  const domains = Object.keys(DOMAIN_CONFIG) as Domain[];

  const radarData = domainScores.map((ds) => ({
    domain: DOMAIN_CONFIG[ds.domain].labelKo,
    score: ds.score,
    fullMark: 10,
  }));

  const avgScore =
    domainScores.length > 0
      ? Math.round((domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length) * 10) / 10
      : 0;

  function startEdit(domain: Domain) {
    const ds = domainScores.find((d) => d.domain === domain);
    setEditingDomain(domain);
    setEditScore(ds?.score ?? 5);
    setEditNotes(ds?.notes ?? '');
  }

  function saveEdit() {
    if (!editingDomain) return;
    updateDomainScore(editingDomain, editScore, editNotes);
    setEditingDomain(null);
  }

  const scoreColors = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#6366f1';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">📊 Domain Tracker — 도메인 트래커</h2>
        <p className="section-subtitle">
          Track your life balance across 6 domains. Average score: {avgScore}/10
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card flex flex-col items-center">
          <h3 className="font-bold text-slate-800 mb-4 self-start">Life Balance Radar</h3>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(val: number) => [`${val}/10`, 'Score']}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Score Legend */}
          <div className="grid grid-cols-3 gap-2 w-full mt-2">
            {domainScores.map((ds) => {
              const cfg = DOMAIN_CONFIG[ds.domain];
              return (
                <div
                  key={ds.domain}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: `${cfg.color}12` }}
                >
                  <span className="text-base">{cfg.emoji}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">{cfg.labelKo}</div>
                    <div className="text-sm font-bold" style={{ color: cfg.color }}>
                      {ds.score}/10
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Sliders */}
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-4">Update Scores — 점수 업데이트</h3>
          <div className="space-y-5">
            {domains.map((domain) => {
              const ds = domainScores.find((d) => d.domain === domain);
              const cfg = DOMAIN_CONFIG[domain];
              const score = ds?.score ?? 5;
              const isEditing = editingDomain === domain;

              return (
                <div key={domain}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg.emoji}</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {cfg.label}
                        <span className="text-slate-400 font-normal ml-1">({cfg.labelKo})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: scoreColors(score) }}
                      >
                        {score}/10
                      </span>
                      <button
                        className="text-xs btn-secondary py-1 px-2"
                        onClick={() => isEditing ? saveEdit() : startEdit(domain)}
                      >
                        {isEditing ? 'Save' : 'Edit'}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Score: <strong style={{ color: cfg.color }}>{editScore}</strong>
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={editScore}
                          onChange={(e) => setEditScore(Number(e.target.value))}
                          className="w-full"
                          style={{ accentColor: cfg.color }}
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                          <span>1 (Poor)</span>
                          <span>5 (OK)</span>
                          <span>10 (Excellent)</span>
                        </div>
                      </div>
                      <textarea
                        className="textarea h-16 text-xs"
                        placeholder="Notes about this area..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn-primary text-xs flex-1"
                          onClick={saveEdit}
                        >
                          Save Score
                        </button>
                        <button
                          className="btn-secondary text-xs"
                          onClick={() => setEditingDomain(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="progress-bar h-2.5">
                        <div
                          className="progress-fill h-2.5"
                          style={{ width: `${score * 10}%`, background: cfg.color }}
                        />
                      </div>
                      {ds?.notes && (
                        <p className="text-xs text-slate-400 mt-1.5 italic">{ds.notes}</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {domainScores.map((ds) => {
          const cfg = DOMAIN_CONFIG[ds.domain];
          const level =
            ds.score >= 8 ? 'Excellent' :
            ds.score >= 6 ? 'Good' :
            ds.score >= 4 ? 'Needs Work' : 'Critical';
          const levelKo =
            ds.score >= 8 ? '우수' :
            ds.score >= 6 ? '양호' :
            ds.score >= 4 ? '개선 필요' : '위기';
          return (
            <div
              key={ds.domain}
              className="p-4 rounded-xl border"
              style={{ borderColor: `${cfg.color}40`, background: `${cfg.color}08` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cfg.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800">{cfg.label}</div>
                  <div className="text-xs text-slate-500">{cfg.labelKo}</div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold" style={{ color: cfg.color }}>
                  {ds.score}
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium" style={{ color: scoreColors(ds.score) }}>
                    {level}
                  </div>
                  <div className="text-xs text-slate-400">{levelKo}</div>
                </div>
              </div>
              <div className="mt-2 progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${ds.score * 10}%`, background: cfg.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
