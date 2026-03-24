import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import LifeCompass from './components/LifeCompass/LifeCompass';
import AnnualGoals from './components/Goals/AnnualGoals';
import MonthlyPlan from './components/Goals/MonthlyPlan';
import WeeklyPlan from './components/Goals/WeeklyPlan';
import DailyPlan from './components/Goals/DailyPlan';
import TimeBlock from './components/TimeBlock/TimeBlock';
import Miracle21 from './components/Miracle21/Miracle21';
import MindMap from './components/MindMap/MindMap';
import DomainTracker from './components/DomainTracker/DomainTracker';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-slate-100">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on mobile, static on desktop */}
        <div
          className={`
            fixed md:static inset-y-0 left-0 z-30 h-full
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:flex-shrink-0
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm text-slate-800">Life Control Tower</span>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/life-compass" element={<LifeCompass />} />
                <Route path="/annual-goals" element={<AnnualGoals />} />
                <Route path="/monthly-plan" element={<MonthlyPlan />} />
                <Route path="/weekly-plan" element={<WeeklyPlan />} />
                <Route path="/daily-plan" element={<DailyPlan />} />
                <Route path="/time-block" element={<TimeBlock />} />
                <Route path="/miracle21" element={<Miracle21 />} />
                <Route path="/mind-map" element={<MindMap />} />
                <Route path="/domain-tracker" element={<DomainTracker />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
