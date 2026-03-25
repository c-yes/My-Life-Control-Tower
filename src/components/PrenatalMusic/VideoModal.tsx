import { useState } from 'react';
import { X, Save, ExternalLink, Copy, Check, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PrenatalVideo, PrenatalStage } from '../../types';
import { PRENATAL_STAGES, EXCLUDE_PROMPT } from './constants';
import { PromptGenerator } from './PromptGenerator';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? '복사됨' : '복사'}
    </button>
  );
}

type Props = {
  video: PrenatalVideo;
  onClose: () => void;
  onSave: (updates: Partial<PrenatalVideo>) => void;
  onDelete: () => void;
};

export function VideoModal({ video, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    title: video.title,
    stage: video.stage,
    uploadDate: video.uploadDate,
    referenceUrl: video.referenceUrl,
    conceptMemo: video.conceptMemo,
    sunoStylePrompt: video.sunoStylePrompt,
    sunoLyricsPrompt: video.sunoLyricsPrompt,
    sunoSongUrl: video.sunoSongUrl,
    coverImageUrl: video.coverImageUrl,
    youtubeUrl: video.youtubeUrl,
  });
  const [saved, setSaved] = useState(false);

  function save() {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const currentIdx = PRENATAL_STAGES.findIndex((s) => s.id === form.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent focus:border-purple-400 focus:outline-none flex-1 mr-4"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={save}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Save size={14} />
              {saved ? '저장됨 ✓' : '저장'}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stage Progress */}
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {PRENATAL_STAGES.map((s, idx) => {
                const isActive = s.id === form.stage;
                const isDone = idx < currentIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, stage: s.id as PrenatalStage })}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive ? s.color + ' ring-2 ring-purple-400 ring-offset-1' :
                      isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={11} /> : null}
                    {s.label}
                    {idx < PRENATAL_STAGES.length - 1 && <ChevronRight size={10} className="text-slate-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">업로드 예정일</label>
              <input type="date" value={form.uploadDate} onChange={(e) => setForm({ ...form, uploadDate: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">참고 곡 URL</label>
              <input type="url" value={form.referenceUrl} onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })} placeholder="https://youtube.com/..." className="input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">컨셉 메모</label>
            <textarea value={form.conceptMemo} onChange={(e) => setForm({ ...form, conceptMemo: e.target.value })} placeholder="기획 아이디어, 분위기..." rows={2} className="input w-full resize-none" />
          </div>

          {/* Prompt Generator */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
            <h3 className="text-sm font-bold text-purple-800 mb-4">🎵 SUNO 프롬프트 생성기</h3>
            <PromptGenerator
              onSave={(style, lyrics) => setForm({ ...form, sunoStylePrompt: style, sunoLyricsPrompt: lyrics })}
              initialStyle={form.sunoStylePrompt}
              initialLyrics={form.sunoLyricsPrompt}
            />
          </div>

          {/* Saved Prompts */}
          {(form.sunoStylePrompt || form.sunoLyricsPrompt) && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">저장된 프롬프트</h3>
              <PromptTextarea label="Style Prompt" value={form.sunoStylePrompt} onChange={(v) => setForm({ ...form, sunoStylePrompt: v })} />
              <PromptTextarea label="Lyrics Prompt" value={form.sunoLyricsPrompt} onChange={(v) => setForm({ ...form, sunoLyricsPrompt: v })} rows={8} />
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Exclude (항상 포함)</span>
                  <CopyBtn text={EXCLUDE_PROMPT} />
                </div>
                <p className="text-xs text-orange-800 font-mono">{EXCLUDE_PROMPT}</p>
              </div>
            </div>
          )}

          {/* Asset Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700">에셋 링크</h3>
            <LinkRow label="SUNO 곡" value={form.sunoSongUrl} onChange={(v) => setForm({ ...form, sunoSongUrl: v })} placeholder="https://suno.com/..." />
            <LinkRow label="커버 이미지" value={form.coverImageUrl} onChange={(v) => setForm({ ...form, coverImageUrl: v })} placeholder="https://..." />
            <LinkRow label="유튜브" value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} placeholder="https://youtube.com/..." />
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-slate-100">
            <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              이 영상 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptTextarea({ label, value, onChange, rows = 5 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="input w-full resize-none font-mono text-xs pr-20" />
      <div className="absolute top-7 right-2"><CopyBtn text={value} /></div>
    </div>
  );
}

function LinkRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 w-24 shrink-0">{label}</span>
      <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input flex-1" />
      {value && (
        <a href={value} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors">
          <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
}
