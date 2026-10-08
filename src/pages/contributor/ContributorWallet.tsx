import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Shield, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Button, Modal } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { RewardLedger } from '../../services/ledgerService';
import type { Transaction, RewardProof } from '../../types/models';
import { useApi } from '../../hooks/useApi';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function TxRow({ tx, onViewProof }: { tx: Transaction; onViewProof: (tx: Transaction) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card overflow-hidden">
      <button
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#F5F7FA]/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
            ${tx.direction === 'credit' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
            {tx.direction === 'credit' ? '+' : '−'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{tx.label}</p>
            {tx.taskTitle && <p className="text-xs text-[#64748B]">{tx.taskTitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-sm font-bold ${tx.direction === 'credit' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {tx.direction === 'credit' ? '+' : '−'}{tx.amount} TCR
            </p>
            <p className="text-xs text-[#94A3B8]">{formatDate(tx.timestamp)}</p>
          </div>
          {tx.proofHash && <Shield className="w-4 h-4 text-[#1A4B8F]" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-4 border-t border-[#D8DEE8]/50"
        >
          <div className="pt-4 space-y-2">
            {[
              { label: 'Transaction ID', value: tx.id },
              { label: 'Type', value: tx.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) },
              { label: 'Network', value: tx.network },
              { label: 'Status', value: tx.status },
              { label: 'Proof Hash', value: tx.proofHash || 'N/A' },
              { label: 'Timestamp', value: new Date(tx.timestamp).toLocaleString() },
            ].map(item => (
              <div key={item.label} className="flex justify-between gap-4 text-sm">
                <span className="text-[#64748B]">{item.label}</span>
                <span className="font-medium text-[#0F172A] text-right font-mono text-xs">{item.value}</span>
              </div>
            ))}
            {tx.proofHash && (
              <div className="flex items-center gap-2 pt-2">
                <Shield className="w-3.5 h-3.5 text-[#1A4B8F]" />
                <span className="text-xs font-medium text-[#1A4B8F]">On-chain Verified · TaskProof Local Network</span>
                <Button variant="ghost" size="sm" onClick={() => onViewProof(tx)} className="ml-auto text-xs py-1 h-7">View Proof</Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function ContributorWallet() {
  const { balance } = useAuth();
  const [proofModal, setProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<RewardProof | null>(null);

  const { data: walletData, isLoading } = useApi(() => RewardLedger.getWallet());
  const transactions = walletData?.transactions || [];
  const totalEarned = walletData?.totalEarned || 0;

  const handleViewProof = async (tx: Transaction) => {
    let proof = await RewardLedger.getProof(tx.id);
    if (!proof) {
      proof = {
        transactionId: tx.id,
        taskId: tx.taskId || '',
        submissionId: tx.submissionId || '',
        contributorId: '',
        businessId: 'mock-business',
        reward: tx.amount,
        timestamp: tx.timestamp,
        proofHash: tx.proofHash || '',
        network: tx.network,
        status: 'verified',
        blockNumber: 123456
      };
    }
    setSelectedProof(proof);
    setProofModal(true);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Wallet" subtitle="Demo Credits — No Monetary Value" />

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-6 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A4B8F 0%, #4F78B4 100%)' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full" style={{ background: 'white', transform: 'translate(-20%, 20%)' }} />
          </div>
          <div className="relative">
            <p className="text-white/60 text-sm mb-2">Total Balance</p>
            <p className="text-5xl font-black text-white mb-1">{balance.toLocaleString()}</p>
            <p className="text-white/80 text-lg font-medium mb-1">Task Credits (TCR)</p>
            <p className="text-white/40 text-xs mb-6">Demo Credits · No Monetary Value</p>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalEarned}</p>
                <p className="text-white/60 text-xs">Total Earned</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
                <p className="text-white/60 text-xs">Transactions</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{walletData?.address?.slice(0, 8) || '0x...3D2c'}</p>
                <p className="text-white/60 text-xs">Wallet</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Banner */}
        <GlassCard className="p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1FA] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1A4B8F]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Blockchain Verified</p>
              <p className="text-xs text-[#64748B]">All rewards are recorded on TaskProof Local Network</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
            View on Explorer
          </Button>
        </GlassCard>

        {/* Transactions */}
        <h2 className="text-base font-bold text-[#0F172A] mb-3">Transaction History</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A4B8F]" />
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <TxRow key={tx.id} tx={tx} onViewProof={handleViewProof} />
            ))}
          </div>
        )}

        <p className="text-xs text-center text-[#94A3B8] mt-6">
          TaskProof Local Network — Demo Environment · Proof is illustrative only
        </p>

        <Modal open={proofModal} onClose={() => setProofModal(false)} title="Reward Proof Details">
          {selectedProof && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Transaction ID</span>
                  <span className="font-mono text-[#0F172A] text-xs">{selectedProof.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Proof Hash</span>
                  <span className="font-mono text-[#1A4B8F] text-xs font-bold">{selectedProof.proofHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Network</span>
                  <span className="text-[#0F172A]">{selectedProof.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Block Number</span>
                  <span className="text-[#0F172A]">{selectedProof.blockNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Timestamp</span>
                  <span className="text-[#0F172A]">{new Date(selectedProof.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => setProofModal(false)}>Close</Button>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
