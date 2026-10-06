import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Clock, FileText, TrendingUp, Zap } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, MetricCard, SectionHeader, Button, StatusBadge } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';
import { DEMO_BUSINESS_ANALYTICS } from '../../data/seed';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const tasks = taskService.getByBusiness('user-business-demo');
  const taskIds = tasks.map(t => t.id);
  const allSubs = submissionService.getAll().filter(s => taskIds.includes(s.taskId));
  const pendingReview = allSubs.filter(s => s.status === 'under_review');
  const approved = allSubs.filter(s => s.status === 'rewarded');
  const analytics = DEMO_BUSINESS_ANALYTICS;
  const companyName = businessProfile?.companyName || 'Your Company';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A]">Welcome back, {companyName} 👋</h1>
            <p className="text-[#64748B] text-sm mt-1">Here's an overview of your tasks.</p>
          </div>
          <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/app/business/create-task')}>
            Create New Task
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Active Tasks" value={tasks.filter(t => t.status === 'active').length} sub="Running now" icon={<Zap className="w-5 h-5" />} />
          <MetricCard label="Total Submissions" value={allSubs.length} sub="All time" icon={<FileText className="w-5 h-5" />} />
          <MetricCard label="Approved" value={approved.length} sub="Rewarded" icon={<CheckCircle className="w-5 h-5" />} color="#16A34A" />
          <MetricCard label="Under Review" value={pendingReview.length} sub="Needs attention" icon={<Clock className="w-5 h-5" />} color="#D97706" />
        </div>

        {/* Chart + Recent submissions */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Chart */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Submissions Over Time</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={analytics.submissionsOverTime}>
                <defs>
                  <linearGradient id="submGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A4B8F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1A4B8F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #D8DEE8', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#1A4B8F" strokeWidth={2} fill="url(#submGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Approval Rate Chart */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Approval Rate (%)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={analytics.approvalRateOverTime}>
                <defs>
                  <linearGradient id="approvalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #D8DEE8', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="rate" stroke="#16A34A" strokeWidth={2} fill="url(#approvalGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Recent Submissions */}
        <SectionHeader
          title="Recent Submissions"
          subtitle="Needs your review"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/business/submissions')}>
              View All
            </Button>
          }
        />
        <GlassCard className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D8DEE8] grid grid-cols-12 text-xs font-medium text-[#64748B]">
            <span className="col-span-4">Contributor</span>
            <span className="col-span-3">Task</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Submitted</span>
            <span className="col-span-1">Action</span>
          </div>
          {allSubs.slice(0, 6).map(sub => (
            <div key={sub.id} className="px-5 py-3 border-b border-[#D8DEE8]/50 last:border-0 grid grid-cols-12 items-center hover:bg-[#F5F7FA] transition-colors">
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A4B8F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {sub.contributorName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{sub.contributorName}</p>
                  <p className="text-xs text-[#94A3B8]">Lv.{sub.contributorLevel}</p>
                </div>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-[#0F172A] truncate">{sub.taskTitle}</p>
              </div>
              <div className="col-span-2">
                <StatusBadge status={sub.status} />
              </div>
              <div className="col-span-2 text-xs text-[#94A3B8]">
                {formatDate(sub.submittedAt)}
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => navigate('/app/business/submissions')}
                  className="text-xs text-[#1A4B8F] font-medium hover:underline cursor-pointer"
                >
                  {sub.status === 'under_review' ? 'Review' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Approval Rate', value: `${analytics.approvalRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: '#16A34A' },
            { label: 'Avg Review Time', value: `${analytics.avgReviewTimeHours}h`, icon: <Clock className="w-4 h-4" />, color: '#D97706' },
            { label: 'Avg Reward', value: `${analytics.avgReward} TCR`, icon: <Zap className="w-4 h-4" />, color: '#1A4B8F' },
          ].map(stat => (
            <GlassCard key={stat.label} className="p-4 text-center">
              <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
              <p className="text-xl font-black text-[#0F172A]">{stat.value}</p>
              <p className="text-xs text-[#64748B]">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
