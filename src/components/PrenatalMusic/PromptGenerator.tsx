import { useState } from 'react';
import { Sparkles, Link, FileText, Loader2, Copy, Check } from 'lucide-react';
import { EXCLUDE_PROMPT } from './constants';
import { useStore } from '../../store/useStore';

type Mode = 'url' | 'concept';
type Result = { stylePrompt: string; lyricsPrompt: string };

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? '복사됨' : '복사'}
    </button>
  );
}

function PromptBlock({ label, content, colorClass }: { label: string; content: string; colorClass: string }) {
  return (
    <div className={`rounded-xl border p-4 ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</span>
        <CopyBtn text={content} />
      </div>
      <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{content}</pre>
    </div>
  );
}

type Props = {
  onSave?: (style: string, lyrics: string) => void;
  initialStyle?: string;
  initialLyrics?: string;
};

export function PromptGenerator({ onSave, initialStyle = '', initialLyrics = '' }: Props) {
  const { anthropicApiKey } = useStore();
  const [mode, setMode] = useState<Mode>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(
    initialStyle || initialLyrics ? { stylePrompt: initialStyle, lyricsPrompt: initialLyrics } : null
  );

  async function generate() {
    if (!input.trim()) return;
    if (!anthropicApiKey) {
      setError('설정에서 Anthropic API Key를 먼저 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const systemPrompt = `You are an expert at creating SUNO AI music prompts for prenatal (태교) healing music.
The music must always be gentle, calming, major key, warm harmony, soft dynamics, extended long-form, slow evolving.
Generate TWO prompts:
1. Style Prompt: musical style, instruments, tempo, mood. End with: ${EXCLUDE_PROMPT}
2. Lyrics Prompt: [Verse] and [Chorus] with gentle nurturing lyrics in English.

Return ONLY valid JSON: {"stylePrompt": "...", "lyricsPrompt": "..."}`;

      const userMsg = mode === 'url'
        ? `Generate SUNO prompts inspired by this classical piece: ${input}\nCapture its essence while making it gentle for 태교.`
        : `Generate SUNO prompts for this concept: "${input}"\nMake it gentle and suitable for 태교.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? '오류가 발생했습니다.');
      const text = data.content[0].text;
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('응답 파싱 실패');
      setResult(JSON.parse(match[0]));
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden w-fit">
        {(['url', 'concept'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${mode === m ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {m === 'url' ? <Link size={13} /> : <FileText size={13} />}
            {m === 'url' ? '클래식 URL' : '컨셉/문장'}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder={mode === 'url' ? '유튜브 클래식 곡 URL 입력...' : '어울리는 문장이나 컨셉 입력...'}
          className="input flex-1"
        />
        <button
          onClick={generate}
          disabled={loading || !input.trim()}
          className="btn-primary flex items-center gap-1.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {loading ? '생성 중...' : '생성'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3">
          <PromptBlock label="Style Prompt" content={result.stylePrompt} colorClass="border-blue-200 bg-blue-50 text-blue-900" />
          <PromptBlock label="Lyrics Prompt" content={result.lyricsPrompt} colorClass="border-green-200 bg-green-50 text-green-900" />
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-orange-700">Exclude (항상 포함)</span>
              <CopyBtn text={EXCLUDE_PROMPT} />
            </div>
            <p className="text-sm text-orange-800 font-mono leading-relaxed">{EXCLUDE_PROMPT}</p>
          </div>
          {onSave && (
            <button
              onClick={() => onSave(result.stylePrompt, result.lyricsPrompt)}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              이 프롬프트 저장
            </button>
          )}
        </div>
      )}
    </div>
  );
}
