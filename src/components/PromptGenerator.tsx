"use client";

import { useState } from "react";
import { Sparkles, Link, FileText, Loader2 } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";
import { EXCLUDE_PROMPT } from "@/lib/constants";

type Mode = "url" | "concept";

type GeneratedPrompt = {
  stylePrompt: string;
  lyricsPrompt: string;
};

type Props = {
  onSave?: (style: string, lyrics: string) => void;
  initialStyle?: string;
  initialLyrics?: string;
};

export function PromptGenerator({ onSave, initialStyle, initialLyrics }: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedPrompt | null>(
    initialStyle || initialLyrics
      ? { stylePrompt: initialStyle ?? "", lyricsPrompt: initialLyrics ?? "" }
      : null
  );

  async function generate() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
        <button
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "url"
              ? "bg-purple-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Link size={14} />
          클래식 URL
        </button>
        <button
          onClick={() => setMode("concept")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "concept"
              ? "bg-purple-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileText size={14} />
          컨셉/문장
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder={
            mode === "url"
              ? "유튜브/클래식 곡 URL 입력..."
              : "어울리는 문장이나 컨셉 입력... (예: 봄날 아침 햇살이 창문으로 들어오는 느낌)"
          }
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "생성 중..." : "생성"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Style Prompt */}
          <PromptBlock
            label="Style Prompt"
            content={result.stylePrompt}
            color="blue"
          />

          {/* Lyrics Prompt */}
          <PromptBlock
            label="Lyrics Prompt"
            content={result.lyricsPrompt}
            color="green"
          />

          {/* Exclude (always visible, read-only) */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                Exclude (항상 포함)
              </span>
              <CopyButton text={EXCLUDE_PROMPT} />
            </div>
            <p className="text-sm text-orange-800 font-mono leading-relaxed">{EXCLUDE_PROMPT}</p>
          </div>

          {/* Save button */}
          {onSave && (
            <button
              onClick={() => onSave(result.stylePrompt, result.lyricsPrompt)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              이 프롬프트 저장
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PromptBlock({
  label,
  content,
  color,
}: {
  label: string;
  content: string;
  color: "blue" | "green";
}) {
  const colors = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      label: "text-blue-700",
      text: "text-blue-900",
    },
    green: {
      border: "border-green-200",
      bg: "bg-green-50",
      label: "text-green-700",
      text: "text-green-900",
    },
  };
  const c = colors[color];

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${c.label} uppercase tracking-wide`}>
          {label}
        </span>
        <CopyButton text={content} />
      </div>
      <pre className={`text-sm ${c.text} font-mono whitespace-pre-wrap leading-relaxed`}>
        {content}
      </pre>
    </div>
  );
}
