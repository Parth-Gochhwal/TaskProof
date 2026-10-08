import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Avatar, ProgressBar, Button, VerificationBadge } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { submissionService } from '../../services/submissionService';
import { RewardLedger } from '../../services/ledgerService';
import { useApi } from '../../hooks/useApi';

const iconMap: Record<string, string> = {
  Star: '⭐', Flame: '🔥', Trophy: '🏆', Compass: '🧭', ShieldCheck: '🛡️'
};

const rarityColors: Record<string, string> = {
  common: '#64748B',
  uncommon: '#16A34A',
  rare: '#1A4B8F',
  legendary: '#D97706',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ContributorProfile() {
  const { user, contributorProfile } = useAuth();

  const { data: mySubmissions = [], isLoading: subsLoading } = useApi(() => submissionService.getMine());
  const { data: walletData, isLoading: walletLoading } = useApi(() => RewardLedger.getWallet());

  if (!contributorProfile || !user) return null;

  const rewarded = mySubmissions.filter(s => s.status === 'rewarded' || s.status === 'approved');
  const transactions = walletData?.transactions || [];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader title="My Profile" subtitle="Your verified work history" />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-5">
            <GlassCard className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <Avatar name={user.name} size="xl" />
              </div>
              <h2 className="text-xl font-black text-[#0F172A] mb-0.5">{user.name}</h2>
              <p className="text-sm text-[#64748B] mb-2">@{contributorProfile.username}</p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <VerificationBadge />
                <span className="text-xs bg-[#EBF1FA] text-[#1A4B8F] px-2 py-0.5 rounded-full font-medium">
                  Level {contributorProfile.level}
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[#1A4B8F] flex items-center justify-center text-white text-2xl font-black mx-auto mb-2">
                {contributorProfile.level}
              </div>
              <p className="font-bold text-[#0F172A]">{contributorProfile.levelName}</p>
              <p className="text-xs text-[#64748B] mb-3">{contributorProfile.college}</p>

              {/* XP */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                  <span>{contributorProfile.xp.toLocaleString()} XP</span>
                  <span>{contributorProfile.xpToNextLevel.toLocaleString()} XP</span>
                </div>
                <ProgressBar value={contributorProfile.xp} max={contributorProfile.xpToNextLevel} />
                <p className="text-xs text-[#94A3B8] mt-1">
                  {contributorProfile.xpToNextLevel - contributorProfile.xp} XP to Level {contributorProfile.level + 1}
                </p>
              </div>

              <Button variant="secondary" size="sm" className="w-full">Edit Profile</Button>
            </GlassCard>

            {/* Stats */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Stats</h3>
              <div className="space-y-2">
                {[
                  { label: 'Tasks Completed', value: contributorProfile.tasksCompleted },
                  { label: 'Quality Score', value: `${contributorProfile.qualityScore}%` },
                  { label: 'Rating', value: `${contributorProfile.rating}/5.0 ⭐` },
                  { label: 'Total Earned', value: `${contributorProfile.totalEarned.toLocaleString()} TCR` },
                  { label: 'Active Streak', value: `${contributorProfile.streak} days 🔥` },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{stat.label}</span>
                    <span className="font-semibold text-[#0F172A]">{stat.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Skills */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {contributorProfile.skills.map(skill => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Achievements */}
            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-[#0F172A] mb-4">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {contributorProfile.badges?.map(badge => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ y: -2 }}
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: `${rarityColors[badge.rarity]}10`,
                      border: `1px solid ${rarityColors[badge.rarity]}30`
                    }}
                  >
                    <div className="text-2xl mb-1">{iconMap[badge.icon] || '🏅'}</div>
                    <p className="text-xs font-bold text-[#0F172A]">{badge.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs mt-1" style={{ color: rarityColors[badge.rarity] }}>
                        {formatDate(badge.earnedAt)}
                      </p>
                    )}
                    <span className="text-xs capitalize font-medium" style={{ color: rarityColors[badge.rarity] }}>
                      {badge.rarity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Verified Work History */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1A4B8F]" />
                  <h2 className="text-base font-bold text-[#0F172A]">Verified Work History</h2>
                </div>
                <span className="text-xs text-[#94A3B8]">{subsLoading ? '...' : rewarded.length} entries</span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">
                Each approved task contributes to your tamper-proof work history.
              </p>

              {subsLoading || walletLoading ? (
                 <div className="flex justify-center py-8">
                   <Loader2 className="w-8 h-8 animate-spin text-[#1A4B8F]" />
                 </div>
              ) : (
                <div className="space-y-3">
                  {rewarded.map(sub => {
                    const tx = transactions.find(t => t.submissionId === sub.id);
                    return (
                      <div key={sub.id} className="p-4 rounded-xl" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A]">{sub.taskTitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                              <span className="text-xs text-[#16A34A] font-medium">Verified</span>
                              <span className="text-xs text-[#94A3B8]">·</span>
                              <Clock className="w-3 h-3 text-[#94A3B8]" />
                              <span className="text-xs text-[#94A3B8]">{formatDate(sub.submittedAt)}</span>
                            </div>
                            {tx?.proofHash && (
                              <p className="text-xs text-[#94A3B8] font-mono mt-1">Proof: {tx.proofHash}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-bold text-[#1A4B8F]">+{sub.reward || 0} TCR</span>
                            {sub.review?.reviewedAt && (
                              <p className="text-xs text-[#94A3B8]">{formatDate(sub.review.reviewedAt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {rewarded.length === 0 && (
                    <p className="text-sm text-[#94A3B8] text-center py-6">
                      Complete and get tasks approved to build your work history.
                    </p>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
