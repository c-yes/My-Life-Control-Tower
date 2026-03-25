"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Music } from "lucide-react";
import { Video } from "@/lib/notion";
import { WORKFLOW_STAGES, StageId } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";

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

type Props = { videos: Video[] };

export function UploadCalendar({ videos }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const videosByDate: Record<string, Video[]> = {};
  for (const v of videos) {
    if (!v.uploadDate) continue;
    const key = v.uploadDate.slice(0, 10);
    if (!videosByDate[key]) videosByDate[key] = [];
    videosByDate[key].push(v);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const dayNames = ["일","월","화","수","목","금","토"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} />
        대시보드로 돌아가기
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="text-purple-500" size={20} />
            <h1 className="text-xl font-bold text-slate-800">업로드 캘린더</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-base font-semibold text-slate-700 w-24 text-center">
              {year}년 {monthNames[month]}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((d, i) => (
            <div key={d} className={`text-xs font-medium text-center py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            const dateKey = day
              ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              : "";
            const dayVideos = dateKey ? (videosByDate[dateKey] ?? []) : [];
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const dayOfWeek = idx % 7;

            return (
              <div
                key={idx}
                className={`bg-white min-h-[90px] p-2 ${!day ? "opacity-30" : ""}`}
              >
                {day && (
                  <>
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full mb-1
                        ${isToday ? "bg-purple-600 text-white" : dayOfWeek === 0 ? "text-red-400" : dayOfWeek === 6 ? "text-blue-400" : "text-slate-500"}`}
                    >
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayVideos.map((v) => {
                        const stageId = KOREAN_TO_ID[v.status] ?? (v.status as StageId);
                        const stage = WORKFLOW_STAGES.find((s) => s.id === stageId);
                        return (
                          <Link key={v.id} href={`/video/${v.id}`}>
                            <Badge className={`${stage?.color ?? "bg-slate-100 text-slate-600"} text-xs w-full truncate block cursor-pointer hover:opacity-80`}>
                              {v.title}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">예정된 업로드</h2>
        <div className="space-y-2">
          {videos
            .filter((v) => v.uploadDate && v.uploadDate >= today.toISOString().slice(0, 10))
            .sort((a, b) => (a.uploadDate ?? "").localeCompare(b.uploadDate ?? ""))
            .slice(0, 10)
            .map((v) => {
              const stageId = KOREAN_TO_ID[v.status] ?? (v.status as StageId);
              const stage = WORKFLOW_STAGES.find((s) => s.id === stageId);
              return (
                <Link key={v.id} href={`/video/${v.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-mono text-slate-400 w-24 shrink-0">
                    {v.uploadDate ? new Date(v.uploadDate).toLocaleDateString("ko-KR") : ""}
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-700">{v.title}</span>
                  {stage && <Badge className={stage.color}>{stage.label}</Badge>}
                </Link>
              );
            })}
          {videos.filter((v) => v.uploadDate && v.uploadDate >= today.toISOString().slice(0, 10)).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">예정된 업로드가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
