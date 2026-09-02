import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useStore } from '../../store/useStore';

const BACKUP_FIELDS = [
  'lifeCompass', 'annualGoals', 'monthlyGoals', 'monthlyPlanItems',
  'weeklyTasks', 'weeklyPlanItems', 'dailyPlans', 'timeBlocks', 'timeBlockMemos',
  'miracle21Habits', 'habits', 'mindMaps', 'mindMapDocs', 'domainEntries', 'domainScores',
  'wannabeItems', 'wannabeNotes', 'annualFeedbacks', 'monthlyFeedbacks', 'weeklyFeedbacks',
  'journalEntries', 'ddayItems',
] as const;

export default function DataBackup() {
  const store = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const data: Record<string, unknown> = { _exportedAt: new Date().toISOString() };
    for (const field of BACKUP_FIELDS) {
      data[field] = (store as unknown as Record<string, unknown>)[field];
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-control-tower-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const patch: Record<string, unknown> = {};
        for (const field of BACKUP_FIELDS) {
          if (data[field] !== undefined) patch[field] = data[field];
        }
        useStore.setState(patch);
        alert('백업 복원 완료!');
      } catch {
        alert('백업 파일을 읽을 수 없습니다.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleExport}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        title="데이터 백업 내보내기"
      >
        <Download size={16} />
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        title="백업에서 복원"
      >
        <Upload size={16} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
