export type Domain = 'output' | 'input' | 'system' | 'relation' | 'monetization' | 'care';

export const DOMAIN_CONFIG: Record<Domain, { label: string; labelKo: string; color: string; emoji: string }> = {
  output:       { label: 'Output',       labelKo: '만들기', color: '#F5B7B1', emoji: '⚡' },
  input:        { label: 'Input',        labelKo: '배우기', color: '#7D3C98', emoji: '📚' },
  system:       { label: 'System',       labelKo: '유지하기', color: '#6C7A89', emoji: '⚙️' },
  relation:     { label: 'Relation',     labelKo: '연결하기', color: '#FF7A5A', emoji: '🤝' },
  monetization: { label: 'Monetization', labelKo: '벌기',   color: '#F4D03F', emoji: '💰' },
  care:         { label: 'Care',         labelKo: '돌보기', color: '#7DCEA0', emoji: '💛' },
};

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
