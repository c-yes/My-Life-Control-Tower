import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/life-compass', label: 'Life Compass' },
  { path: '/annual-goals', label: 'Annual' },
  { path: '/monthly-plan', label: 'Monthly' },
  { path: '/weekly-plan', label: 'Weekly' },
  { path: '/daily-plan', label: 'Daily' },
  { path: '/time-block', label: 'Time Block' },
  { path: '/miracle21', label: 'Miracle 21' },
  { path: '/mind-map', label: 'Mind Map' },
  { path: '/domain-tracker', label: 'Domain Tracker' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="w-64 h-full flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500 flex items-center justify-center text-xl">
            🎯
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">My Life's</div>
            <div className="text-pink-400 font-medium text-xs">Control Tower</div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' active' : ''}`
            }
          >
            <div className="min-w-0">
              <div className="truncate">{item.label}</div>
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
