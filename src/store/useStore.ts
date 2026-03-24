import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LifeCompassData,
  AnnualGoal,
  MonthlyGoal,
  WeeklyTask,
  DailyPlanData,
  TimeBlockData,
  Habit,
  MindMapData,
  DomainScore,
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

  // Weekly Tasks
  weeklyTasks: WeeklyTask[];
  addWeeklyTask: (task: WeeklyTask) => void;
  updateWeeklyTask: (id: string, updates: Partial<WeeklyTask>) => void;
  deleteWeeklyTask: (id: string) => void;

  // Daily Plans
  dailyPlans: DailyPlanData[];
  upsertDailyPlan: (plan: DailyPlanData) => void;

  // Time Blocks
  timeBlocks: TimeBlockData[];
  addTimeBlock: (block: TimeBlockData) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlockData>) => void;
  deleteTimeBlock: (id: string) => void;

  // Habits (Miracle21)
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;

  // Mind Maps
  mindMaps: MindMapData[];
  addMindMap: (map: MindMapData) => void;
  updateMindMap: (id: string, updates: Partial<MindMapData>) => void;
  deleteMindMap: (id: string) => void;

  // Domain Scores
  domainScores: DomainScore[];
  updateDomainScore: (domain: Domain, score: number, notes: string) => void;
}

const defaultLifeCompass: LifeCompassData = {
  mission: '',
  vision: '',
  coreValues: [],
  principles: [],
};

const defaultDomainScores: DomainScore[] = [
  { domain: 'health', score: 5, notes: '' },
  { domain: 'relationships', score: 5, notes: '' },
  { domain: 'career', score: 5, notes: '' },
  { domain: 'finance', score: 5, notes: '' },
  { domain: 'growth', score: 5, notes: '' },
  { domain: 'recreation', score: 5, notes: '' },
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
          annualGoals: state.annualGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteAnnualGoal: (id) =>
        set((state) => ({
          annualGoals: state.annualGoals.filter((g) => g.id !== id),
        })),

      // Monthly Goals
      monthlyGoals: [],
      addMonthlyGoal: (goal) =>
        set((state) => ({ monthlyGoals: [...state.monthlyGoals, goal] })),
      updateMonthlyGoal: (id, updates) =>
        set((state) => ({
          monthlyGoals: state.monthlyGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteMonthlyGoal: (id) =>
        set((state) => ({
          monthlyGoals: state.monthlyGoals.filter((g) => g.id !== id),
        })),

      // Weekly Tasks
      weeklyTasks: [],
      addWeeklyTask: (task) =>
        set((state) => ({ weeklyTasks: [...state.weeklyTasks, task] })),
      updateWeeklyTask: (id, updates) =>
        set((state) => ({
          weeklyTasks: state.weeklyTasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteWeeklyTask: (id) =>
        set((state) => ({
          weeklyTasks: state.weeklyTasks.filter((t) => t.id !== id),
        })),

      // Daily Plans
      dailyPlans: [],
      upsertDailyPlan: (plan) =>
        set((state) => {
          const exists = state.dailyPlans.find((p) => p.date === plan.date);
          if (exists) {
            return {
              dailyPlans: state.dailyPlans.map((p) =>
                p.date === plan.date ? plan : p
              ),
            };
          }
          return { dailyPlans: [...state.dailyPlans, plan] };
        }),

      // Time Blocks
      timeBlocks: [],
      addTimeBlock: (block) =>
        set((state) => ({ timeBlocks: [...state.timeBlocks, block] })),
      updateTimeBlock: (id, updates) =>
        set((state) => ({
          timeBlocks: state.timeBlocks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      deleteTimeBlock: (id) =>
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((b) => b.id !== id),
        })),

      // Habits
      habits: [],
      addHabit: (habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
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

      // Mind Maps
      mindMaps: [],
      addMindMap: (map) =>
        set((state) => ({ mindMaps: [...state.mindMaps, map] })),
      updateMindMap: (id, updates) =>
        set((state) => ({
          mindMaps: state.mindMaps.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      deleteMindMap: (id) =>
        set((state) => ({
          mindMaps: state.mindMaps.filter((m) => m.id !== id),
        })),

      // Domain Scores
      domainScores: defaultDomainScores,
      updateDomainScore: (domain, score, notes) =>
        set((state) => ({
          domainScores: state.domainScores.map((ds) =>
            ds.domain === domain ? { ...ds, score, notes } : ds
          ),
        })),
    }),
    {
      name: 'life-control-tower-storage',
    }
  )
);
