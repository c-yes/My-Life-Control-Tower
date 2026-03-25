export type Domain = 'output' | 'input' | 'system' | 'relation' | 'monetization' | 'care' | 'maintenance';

export const DOMAIN_CONFIG: Record<Domain, { label: string; labelKo: string; color: string; emoji: string }> = {
  output:       { label: 'Output',       labelKo: '만들기',  color: '#f472b6', emoji: '⚡' },
  input:        { label: 'Input',        labelKo: '배우기',  color: '#7D3C98', emoji: '📚' },
  system:       { label: 'System',       labelKo: '유지하기', color: '#6C7A89', emoji: '⚙️' },
  relation:     { label: 'Relation',     labelKo: '연결하기', color: '#FF7A5A', emoji: '🤝' },
  monetization: { label: 'Monetization', labelKo: '벌기',    color: '#D4AC0D', emoji: '💰' },
  care:         { label: 'Care',         labelKo: '돌보기',  color: '#52A97E', emoji: '💛' },
  maintenance:  { label: 'Maintenance',  labelKo: '관리하기', color: '#2C2C2C', emoji: '🔧' },
};

// Domains shown in Domain Tracker (excludes Maintenance)
export const TRACKER_DOMAINS: Domain[] = ['output', 'input', 'system', 'relation', 'monetization', 'care'];

export interface CoreValue {
  id: string;
  name: string;
  description: string;
}

export interface LifeCompassData {
  mission: string;
  vision: string;
  coreValues: CoreValue[];
  principles: string[];
}

export interface AnnualGoal {
  id: string;
  title: string;
  domain: Domain;
  description: string;
  progress: number;
  year: number;
  milestones: { id: string; title: string; completed: boolean }[];
}

export interface MonthlyGoal {
  id: string;
  title: string;
  domain: Domain;
  annualGoalId?: string;
  completed: boolean;
  year: number;
  month: number;
}

export interface WeeklyTask {
  id: string;
  title: string;
  domain: Domain;
  dayOfWeek: number;
  daysOfWeek?: number[]; // multi-day support; overrides dayOfWeek when set
  completed: boolean;
  year: number;
  week: number;
  monthlyGoalId?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  domain?: Domain;
  timeBlockId?: string;
}

export interface DailyPlanData {
  date: string;
  topPriorities: string[];
  topPriorityDone: boolean[];
  tasks: DailyTask[];
  gratitude: string;
  affirmation: string;
  reflection: string;
  mood: number;
  moodMemo?: string;
}

export interface TimeBlockData {
  id: string;
  date: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  title: string;
  domain?: Domain;
  color: string;
}

// ── Miracle 21 ───────────────────────────────────────────────────────────────

export interface Miracle21DayEntry {
  completed: boolean;
  note: string;
}

export interface Miracle21Step {
  id: string;
  goal: string;
  startDate: string; // YYYY-MM-DD
  days: Miracle21DayEntry[]; // always 21 entries
  feedback: string;
}

export interface Miracle21Habit {
  id: string;
  name: string;
  finalGoal: string;
  steps: Miracle21Step[];
}

// ── Mandalart Mind Map ───────────────────────────────────────────────────────

export interface MindMapData {
  id: string;
  title: string;
  cells: string[]; // 9 cells; index 4 = center (핵심 주제)
}

// ── Domain Tracker ───────────────────────────────────────────────────────────

export interface DomainEntry {
  date: string; // YYYY-MM-DD
  domain: Domain;
  note: string;
}

export interface DomainScore {
  domain: Domain;
  score: number;
  notes: string;
}

// Monthly Plan Items (written in Monthly Plan section, visible when creating weekly tasks)
export interface MonthlyPlanItem {
  id: string;
  year: number;
  month: number;
  title: string;
  completed: boolean;
}

// Weekly Plan Items (written in Weekly Goals section, visible when creating daily tasks)
export interface WeeklyPlanItem {
  id: string;
  year: number;
  week: number;
  title: string;
  completed: boolean;
}

// Wannabe List items
export interface WannabeItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  category?: string;
}

// Legacy habit (kept for backward compatibility)
export interface Habit {
  id: string;
  name: string;
  domain: Domain;
  startDate: string;
  completions: string[];
  color: string;
  icon: string;
}

// ── Prenatal Music Workflow ───────────────────────────────────────────────────

export type PrenatalStage =
  | 'planning'
  | 'prompt_writing'
  | 'music_production'
  | 'cover_image'
  | 'video_editing'
  | 'thumbnail'
  | 'description_tags'
  | 'scheduled'
  | 'done';

export interface PrenatalVideo {
  id: string;
  title: string;
  stage: PrenatalStage;
  uploadDate: string;       // YYYY-MM-DD
  referenceUrl: string;     // 참고 곡 URL
  conceptMemo: string;
  sunoStylePrompt: string;
  sunoLyricsPrompt: string;
  sunoSongUrl: string;
  coverImageUrl: string;
  youtubeUrl: string;
  createdAt: string;
}
