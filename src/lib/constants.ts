export const EXCLUDE_PROMPT =
  "Exclude: fast tempo, rhythmic drive, strong pulse, drums, percussion, percussive pulses, staccato, riffs, shrills, excessive ornamentation, fast runs, intense, powerful, epic, dramatic development, cinematic buildup, tension build-up, sudden crescendos, abrupt transitions, sharp high notes, harsh attack, dense orchestration, haunting";

export const WORKFLOW_STAGES = [
  { id: "planning", label: "기획", color: "bg-slate-100 text-slate-700" },
  { id: "prompt_writing", label: "프롬프트 작성", color: "bg-purple-100 text-purple-700" },
  { id: "music_production", label: "SUNO 음악 제작", color: "bg-blue-100 text-blue-700" },
  { id: "cover_image", label: "커버 이미지", color: "bg-cyan-100 text-cyan-700" },
  { id: "video_editing", label: "영상 편집", color: "bg-orange-100 text-orange-700" },
  { id: "thumbnail", label: "썸네일", color: "bg-yellow-100 text-yellow-700" },
  { id: "description_tags", label: "설명/태그 작성", color: "bg-green-100 text-green-700" },
  { id: "scheduled", label: "업로드 예약", color: "bg-pink-100 text-pink-700" },
  { id: "done", label: "완료", color: "bg-emerald-100 text-emerald-700" },
] as const;

export type StageId = (typeof WORKFLOW_STAGES)[number]["id"];
