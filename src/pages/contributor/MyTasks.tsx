import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RotateCcw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Tabs, StatusBadge, RewardBadge, Button, EmptyState } from '../../components/ui/index';
import { submissionService } from '../../services/submissionService';
import type { Submission } from '../../types/models';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function SubmissionRow({ sub, onView }: { sub: Submission; onView: () => void }) {
  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-[#0F172A] truncate">{sub.taskTitle}</h3>
          <StatusBadge status={sub.status} />
        </div>
        <p className="text-xs text-[#94A3B8]">Submitted {formatDate(sub.submittedAt)}</p>
        {sub.review?.feedback && (
          <p className="text-xs text-[#DC2626] mt-1 bg-[#FEE2E2] px-2 py-1 rounded-lg">
            Feedback: {sub.review.feedback}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {sub.reward && <RewardBadge amount={sub.reward} />}
        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={onView}>
          View
        </Button>
      </div>
    </div>
  );
}

const TAB_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'rewarded', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
];

export default function MyTasks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<Submission | null>(null);

  const subs = submissionService.getByContributor('user-contributor-demo');

  const filtered = activeTab === 'all' ? subs : subs.filter(s => s.status === activeTab);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="My Tasks"
          subtitle={`${subs.length} submissions total`}
        />

        <div className="mb-5">
          <Tabs
            tabs={TAB_OPTIONS.map(t => ({
              ...t,
              count: t.id === 'all' ? subs.length : subs.filter(s => s.status === t.id).length
            }))}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {selected ? (
          /* Submission Detail View */
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-4">
              ← Back to list
            </Button>
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172A]">{selected.taskTitle}</h2>
                  <p className="text-sm text-[#64748B] mt-1">Submitted {formatDate(selected.submittedAt)}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Automated Checks */}
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Automated Pre-checks</h3>
              <div className="space-y-2 mb-5">
                {selected.automatedChecks.map(check => (
                  <div key={check.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                    <span className={`text-lg ${check.passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {check.passed ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{check.label}</p>
                      {check.detail && <p className="text-xs text-[#DC2626]">{check.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submitted data */}
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Submitted Answers</h3>
              <div className="space-y-2 mb-5">
                {Object.entries(selected.data).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-4 text-sm p-3 rounded-xl" style={{ background: '#F5F7FA' }}>
                    <span className="text-[#64748B] capitalize">{key}</span>
                    <span className="font-medium text-[#0F172A] text-right">{Array.isArray(val) ? val.join(', ') : val}</span>
                  </div>
                ))}
              </div>

              {/* Review */}
              {selected.review && (
                <>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-3">Review Decision</h3>
                  <div className={`p-4 rounded-xl mb-4 ${selected.review.status === 'approved' ? 'bg-[#DCFCE7] border border-[#BBF7D0]' : 'bg-[#FEE2E2] border border-[#FECACA]'}`}>
                    <p className={`font-semibold text-sm ${selected.review.status === 'approved' ? 'text-[#14532D]' : 'text-[#7F1D1D]'}`}>
                      {selected.review.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </p>
                    {selected.review.feedback && (
                      <p className="text-sm mt-1">{selected.review.feedback}</p>
                    )}
                  </div>
                </>
              )}

              {/* Reward */}
              {selected.reward && (
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#EBF1FA', border: '1px solid #BFDBFE' }}>
                  <div>
                    <p className="text-sm font-bold text-[#1A4B8F]">Reward Earned</p>
                    {selected.transactionId && <p className="text-xs text-[#94A3B8]">TX: {selected.transactionId}</p>}
                  </div>
                  <RewardBadge amount={selected.reward} size="md" />
                </div>
              )}

              {selected.status === 'rejected' && (
                <Button className="mt-4 w-full" variant="secondary" icon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => navigate(`/app/contributor/tasks/${selected.taskId}`)}>
                  Try Again
                </Button>
              )}
            </GlassCard>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No submissions here"
            description="Complete tasks to see them here."
            action={<Button onClick={() => navigate('/app/contributor/tasks')}>Browse Tasks</Button>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <SubmissionRow key={sub.id} sub={sub} onView={() => setSelected(sub)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
