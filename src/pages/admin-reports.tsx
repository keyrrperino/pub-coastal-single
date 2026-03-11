import { useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

interface LeaderboardEntry {
  teamName: string;
  score: number;
  country?: string;
  timestamp: number;
  submittedBy: string;
  roomId: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Builds CSV matching the Excel format in the design:
 *
 * ,Number of Plays,Scores for this Month,Countries of Players
 * January 2026,5,2460,Singapore
 * ,,1200,Philippines
 * ,,640,Hong Kong
 * ,,1230,
 * ,,469,
 */
function buildCSV(entries: LeaderboardEntry[], label: string): string {
  const scores = entries.map((e) => e.score);
  const countries = [...new Set(entries.map((e) => e.country ?? 'Unknown').filter(Boolean))];
  const rowCount = Math.max(scores.length, countries.length);

  const rows: string[][] = [];

  // Header row
  rows.push(['', 'Number of Plays', 'Scores for this Month', 'Countries of Players']);

  for (let i = 0; i < rowCount; i++) {
    const isFirst = i === 0;
    rows.push([
      isFirst ? label : '',
      isFirst ? String(entries.length) : '',
      scores[i] !== undefined ? String(scores[i]) : '',
      countries[i] ?? '',
    ]);
  }

  // Handle edge case: no entries
  if (entries.length === 0) {
    rows.push([label, '0', '', '']);
  }

  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(CURRENT_YEAR);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [reportLabel, setReportLabel] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setHasGenerated(false);
    try {
      const snapshot = await get(ref(database, 'global-leaderboard'));
      const label = `${MONTHS[month]} ${year}`;

      if (!snapshot.exists()) {
        setEntries([]);
        setReportLabel(label);
        setHasGenerated(true);
        return;
      }

      const all: LeaderboardEntry[] = Object.values(snapshot.val());
      const filtered = all
        .filter((e) => {
          const d = new Date(e.timestamp);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .sort((a, b) => b.score - a.score);

      setEntries(filtered);
      setReportLabel(label);
      setHasGenerated(true);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const csv = buildCSV(entries, reportLabel);
    triggerDownload(csv, `report-${MONTHS[month]}-${year}.csv`);
  };

  // Derived display data
  const uniqueCountries = [...new Set(entries.map((e) => e.country ?? 'Unknown'))];
  const rowCount = Math.max(entries.length, uniqueCountries.length);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Admin Reports</h1>
          <p className="text-xs text-white/40 mt-0.5">pub-coastal · Monthly Data Export</p>
        </div>
        <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-white/40 px-2 py-1 rounded">
          /admin-reports
        </span>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {/* Controls */}
        <div className="flex items-end gap-3 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i} className="bg-[#1c2128]">{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-[#1c2128]">{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Loading…' : 'Generate Report'}
          </button>
        </div>

        {/* Table */}
        {hasGenerated && (
          <div className="border border-white/10 rounded-xl overflow-hidden">
            {/* Bar above table */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/10">
              <span className="text-sm font-medium text-white/70">{reportLabel}</span>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download CSV
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="py-20 text-center text-white/30 text-sm">
                No data found for {reportLabel}
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-white/40 uppercase tracking-wider">
                    {/* Column A — empty header */}
                    <th className="border border-white/10 px-4 py-3 text-left font-medium w-36" />
                    <th className="border border-white/10 px-4 py-3 text-center font-medium">
                      Number of Plays
                    </th>
                    <th className="border border-white/10 px-4 py-3 text-center font-medium">
                      Scores for this Month
                    </th>
                    <th className="border border-white/10 px-4 py-3 text-center font-medium bg-[#1a2744]">
                      Countries of Players
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      {/* Column A: month label only on first row */}
                      <td className="border border-white/10 px-4 py-2.5 font-medium text-white/70 text-center">
                        {i === 0 ? reportLabel : ''}
                      </td>

                      {/* Column B: total play count only on first row */}
                      <td className="border border-white/10 px-4 py-2.5 text-center text-white/80">
                        {i === 0 ? entries.length : ''}
                      </td>

                      {/* Column C: score per row */}
                      <td className="border border-white/10 px-4 py-2.5 text-center font-mono text-blue-400">
                        {entries[i] ? entries[i].score.toLocaleString() : ''}
                      </td>

                      {/* Column D: unique countries */}
                      <td className="border border-white/10 px-4 py-2.5 text-center text-white/80 bg-[#111d33]">
                        {uniqueCountries[i] ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
