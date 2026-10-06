import { useState } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Tabs, Avatar } from '../../components/ui/index';
import { SEED_LEADERBOARD } from '../../data/seed';

const TABS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const podiumColors = ['#D97706', '#94A3B8', '#B45309'];

export default function Leaderboard() {
  const [tab, setTab] = useState('all');

  const entries = SEED_LEADERBOARD;
  const top3 = entries.slice(0, 3);
  const currentUserEntry = entries.find(e => e.isCurrentUser);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Leaderboard" subtitle="Ranked by total TCR earned" />

        <div className="mb-6">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        {/* Current user rank banner */}
        {currentUserEntry && (
          <GlassCard className="p-4 mb-6 flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(26,75,143,0.06) 0%, rgba(255,255,255,0.7) 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1A4B8F] text-white flex items-center justify-center font-bold text-sm">
                #{currentUserEntry.rank}
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">Your current rank</p>
                <p className="text-xs text-[#64748B]">{currentUserEntry.totalEarned.toLocaleString()} TCR earned · {currentUserEntry.qualityScore}% quality</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#64748B]">Next level</p>
              <p className="text-sm font-bold text-[#1A4B8F]">Verified Specialist</p>
            </div>
          </GlassCard>
        )}

        {/* Podium */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
            if (!entry) return null;
            const rank = entry.rank;
            const icon = rank === 1 ? <Crown className="w-4 h-4" /> : rank === 2 ? <Medal className="w-4 h-4" /> : <Trophy className="w-4 h-4" />;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <div key={entry.userId} className={`glass-card flex flex-col items-center justify-end pb-4 pt-2 ${heights[podiumIdx]}`}
                style={entry.isCurrentUser ? { border: '2px solid #1A4B8F' } : {}}>
                <Avatar name={entry.name} size="sm" />
                <p className="text-xs font-bold text-[#0F172A] mt-1 text-center px-1">{entry.name.split(' ')[0]}</p>
                <div className="flex items-center gap-1 text-xs mt-1" style={{ color: podiumColors[podiumIdx] }}>
                  {icon} #{rank}
                </div>
                <p className="text-xs font-bold text-[#1A4B8F] mt-0.5">{entry.totalEarned.toLocaleString()} TCR</p>
              </div>
            );
          })}
        </div>

        {/* Ranking Table */}
        <GlassCard className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D8DEE8] grid grid-cols-12 text-xs font-medium text-[#64748B]">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Contributor</span>
            <span className="col-span-2 text-right">Tasks</span>
            <span className="col-span-2 text-right">Quality</span>
            <span className="col-span-2 text-right">TCR</span>
          </div>
          {entries.map(entry => (
            <div key={entry.userId}
              className={`px-5 py-3 border-b border-[#D8DEE8]/50 last:border-0 grid grid-cols-12 items-center
                ${entry.isCurrentUser ? 'bg-[#EBF1FA]' : 'hover:bg-[#F5F7FA]'} transition-colors`}>
              <span className="col-span-1 text-sm font-bold text-[#64748B]">
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </span>
              <div className="col-span-5 flex items-center gap-2">
                <Avatar name={entry.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-xs text-[#1A4B8F] ml-1">(You)</span>}
                  </p>
                  <p className="text-xs text-[#94A3B8]">Lv.{entry.level} {entry.levelName}</p>
                </div>
              </div>
              <span className="col-span-2 text-right text-sm font-medium text-[#0F172A]">{entry.tasksCompleted}</span>
              <span className="col-span-2 text-right text-sm font-medium text-[#16A34A]">{entry.qualityScore}%</span>
              <span className="col-span-2 text-right text-sm font-bold text-[#1A4B8F]">{entry.totalEarned.toLocaleString()}</span>
            </div>
          ))}
        </GlassCard>

        <p className="text-xs text-center text-[#94A3B8] mt-4">
          Leaderboard updates after task approval · Demo data
        </p>
      </div>
    </AppShell>
  );
}
