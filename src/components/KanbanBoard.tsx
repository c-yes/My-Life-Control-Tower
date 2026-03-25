"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Music, Calendar, ExternalLink } from "lucide-react";
import { WORKFLOW_STAGES, StageId } from "@/lib/constants";
import { Video } from "@/lib/notion";
import { Badge } from "@/components/ui/Badge";

type Props = {
  initialVideos: Video[];
};

export function KanbanBoard({ initialVideos }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function createVideo() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const video = await res.json();
      setVideos((prev) => [video, ...prev]);
      setNewTitle("");
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  }

  async function moveStage(videoId: string, newStatus: StageId) {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, status: newStatus } : v))
    );
    await fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Music className="text-purple-500" size={24} />
            Healing Prenatal Music
          </h1>
          <p className="text-sm text-slate-500 mt-1">태교음악 영상 제작 워크플로우</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Calendar size={16} />
            업로드 캘린더
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
            새 영상
          </button>
        </div>
      </div>

      {/* New video form */}
      {showForm && (
        <div className="flex gap-2 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <input
            autoFocus
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createVideo();
              if (e.key === "Escape") setShowForm(false);
            }}
            placeholder="영상 제목 입력..."
            className="flex-1 px-4 py-2 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          />
          <button
            onClick={createVideo}
            disabled={creating || !newTitle.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {creating ? "생성 중..." : "생성"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Kanban columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {WORKFLOW_STAGES.map((stage) => {
            const stageVideos = videos.filter((v) => {
              // Map korean status from Notion back to stage id
              const statusMap: Record<string, StageId> = {
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
              const mappedStatus = statusMap[v.status] ?? v.status;
              return mappedStatus === stage.id;
            });

            return (
              <div key={stage.id} className="w-64 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={stage.color}>{stage.label}</Badge>
                  <span className="text-xs text-slate-400 font-medium">{stageVideos.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px] bg-slate-50 rounded-xl p-2">
                  {stageVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      currentStageId={stage.id}
                      onMove={moveStage}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VideoCard({
  video,
  currentStageId,
  onMove,
}: {
  video: Video;
  currentStageId: StageId;
  onMove: (id: string, stage: StageId) => void;
}) {
  const currentIdx = WORKFLOW_STAGES.findIndex((s) => s.id === currentStageId);
  const prevStage = currentIdx > 0 ? WORKFLOW_STAGES[currentIdx - 1] : null;
  const nextStage = currentIdx < WORKFLOW_STAGES.length - 1 ? WORKFLOW_STAGES[currentIdx + 1] : null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow group">
      <Link href={`/video/${video.id}`} className="block mb-2">
        <p className="text-sm font-medium text-slate-800 line-clamp-2 hover:text-purple-600 transition-colors">
          {video.title}
        </p>
        {video.uploadDate && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(video.uploadDate).toLocaleDateString("ko-KR")}
          </p>
        )}
        {video.youtubeUrl && (
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
            <ExternalLink size={10} />
            YouTube
          </p>
        )}
      </Link>

      {/* Stage navigation */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {prevStage && (
          <button
            onClick={() => onMove(video.id, prevStage.id)}
            className="flex-1 text-xs py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            ← 이전
          </button>
        )}
        {nextStage && (
          <button
            onClick={() => onMove(video.id, nextStage.id)}
            className="flex-1 text-xs py-1 rounded bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
          >
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}
