import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Clock, TrendingUp, ArrowRight, Flame, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, MetricCard, SectionHeader, Button, ProgressBar } from '../../components/ui/index';
import { TaskCard } from '../../components/ui/TaskCard';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';
import { useApi } from '../../hooks/useApi';

export default function ContributorDashboard() {
  const { user, contributorProfile, balance } = useAuth();
  const navigate = useNavigate();

  const { data: allTasks = [], isLoading: tasksLoading } = useApi(() => taskService.getAll());
  const { data: mySubmissions = [], isLoading: subsLoading } = useApi(() => submissionService.getMine());

  const recommended = allTasks.slice(0, 4);
  const inReview = mySubmissions.filter(s => s.status === 'under_review').length;
  const completed = mySubmissions.filter(s => s.status === 'approved' || s.status === 'rewarded').length;

  const [hour] = useState(() => new Date().getHours());
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] || 'there';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A]">{greeting}, {firstName} 👋</h1>
            <p className="text-[#64748B] text-sm mt-1">Ready to complete some tasks?</p>
          </div>
          <div className="flex items-center gap-3">
            {contributorProfile && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
                <Flame className="w-4 h-4" />
                {contributorProfile.streak} day streak
              </div>
            )}
            <Button variant="primary" size="sm" icon={<Zap className="w-4 h-4" />} onClick={() => navigate('/app/contributor/tasks')}>
              Browse Tasks
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A4B8F 0%, #4F78B4 100%)' }}
        >
          <div className="absolute right-0 top-0 w-48 h-full opacity-10">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <circle cx="160" cy="40" r="80" fill="white" />
              <circle cx="40" cy="160" r="60" fill="white" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm mb-1">Your balance</p>
            <h2 className="text-4xl font-black text-white mb-1">{balance.toLocaleString()} <span className="text-2xl font-bold opacity-80">TCR</span></h2>
            <p className="text-white/50 text-xs mb-4">Demo Credits — No Monetary Value</p>
            <p className="text-white/90 text-base font-medium">Complete tasks. Earn rewards. Build your reputation.</p>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="TCR Balance" value={`${balance.toLocaleString()}`} sub="Demo Credits" icon={<Zap className="w-5 h-5" />} />
          <MetricCard label="Tasks Completed" value={subsLoading ? '...' : completed} sub="Approved & rewarded" icon={<CheckCircle className="w-5 h-5" />} color="#16A34A" />
          <MetricCard label="Under Review" value={subsLoading ? '...' : inReview} sub="Awaiting decision" icon={<Clock className="w-5 h-5" />} color="#D97706" />
          <MetricCard label="Total Earned" value={`${contributorProfile?.totalEarned.toLocaleString() || 0} TCR`} sub="All time" icon={<TrendingUp className="w-5 h-5" />} />
        </div>

        {/* Level Progress */}
        {contributorProfile && (
          <GlassCard className="p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A4B8F] flex items-center justify-center text-white font-bold">
                  {contributorProfile.level}
                </div>
                <div>
                  <p className="font-bold text-[#0F172A]">Level {contributorProfile.level} — {contributorProfile.levelName}</p>
                  <p className="text-xs text-[#64748B]">{contributorProfile.xp} / {contributorProfile.xpToNextLevel} XP to Level {contributorProfile.level + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1A4B8F]">{contributorProfile.qualityScore}%</p>
                <p className="text-xs text-[#94A3B8]">Quality Score</p>
              </div>
            </div>
            <ProgressBar value={contributorProfile.xp} max={contributorProfile.xpToNextLevel} />
          </GlassCard>
        )}

        {/* Recommended Tasks */}
        <div>
          <SectionHeader
            title="Recommended for You"
            subtitle="Tasks that match your skills"
            action={
              <Button variant="ghost" size="sm" iconRight={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/app/contributor/tasks')}>
                See All
              </Button>
            }
          />
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A4B8F]" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recommended.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
