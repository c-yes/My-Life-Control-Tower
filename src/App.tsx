import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
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
import WannabeList from './components/WannabeList/WannabeList';
import Achievements from './components/Achievements/Achievements';
import { useAuth } from './hooks/useAuth';
import { useFirebaseSync } from './hooks/useFirebaseSync';

function AppInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, authError, signInWithGoogle, logout } = useAuth();
  useFirebaseSync(user);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-slate-500 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
          <div className="w-14 h-14 rounded-xl bg-pink-500 flex items-center justify-center text-3xl">🎯</div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">My Life's Control Tower</h1>
            <p className="text-sm text-slate-500 mt-1">기기 간 동기화를 위해 로그인하세요</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google로 로그인
          </button>
          {authError && (
            <p className="text-xs text-red-500 text-center break-all">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm text-slate-800">Life Control Tower</span>
          </div>
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
            )}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Desktop header - user info */}
        <header className="hidden md:flex items-center justify-end px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0 gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" />
          )}
          <span className="text-sm text-slate-600">{user.displayName}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            title="로그아웃"
          >
            <LogOut size={14} />
            로그아웃
          </button>
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
              <Route path="/wannabe-list" element={<WannabeList />} />
              <Route path="/achievements" element={<Achievements />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
