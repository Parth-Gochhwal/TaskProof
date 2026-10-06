import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, MetricCard } from '../../components/ui/index';
import { DEMO_BUSINESS_ANALYTICS } from '../../data/seed';
import { TrendingUp, Users, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function BusinessAnalytics() {
  const analytics = DEMO_BUSINESS_ANALYTICS;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Analytics" subtitle="Demo data — illustrative prototype metrics" />

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Tasks Created" value={analytics.tasksCreated} icon={<Zap className="w-5 h-5" />} />
          <MetricCard label="Completion Rate" value={`${analytics.completionRate}%`} icon={<CheckCircle className="w-5 h-5" />} color="#16A34A" />
          <MetricCard label="Approval Rate" value={`${analytics.approvalRate}%`} icon={<TrendingUp className="w-5 h-5" />} color="#1A4B8F" />
          <MetricCard label="Avg Review Time" value={`${analytics.avgReviewTimeHours}h`} icon={<Clock className="w-5 h-5" />} color="#D97706" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Submissions Chart */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Daily Submissions</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.submissionsOverTime}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #D8DEE8', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#1A4B8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Approval Rate */}
          <GlassCard className="p-5">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Approval Rate Over Time (%)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.approvalRateOverTime}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[75, 100]} />
                <Tooltip contentStyle={{ background: 'white', border: '1px solid #D8DEE8', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="rate" stroke="#16A34A" strokeWidth={2} fill="url(#ag)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Submission Breakdown */}
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-[#0F172A] mb-5">Submission Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Submitted', value: analytics.totalSubmissions, color: '#1A4B8F', icon: <Users className="w-5 h-5" /> },
              { label: 'Approved', value: analytics.approved, color: '#16A34A', icon: <CheckCircle className="w-5 h-5" /> },
              { label: 'Rejected', value: analytics.rejected, color: '#DC2626', icon: <XCircle className="w-5 h-5" /> },
              { label: 'Under Review', value: analytics.underReview, color: '#D97706', icon: <Clock className="w-5 h-5" /> },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
                <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Approval bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-[#64748B] mb-2">
              <span>Approval Rate</span>
              <span className="font-medium text-[#1A4B8F]">{analytics.approvalRate}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#E6E9EF' }}>
              <div className="h-full rounded-full" style={{ width: `${analytics.approvalRate}%`, background: 'linear-gradient(90deg, #1A4B8F 0%, #4F78B4 100%)' }} />
            </div>
          </div>
        </GlassCard>

        <p className="text-xs text-center text-[#94A3B8] mt-4">
          Demo data — illustrative metrics for prototype demonstration.
        </p>
      </div>
    </AppShell>
  );
}
