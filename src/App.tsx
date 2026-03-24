import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
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
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
