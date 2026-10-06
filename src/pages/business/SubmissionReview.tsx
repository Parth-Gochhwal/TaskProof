import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Button, StatusBadge, Tabs, Avatar, Modal, Textarea } from '../../components/ui/index';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';
import type { Submission } from '../../types/models';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'under_review', label: 'Needs Review' },
  { id: 'rewarded', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

function SubmissionDetail({ sub, onApprove, onReject }: {
  sub: Submission;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) {
  const [rejectModal, setRejectModal] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">{sub.taskTitle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Avatar name={sub.contributorName} size="sm" />
            <div>
              <span className="text-sm text-[#0F172A]">{sub.contributorName}</span>
              <span className="text-xs text-[#94A3B8] ml-2">Level {sub.contributorLevel}</span>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">Submitted {formatDate(sub.submittedAt)}</p>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Automated Checks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#1A4B8F]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Automated Pre-checks</h3>
          <span className="text-xs text-[#94A3B8] bg-[#F5F7FA] px-2 py-0.5 rounded-full">AI-assisted verification</span>
        </div>
        <div className="space-y-2">
          {sub.automatedChecks.map(check => (
            <div key={check.id} className={`flex items-center gap-3 p-3 rounded-xl ${check.passed ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}
              style={{ border: `1px solid ${check.passed ? '#BBF7D0' : '#FECACA'}` }}>
              {check.passed ? <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" /> : <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />}
              <div>
                <p className="text-sm font-medium">{check.label}</p>
                {check.detail && <p className="text-xs text-[#DC2626]">{check.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Work */}
      <div>
        <h3 className="text-sm font-bold text-[#0F172A] mb-3">Submitted Answer</h3>
        <div className="space-y-2">
          {Object.entries(sub.data).map(([key, val]) => (
            val ? (
              <div key={key} className="p-3 rounded-xl" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                <p className="text-xs text-[#64748B] mb-1 capitalize">{key}</p>
                <p className="text-sm font-medium text-[#0F172A]">{Array.isArray(val) ? val.join(', ') : val}</p>
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* Review Actions */}
      {sub.status === 'under_review' && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="success"
            className="flex-1"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={onApprove}
          >
            Approve & Reward
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => setRejectModal(true)}
          >
            Reject
          </Button>
        </div>
      )}

      {/* Existing review */}
      {sub.review && sub.status !== 'under_review' && (
        <div className={`p-4 rounded-xl ${sub.review.status === 'approved' ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}
          style={{ border: `1px solid ${sub.review.status === 'approved' ? '#BBF7D0' : '#FECACA'}` }}>
          <p className={`font-semibold text-sm ${sub.review.status === 'approved' ? 'text-[#14532D]' : 'text-[#7F1D1D]'}`}>
            {sub.review.status === 'approved' ? '✓ Approved — Reward Released' : '✗ Rejected'}
          </p>
          {sub.reward && <p className="text-sm font-bold text-[#1A4B8F] mt-1">+{sub.reward} TCR released</p>}
          {sub.review.feedback && <p className="text-sm mt-1">{sub.review.feedback}</p>}
        </div>
      )}

      {/* Reject Modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Submission">
        <div className="space-y-4">
          <p className="text-sm text-[#64748B]">Please provide a reason for rejection. This will be shared with the contributor.</p>
          <Textarea
            label="Rejection Reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Required fields were incomplete. Minimum 3 comments were needed but only 1 was provided."
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={() => { onReject(reason); setRejectModal(false); }}>
              Reject Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SubmissionReview() {
  const [tab, setTab] = useState('under_review');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState<{ reward: number; proof: string } | null>(null);

  const taskIds = taskService.getByBusiness('user-business-demo').map(t => t.id);
  const [subs, setSubs] = useState(() => submissionService.getAll().filter(s => taskIds.includes(s.taskId)));

  const refresh = () => setSubs(submissionService.getAll().filter(s => taskIds.includes(s.taskId)));

  const filtered = tab === 'all' ? subs : subs.filter(s => s.status === tab);

  const handleApprove = (subId: string) => {
    const result = submissionService.approve(subId, 'user-business-demo');
    if (result.success) {
      refresh();
      const approvedSub = submissionService.getById(subId);
      setApprovalDetails({ reward: approvedSub?.reward || 50, proof: approvedSub?.transactionId || '' });
      setShowSuccess(true);
      setSelected(null);
    }
  };

  const handleReject = (subId: string, reason: string) => {
    submissionService.reject(subId, 'user-business-demo', reason);
    refresh();
    setSelected(null);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Submission Review" subtitle="Review and approve contributor work" />

        <div className="mb-5">
          <Tabs
            tabs={TABS.map(t => ({
              ...t,
              count: t.id === 'all' ? subs.length : subs.filter(s => s.status === t.id).length
            }))}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* Approval Success Banner */}
        <AnimatePresence>
          {showSuccess && approvalDetails && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 rounded-xl flex items-center justify-between gap-4"
              style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="text-sm font-bold text-[#14532D]">Submission verified · +{approvalDetails.reward} TCR released</p>
                  <p className="text-xs text-[#16A34A]">Reward proof recorded · {approvalDetails.proof}</p>
                </div>
              </div>
              <button onClick={() => setShowSuccess(false)} className="text-[#16A34A] opacity-60 hover:opacity-100 cursor-pointer">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {selected ? (
          <GlassCard className="p-6">
            <button onClick={() => setSelected(null)} className="text-sm text-[#64748B] hover:text-[#1A4B8F] mb-5 flex items-center gap-1.5 cursor-pointer">
              ← Back to list
            </button>
            <SubmissionDetail
              sub={selected}
              onApprove={() => handleApprove(selected.id)}
              onReject={(reason) => handleReject(selected.id, reason)}
            />
          </GlassCard>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <p className="text-[#94A3B8]">No submissions in this category.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <motion.div key={sub.id} whileHover={{ y: -1 }} onClick={() => setSelected(sub)}
                className="glass-card p-4 cursor-pointer hover:shadow-lg transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={sub.contributorName} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0F172A]">{sub.contributorName}</p>
                        <span className="text-xs text-[#94A3B8]">Lv.{sub.contributorLevel}</span>
                      </div>
                      <p className="text-xs text-[#64748B] truncate">{sub.taskTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs text-[#94A3B8] hidden sm:block">{formatDate(sub.submittedAt)}</p>
                    <StatusBadge status={sub.status} />
                    {sub.automatedChecks.every(c => c.passed) && (
                      <div title="All automated checks passed">
                        <Shield className="w-4 h-4 text-[#16A34A]" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
