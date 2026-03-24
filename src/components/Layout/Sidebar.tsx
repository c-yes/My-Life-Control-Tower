import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', emoji: '🏠', label: 'Dashboard', labelKo: '대시보드' },
  { path: '/life-compass', emoji: '🧭', label: 'Life Compass', labelKo: '삶의 나침반' },
  { path: '/annual-goals', emoji: '🎯', label: 'Annual Goals', labelKo: '연간 목표' },
  { path: '/monthly-plan', emoji: '📅', label: 'Monthly Plan', labelKo: '월간 계획' },
  { path: '/weekly-plan', emoji: '📋', label: 'Weekly Plan', labelKo: '주간 계획' },
  { path: '/daily-plan', emoji: '✅', label: 'Daily Plan', labelKo: '일간 계획' },
  { path: '/time-block', emoji: '⏰', label: 'Time Block', labelKo: '타임블록' },
  { path: '/miracle21', emoji: '⭐', label: 'Miracle 21', labelKo: 'Miracle21' },
  { path: '/mind-map', emoji: '🧠', label: 'Mind Map', labelKo: '마인드맵' },
  { path: '/domain-tracker', emoji: '📊', label: 'Domain Tracker', labelKo: '도메인 트래커' },
];

export default function Sidebar() {
  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-xl">
            🗼
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">My Life</div>
            <div className="text-indigo-400 font-medium text-xs">Control Tower</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            <span className="text-lg leading-none">{item.emoji}</span>
            <div className="min-w-0">
              <div className="truncate">{item.label}</div>
              <div className="text-xs opacity-60 truncate">{item.labelKo}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="text-slate-500 text-xs text-center">
          Life Control Tower v0.1
        </div>
      </div>
    </div>
  );
}
