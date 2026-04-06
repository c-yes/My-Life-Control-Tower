import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LifeCompassData,
  AnnualGoal,
  MonthlyGoal,
  MonthlyPlanItem,
  WeeklyTask,
  WeeklyPlanItem,
  DailyPlanData,
  TimeBlockData,
  Habit,
  MindMapData,
  MindMapDocument,
  DomainScore,
  DomainEntry,
  Miracle21Habit,
  WannabeItem,
  Domain,
} from '../types';

interface AppState {
  // Life Compass
  lifeCompass: LifeCompassData;
  updateLifeCompass: (data: Partial<LifeCompassData>) => void;

  // Annual Goals
  annualGoals: AnnualGoal[];
  addAnnualGoal: (goal: AnnualGoal) => void;
  updateAnnualGoal: (id: string, updates: Partial<AnnualGoal>) => void;
  deleteAnnualGoal: (id: string) => void;

  // Monthly Goals
  monthlyGoals: MonthlyGoal[];
  addMonthlyGoal: (goal: MonthlyGoal) => void;
  updateMonthlyGoal: (id: string, updates: Partial<MonthlyGoal>) => void;
  deleteMonthlyGoal: (id: string) => void;

  // Monthly Plan Items
  monthlyPlanItems: MonthlyPlanItem[];
  addMonthlyPlanItem: (item: MonthlyPlanItem) => void;
  updateMonthlyPlanItem: (id: string, updates: Partial<MonthlyPlanItem>) => void;
  deleteMonthlyPlanItem: (id: string) => void;

  // Weekly Tasks
  weeklyTasks: WeeklyTask[];
  addWeeklyTask: (task: WeeklyTask) => void;
  updateWeeklyTask: (id: string, updates: Partial<WeeklyTask>) => void;
  deleteWeeklyTask: (id: string) => void;

  // Weekly Plan Items (goals written in Weekly Goals section)
  weeklyPlanItems: WeeklyPlanItem[];
  addWeeklyPlanItem: (item: WeeklyPlanItem) => void;
  updateWeeklyPlanItem: (id: string, updates: Partial<WeeklyPlanItem>) => void;
  deleteWeeklyPlanItem: (id: string) => void;

  // Daily Plans
  dailyPlans: DailyPlanData[];
  upsertDailyPlan: (plan: DailyPlanData) => void;

  // Time Blocks
  timeBlocks: TimeBlockData[];
  addTimeBlock: (block: TimeBlockData) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlockData>) => void;
  deleteTimeBlock: (id: string) => void;

  // Miracle 21
  miracle21Habits: Miracle21Habit[];
  addMiracle21Habit: (habit: Miracle21Habit) => void;
  updateMiracle21Habit: (id: string, updates: Partial<Miracle21Habit>) => void;
  deleteMiracle21Habit: (id: string) => void;

  // Legacy habits (unused by UI, kept so old data survives)
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;

  // Mandalart
  mindMaps: MindMapData[];
  addMindMap: (map: MindMapData) => void;
  updateMindMap: (id: string, updates: Partial<MindMapData>) => void;
  deleteMindMap: (id: string) => void;

  // Mind Map (tree)
  mindMapDocs: MindMapDocument[];
  addMindMapDoc: (doc: MindMapDocument) => void;
  updateMindMapDoc: (id: string, updates: Partial<MindMapDocument>) => void;
  deleteMindMapDoc: (id: string) => void;

  // Domain Tracker entries (weekly table)
  domainEntries: DomainEntry[];
  upsertDomainEntry: (date: string, domain: Domain, note: string) => void;

  // Domain Scores (kept for Dashboard avg score)
  domainScores: DomainScore[];
  updateDomainScore: (domain: Domain, score: number, notes: string) => void;

  // Wannabe List
  wannabeItems: WannabeItem[];
  addWannabeItem: (item: WannabeItem) => void;
  updateWannabeItem: (id: string, updates: Partial<WannabeItem>) => void;
  deleteWannabeItem: (id: string) => void;

  // Time Block Memos: key = "${date}__${hour}"
  timeBlockMemos: Record<string, string>;
  setTimeBlockMemo: (date: string, hour: number, memo: string) => void;

  // Self Feedbacks: key = "${year}" / "${year}-${month}" / "${year}-${week}"
  annualFeedbacks: Record<string, string>;
  monthlyFeedbacks: Record<string, string>;
  weeklyFeedbacks: Record<string, string>;
  setAnnualFeedback: (year: number, text: string) => void;
  setMonthlyFeedback: (year: number, month: number, text: string) => void;
  setWeeklyFeedback: (year: number, week: number, text: string) => void;
}

