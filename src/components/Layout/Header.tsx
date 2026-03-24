import { useLocation } from 'react-router-dom';
import { formatDateDisplay } from '../../utils/helpers';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: '대시보드 — 삶의 전체 현황' },
  '/life-compass': { title: 'Life Compass', subtitle: '삶의 나침반 — 미션, 비전, 핵심 가치' },
  '/annual-goals': { title: 'Annual Goals', subtitle: '연간 목표 — OKR 스타일 목표 관리' },
  '/monthly-plan': { title: 'Monthly Plan', subtitle: '월간 계획 — 이달의 목표와 계획' },
  '/weekly-plan': { title: 'Weekly Plan', subtitle: '주간 계획 — 이번 주 할 일' },
  '/daily-plan': { title: 'Daily Plan', subtitle: '일간 계획 — 오늘의 우선순위' },
  '/time-block': { title: 'Time Block', subtitle: '타임블록 — 시간 시각화 스케줄' },
  '/miracle21': { title: 'Miracle 21', subtitle: 'Miracle21 — 21일 습관 형성' },
  '/mind-map': { title: 'Mind Map', subtitle: '마인드맵 — 아이디어 시각화' },
  '/domain-tracker': { title: 'Domain Tracker', subtitle: '도메인 트래커 — 6가지 삶의 영역' },
};

export default function Header() {
  const location = useLocation();
  const info = routeTitles[location.pathname] ?? { title: 'My Life Control Tower', subtitle: '' };
  const today = formatDateDisplay(new Date());

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{info.title}</h1>
        <p className="text-xs text-slate-500">{info.subtitle}</p>
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
