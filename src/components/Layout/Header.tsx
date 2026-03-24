import { useLocation } from 'react-router-dom';
import { formatDateDisplay } from '../../utils/helpers';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: '' },
  '/life-compass': { title: 'Life Compass', subtitle: '' },
  '/annual-goals': { title: 'Annual', subtitle: '' },
  '/monthly-plan': { title: 'Monthly', subtitle: '' },
  '/weekly-plan': { title: 'Weekly', subtitle: '' },
  '/daily-plan': { title: 'Daily', subtitle: '' },
  '/time-block': { title: 'Time Block', subtitle: '' },
  '/miracle21': { title: 'Miracle 21', subtitle: '' },
  '/mind-map': { title: 'Mind Map', subtitle: '' },
  '/domain-tracker': { title: 'Domain Tracker', subtitle: '' },
};

export default function Header() {
  const location = useLocation();
  const info = routeTitles[location.pathname] ?? { title: "My Life's Control Tower", subtitle: '' };
  const today = formatDateDisplay(new Date());

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{info.title}</h1>
        {info.subtitle && <p className="text-xs text-slate-500">{info.subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-700">{today}</div>
          <div className="text-xs text-slate-400">Today</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
}
