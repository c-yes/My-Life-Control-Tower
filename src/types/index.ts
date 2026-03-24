export type Domain = 'health' | 'relationships' | 'career' | 'finance' | 'growth' | 'recreation';

export const DOMAIN_CONFIG: Record<Domain, { label: string; labelKo: string; color: string; emoji: string }> = {
  health: { label: 'Health', labelKo: '건강', color: '#10b981', emoji: '💪' },
  relationships: { label: 'Relationships', labelKo: '관계', color: '#f59e0b', emoji: '❤️' },
  career: { label: 'Career', labelKo: '커리어', color: '#3b82f6', emoji: '💼' },
  finance: { label: 'Finance', labelKo: '재무', color: '#8b5cf6', emoji: '💰' },
  growth: { label: 'Growth', labelKo: '성장', color: '#ec4899', emoji: '🌱' },
  recreation: { label: 'Recreation', labelKo: '여가', color: '#f97316', emoji: '🎯' },
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
  tasks: DailyTask[];
  gratitude: string;
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

export interface Habit {
  id: string;
  name: string;
  domain: Domain;
  startDate: string;
  completions: string[];
  color: string;
  icon: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
  x: number;
  y: number;
  color: string;
}

export interface MindMapData {
  id: string;
  title: string;
  nodes: MindMapNode[];
}

export interface DomainScore {
  domain: Domain;
  score: number;
  notes: string;
}