const defaultLifeCompass: LifeCompassData = {
  mission: '',
  vision: '',
  coreValues: [],
  principles: [],
  roles: [],
};

const defaultDomainScores: DomainScore[] = [
  { domain: 'output',       score: 5, notes: '' },
  { domain: 'input',        score: 5, notes: '' },
  { domain: 'system',       score: 5, notes: '' },
  { domain: 'relation',     score: 5, notes: '' },
  { domain: 'monetization', score: 5, notes: '' },
  { domain: 'care',         score: 5, notes: '' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Life Compass
      lifeCompass: defaultLifeCompass,
      updateLifeCompass: (data) =>
        set((state) => ({ lifeCompass: { ...state.lifeCompass, ...data } })),

      // Annual Goals
      annualGoals: [],
      addAnnualGoal: (goal) =>
        set((state) => ({ annualGoals: [...state.annualGoals, goal] })),
      updateAnnualGoal: (id, updates) =>
        set((state) => ({
          annualGoals: state.annualGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteAnnualGoal: (id) =>
        set((state) => ({ annualGoals: state.annualGoals.filter((g) => g.id !== id) })),

      // Monthly Goals
      monthlyGoals: [],
      addMonthlyGoal: (goal) =>
        set((state) => ({ monthlyGoals: [...state.monthlyGoals, goal] })),
      updateMonthlyGoal: (id, updates) =>
        set((state) => ({
          monthlyGoals: state.monthlyGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      deleteMonthlyGoal: (id) =>
        set((state) => ({ monthlyGoals: state.monthlyGoals.filter((g) => g.id !== id) })),

      // Monthly Plan Items
      monthlyPlanItems: [],
      addMonthlyPlanItem: (item) =>
        set((state) => ({ monthlyPlanItems: [...state.monthlyPlanItems, item] })),
      updateMonthlyPlanItem: (id, updates) =>
        set((state) => ({
          monthlyPlanItems: state.monthlyPlanItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteMonthlyPlanItem: (id) =>
        set((state) => ({ monthlyPlanItems: state.monthlyPlanItems.filter((i) => i.id !== id) })),

      // Weekly Tasks
      weeklyTasks: [],
      addWeeklyTask: (task) =>
        set((state) => ({ weeklyTasks: [...state.weeklyTasks, task] })),
      updateWeeklyTask: (id, updates) =>
        set((state) => ({
          weeklyTasks: state.weeklyTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteWeeklyTask: (id) =>
        set((state) => ({ weeklyTasks: state.weeklyTasks.filter((t) => t.id !== id) })),

      // Weekly Plan Items
      weeklyPlanItems: [],
      addWeeklyPlanItem: (item) =>
        set((state) => ({ weeklyPlanItems: [...state.weeklyPlanItems, item] })),
      updateWeeklyPlanItem: (id, updates) =>
        set((state) => ({
          weeklyPlanItems: state.weeklyPlanItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteWeeklyPlanItem: (id) =>
        set((state) => ({ weeklyPlanItems: state.weeklyPlanItems.filter((i) => i.id !== id) })),

      // Daily Plans
      dailyPlans: [],
      upsertDailyPlan: (plan) =>
        set((state) => {
          const exists = state.dailyPlans.find((p) => p.date === plan.date);
          if (exists) {
            return { dailyPlans: state.dailyPlans.map((p) => (p.date === plan.date ? plan : p)) };
          }
          return { dailyPlans: [...state.dailyPlans, plan] };
        }),

      // Time Blocks
      timeBlocks: [],
      addTimeBlock: (block) =>
        set((state) => ({ timeBlocks: [...state.timeBlocks, block] })),
      updateTimeBlock: (id, updates) =>
        set((state) => ({
          timeBlocks: state.timeBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteTimeBlock: (id) =>
        set((state) => ({ timeBlocks: state.timeBlocks.filter((b) => b.id !== id) })),

      // Miracle 21
      miracle21Habits: [],
      addMiracle21Habit: (habit) =>
        set((state) => ({ miracle21Habits: [...state.miracle21Habits, habit] })),
      updateMiracle21Habit: (id, updates) =>
        set((state) => ({
          miracle21Habits: state.miracle21Habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
      deleteMiracle21Habit: (id) =>
        set((state) => ({
          miracle21Habits: state.miracle21Habits.filter((h) => h.id !== id),
        })),

      // Legacy habits
      habits: [],
      addHabit: (habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      deleteHabit: (id) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
      toggleHabitCompletion: (habitId, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const completions = h.completions.includes(date)
              ? h.completions.filter((d) => d !== date)
              : [...h.completions, date];
            return { ...h, completions };
          }),
        })),

      // Mandalart
      mindMaps: [],
      addMindMap: (map) =>
        set((state) => ({ mindMaps: [...state.mindMaps, map] })),
      updateMindMap: (id, updates) =>
        set((state) => ({
          mindMaps: state.mindMaps.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMindMap: (id) =>
        set((state) => ({ mindMaps: state.mindMaps.filter((m) => m.id !== id) })),

      // Mind Map (tree)
      mindMapDocs: [],
      addMindMapDoc: (doc) =>
        set((state) => ({ mindMapDocs: [...state.mindMapDocs, doc] })),
      updateMindMapDoc: (id, updates) =>
        set((state) => ({
          mindMapDocs: state.mindMapDocs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      deleteMindMapDoc: (id) =>
        set((state) => ({ mindMapDocs: state.mindMapDocs.filter((d) => d.id !== id) })),

      // Domain Tracker entries
      domainEntries: [],
      upsertDomainEntry: (date, domain, note) =>
        set((state) => {
          const exists = state.domainEntries.find(
            (e) => e.date === date && e.domain === domain
          );
          if (exists) {
            return {
              domainEntries: state.domainEntries.map((e) =>
                e.date === date && e.domain === domain ? { ...e, note } : e
              ),
            };
          }
          return { domainEntries: [...state.domainEntries, { date, domain, note }] };
        }),

      // Domain Scores
      domainScores: defaultDomainScores,
      updateDomainScore: (domain, score, notes) =>
        set((state) => ({
          domainScores: state.domainScores.map((ds) =>
            ds.domain === domain ? { ...ds, score, notes } : ds
          ),
        })),

      // Wannabe Items
      wannabeItems: [],
      addWannabeItem: (item) =>
        set((state) => ({ wannabeItems: [...state.wannabeItems, item] })),
      updateWannabeItem: (id, updates) =>
        set((state) => ({
          wannabeItems: state.wannabeItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteWannabeItem: (id) =>
        set((state) => ({ wannabeItems: state.wannabeItems.filter((i) => i.id !== id) })),

      // Time Block Memos
      timeBlockMemos: {},
      setTimeBlockMemo: (date, hour, memo) =>
        set((state) => ({
          timeBlockMemos: { ...state.timeBlockMemos, [`${date}__${hour}`]: memo },
        })),

      // Self Feedbacks
      annualFeedbacks: {},
      monthlyFeedbacks: {},
      weeklyFeedbacks: {},
      setAnnualFeedback: (year, text) =>
        set((state) => ({ annualFeedbacks: { ...state.annualFeedbacks, [`${year}`]: text } })),
      setMonthlyFeedback: (year, month, text) =>
        set((state) => ({ monthlyFeedbacks: { ...state.monthlyFeedbacks, [`${year}-${month}`]: text } })),
      setWeeklyFeedback: (year, week, text) =>
        set((state) => ({ weeklyFeedbacks: { ...state.weeklyFeedbacks, [`${year}-${week}`]: text } })),
    }),
    {
      name: 'life-control-tower-storage',
    }
  )
);
