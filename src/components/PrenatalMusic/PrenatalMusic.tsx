import { useState } from 'react';
import { Plus, Music, Calendar, Settings, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/helpers';
import { PrenatalVideo, PrenatalStage } from '../../types';
import { PRENATAL_STAGES } from './constants';
import { VideoModal } from './VideoModal';

type View = 'kanban' | 'calendar' | 'settings';

export default function PrenatalMusic() {
  const {
    prenatalVideos,
    addPrenatalVideo,
    updatePrenatalVideo,
    deletePrenatalVideo,
    anthropicApiKey,
    setAnthropicApiKey,
  } = useStore();

  const [view, setView] = useState<View>('kanban');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(anthropicApiKey);

  const selectedVideo = prenatalVideos.find((v) => v.id === selectedId) ?? null;

  function createVideo() {
    if (!newTitle.trim()) return;
    addPrenatalVideo({
      id: generateId(),
      title: newTitle.trim(),
      stage: 'planning',
      uploadDate: '',
      referenceUrl: '',
      conceptMemo: '',
      sunoStylePrompt: '',
      sunoLyricsPrompt: '',
      sunoSongUrl: '',
      coverImageUrl: '',
      youtubeUrl: '',
      createdAt: new Date().toISOString(),
    });
    setNewTitle('');
    setShowForm(false);
  }

  function moveStage(id: string, stage: PrenatalStage) {
    updatePrenatalVideo(id, { stage });
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Music size={20} className="text-purple-500" />
            Healing Prenatal Music
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">태교음악 유튜브 채널 영상 제작 워크플로우</p>
        </div>
        <div className="flex items-center gap-2">
          {(['kanban', 'calendar', 'settings'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {v === 'kanban' ? <Music size={14} /> : v === 'calendar' ? <Calendar size={14} /> : <Settings size={14} />}
              {v === 'kanban' ? '칸반' : v === 'calendar' ? '캘린더' : '설정'}
            </button>
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> 새 영상
          </button>
        </div>
      </div>

      {/* New video form */}
      {showForm && (
        <div className="card flex gap-2">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createVideo(); if (e.key === 'Escape') setShowForm(false); }}
            placeholder="영상 제목 입력..."
            className="input flex-1"
          />
          <button onClick={createVideo} disabled={!newTitle.trim()} className="btn-primary disabled:opacity-50">생성</button>
          <button onClick={() => setShowForm(false)} className="px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-100 text-sm">취소</button>
        </div>
      )}

      {/* Views */}
      {view === 'kanban' && <KanbanView videos={prenatalVideos} onSelect={setSelectedId} onMove={moveStage} />}
      {view === 'calendar' && <CalendarView videos={prenatalVideos} onSelect={setSelectedId} />}
      {view === 'settings' && (
        <div className="card max-w-lg space-y-4">
          <h2 className="font-bold text-slate-700">설정</h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Anthropic API Key
              <span className="text-xs text-slate-400 ml-2 font-normal">(AI 프롬프트 생성에 필요)</span>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="input w-full"
            />
            <button
              onClick={() => { setAnthropicApiKey(apiKeyInput); alert('저장됐어요!'); }}
              className="btn-primary mt-2"
            >
              저장
            </button>
          </div>
          <p className="text-xs text-slate-400">API Key는 이 기기의 로컬 스토리지에만 저장됩니다.</p>
        </div>
      )}

      {/* Video detail modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedId(null)}
          onSave={(updates) => updatePrenatalVideo(selectedVideo.id, updates)}
          onDelete={() => { deletePrenatalVideo(selectedVideo.id); setSelectedId(null); }}
        />
      )}
    </div>
  );
}

function KanbanView({ videos, onSelect, onMove }: {
  videos: PrenatalVideo[];
  onSelect: (id: string) => void;
  onMove: (id: string, stage: PrenatalStage) => void;
}) {
  return (
    <div className="overflow-x-auto pb-4 -mx-6 px-6">
      <div className="flex gap-4 min-w-max">
        {PRENATAL_STAGES.map((stage) => {
          const stageVideos = videos.filter((v) => v.stage === stage.id);
          return (
            <div key={stage.id} className="w-56 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs text-slate-400">{stageVideos.length}</span>
              </div>
              <div className="space-y-2 min-h-[80px] bg-slate-50 rounded-xl p-2">
                {stageVideos.map((v) => (
                  <VideoCard key={v.id} video={v} stageIdx={PRENATAL_STAGES.findIndex(s => s.id === stage.id)} onSelect={onSelect} onMove={onMove} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoCard({ video, stageIdx, onSelect, onMove }: {
  video: PrenatalVideo;
  stageIdx: number;
  onSelect: (id: string) => void;
  onMove: (id: string, stage: PrenatalStage) => void;
}) {
  const prev = stageIdx > 0 ? PRENATAL_STAGES[stageIdx - 1] : null;
  const next = stageIdx < PRENATAL_STAGES.length - 1 ? PRENATAL_STAGES[stageIdx + 1] : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow group">
      <button onClick={() => onSelect(video.id)} className="block text-left w-full mb-2">
        <p className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-purple-600 transition-colors">{video.title}</p>
        {video.uploadDate && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(video.uploadDate).toLocaleDateString('ko-KR')}
          </p>
        )}
        {video.youtubeUrl && (
          <p className="text-xs text-emerald-500 mt-0.5 flex items-center gap-1">
            <ExternalLink size={10} /> YouTube
          </p>
        )}
      </button>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {prev && (
          <button onClick={() => onMove(video.id, prev.id as PrenatalStage)} className="flex-1 text-xs py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-200">← 이전</button>
        )}
        {next && (
          <button onClick={() => onMove(video.id, next.id as PrenatalStage)} className="flex-1 text-xs py-0.5 rounded bg-purple-100 text-purple-600 hover:bg-purple-200">다음 →</button>
        )}
      </div>
    </div>
  );
}

function CalendarView({ videos, onSelect }: { videos: PrenatalVideo[]; onSelect: (id: string) => void }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate: Record<string, PrenatalVideo[]> = {};
  for (const v of videos) {
    if (!v.uploadDate) continue;
    if (!byDate[v.uploadDate]) byDate[v.uploadDate] = [];
    byDate[v.uploadDate].push(v);
  }

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-1.5 rounded-lg hover:bg-slate-100">‹</button>
        <span className="font-semibold text-slate-700">{year}년 {monthNames[month]}</span>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-1.5 rounded-lg hover:bg-slate-100">›</button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={d} className={`text-xs font-medium text-center py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
        {cells.map((day, idx) => {
          const key = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
          const dayVids = byDate[key] ?? [];
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={idx} className={`bg-white min-h-[72px] p-1.5 ${!day ? 'opacity-30' : ''}`}>
              {day && (
                <>
                  <span className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full mb-1 ${isToday ? 'bg-purple-600 text-white' : idx % 7 === 0 ? 'text-red-400' : idx % 7 === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{day}</span>
                  {dayVids.map((v) => {
                    const stage = PRENATAL_STAGES.find(s => s.id === v.stage);
                    return (
                      <button key={v.id} onClick={() => onSelect(v.id)} className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate mb-0.5 ${stage?.color ?? 'bg-slate-100 text-slate-600'} hover:opacity-80`}>
                        {v.title}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">예정된 업로드</h3>
        <div className="space-y-1.5">
          {videos
            .filter(v => v.uploadDate && v.uploadDate >= today.toISOString().slice(0, 10))
            .sort((a, b) => a.uploadDate.localeCompare(b.uploadDate))
            .slice(0, 8)
            .map(v => {
              const stage = PRENATAL_STAGES.find(s => s.id === v.stage);
              return (
                <button key={v.id} onClick={() => onSelect(v.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left">
                  <span className="text-xs font-mono text-slate-400 w-24 shrink-0">{new Date(v.uploadDate).toLocaleDateString('ko-KR')}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{v.title}</span>
                  {stage && <span className={`text-xs px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>}
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </button>
              );
            })}
          {videos.filter(v => v.uploadDate && v.uploadDate >= today.toISOString().slice(0, 10)).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">예정된 업로드가 없어요.</p>
          )}
        </div>
      </div>
    </div>
  );
}
