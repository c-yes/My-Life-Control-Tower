"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  ChevronRight,
  Music,
  Image,
  Video,
  Tag,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { WORKFLOW_STAGES, StageId } from "@/lib/constants";
import { Video as VideoType } from "@/lib/notion";
import { PromptGenerator } from "@/components/PromptGenerator";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";

type Props = { video: VideoType };

const STAGE_ICONS: Record<string, React.ReactNode> = {
  planning: <Circle size={16} />,
  prompt_writing: <Music size={16} />,
  music_production: <Music size={16} />,
  cover_image: <Image size={16} />,
  video_editing: <Video size={16} />,
  thumbnail: <Image size={16} />,
  description_tags: <Tag size={16} />,
  scheduled: <Calendar size={16} />,
  done: <CheckCircle2 size={16} />,
};

// Map korean status to stage id
const KOREAN_TO_ID: Record<string, StageId> = {
  "기획": "planning",
  "프롬프트 작성": "prompt_writing",
  "SUNO 음악 제작": "music_production",
  "커버 이미지": "cover_image",
  "영상 편집": "video_editing",
  "썸네일": "thumbnail",
  "설명/태그 작성": "description_tags",
  "업로드 예약": "scheduled",
  "완료": "done",
};

export function VideoDetail({ video: initialVideo }: Props) {
  const [video, setVideo] = useState(initialVideo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: video.title,
    uploadDate: video.uploadDate ?? "",
    referenceUrl: video.referenceUrl ?? "",
    conceptMemo: video.conceptMemo ?? "",
    sunoStylePrompt: video.sunoStylePrompt ?? "",
    sunoLyricsPrompt: video.sunoLyricsPrompt ?? "",
    sunoSongUrl: video.sunoSongUrl ?? "",
    coverImageUrl: video.coverImageUrl ?? "",
    youtubeUrl: video.youtubeUrl ?? "",
  });

  const currentStageId: StageId = KOREAN_TO_ID[video.status] ?? (video.status as StageId);
  const currentStageIdx = WORKFLOW_STAGES.findIndex((s) => s.id === currentStageId);
  const currentStage = WORKFLOW_STAGES[currentStageIdx];

  async function save(fields?: Partial<typeof form & { status: StageId }>) {
    setSaving(true);
    try {
      const body = fields ?? form;
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setVideo(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function changeStage(stageId: StageId) {
    const updated = { ...video, status: stageId };
    setVideo(updated);
    await save({ status: stageId });
  }

  function handlePromptSave(style: string, lyrics: string) {
    const updated = { ...form, sunoStylePrompt: style, sunoLyricsPrompt: lyrics };
    setForm(updated);
    save(updated);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        대시보드로 돌아가기
      </Link>

      {/* Title + Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="flex-1 text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent focus:border-purple-400 focus:outline-none pb-1"
          />
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <Save size={14} />
            {saving ? "저장 중..." : saved ? "저장됨 ✓" : "저장"}
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isActive = stage.id === currentStageId;
            const isDone = idx < currentStageIdx;
            return (
              <button
                key={stage.id}
                onClick={() => changeStage(stage.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? stage.color + " ring-2 ring-offset-1 ring-purple-400"
                    : isDone
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {isDone ? <CheckCircle2 size={12} /> : STAGE_ICONS[stage.id]}
                {stage.label}
                {idx < WORKFLOW_STAGES.length - 1 && (
                  <ChevronRight size={12} className="text-slate-300 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {currentStage && (
          <Badge className={currentStage.color + " text-sm"}>
            현재 단계: {currentStage.label}
          </Badge>
        )}
      </div>

      {/* Basic Info */}
      <Section title="기본 정보">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="업로드 예정일">
            <input
              type="date"
              value={form.uploadDate}
              onChange={(e) => setForm({ ...form, uploadDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </Field>
          <Field label="참고 곡 URL (클래식)">
            <input
              type="url"
              value={form.referenceUrl}
              onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </Field>
        </div>
        <Field label="컨셉 메모">
          <textarea
            value={form.conceptMemo}
            onChange={(e) => setForm({ ...form, conceptMemo: e.target.value })}
            placeholder="기획 아이디어, 분위기, 어울리는 장면..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </Field>
      </Section>

      {/* SUNO Prompt Generator */}
      <Section title="SUNO 프롬프트 생성기" accent="purple">
        <PromptGenerator
          onSave={handlePromptSave}
          initialStyle={form.sunoStylePrompt}
          initialLyrics={form.sunoLyricsPrompt}
        />
      </Section>

      {/* Saved Prompts (editable) */}
      {(form.sunoStylePrompt || form.sunoLyricsPrompt) && (
        <Section title="저장된 프롬프트">
          <Field label="Style Prompt">
            <div className="relative">
              <textarea
                value={form.sunoStylePrompt}
                onChange={(e) => setForm({ ...form, sunoStylePrompt: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none font-mono"
              />
              <div className="absolute top-2 right-2">
                <CopyButton text={form.sunoStylePrompt} />
              </div>
            </div>
          </Field>
          <Field label="Lyrics Prompt">
            <div className="relative">
              <textarea
                value={form.sunoLyricsPrompt}
                onChange={(e) => setForm({ ...form, sunoLyricsPrompt: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none font-mono"
              />
              <div className="absolute top-2 right-2">
                <CopyButton text={form.sunoLyricsPrompt} />
              </div>
            </div>
          </Field>
        </Section>
      )}

      {/* Asset Links */}
      <Section title="에셋 링크">
        <div className="space-y-3">
          <LinkField
            label="SUNO 곡 URL"
            value={form.sunoSongUrl}
            onChange={(v) => setForm({ ...form, sunoSongUrl: v })}
            placeholder="https://suno.com/song/..."
          />
          <LinkField
            label="커버 이미지 URL"
            value={form.coverImageUrl}
            onChange={(v) => setForm({ ...form, coverImageUrl: v })}
            placeholder="https://..."
          />
          <LinkField
            label="유튜브 URL"
            value={form.youtubeUrl}
            onChange={(v) => setForm({ ...form, youtubeUrl: v })}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: "purple";
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h2
        className={`text-base font-semibold ${accent === "purple" ? "text-purple-700" : "text-slate-700"}`}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function LinkField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-500 w-36 shrink-0">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}
